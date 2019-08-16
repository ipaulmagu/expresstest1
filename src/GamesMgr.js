const File = require("./AMFile");
const DefGames = require("./def-games");
const fs = require("fs");
const path = require("path");
const fetch_ = require("node-fetch");
const axios = require("axios");
const CfgLotteryUpdater = require("./lottoryUpdaterSchedule");

const log = console.log;

CONSTs = {
  cMin: 60 * 1000,
  cHour: 60 * this.cMin,
  cDay: 24 * this.cHour
};

class LocalStore {
  constructor(app, db) {
    this.app = app;
    this.app.localstore = this;
    this.store = db || localStorage;
  }
  getItem(key, defVal) {
    let ret = defVal || null;
    if (this.store) {
      let o = this.store.getItem(key);
      if (o) ret = o;
    }
    return ret;
  }
  setItem(key, v) {
    if (this.store) return this.store.setItem(key, v);
    return null;
  }
  removeItem(key) {
    if (this.store) return this.store.removeItem(key);
    return null;
  }
  clear() {
    if (this.store) this.store.clear;
  }
}

// var app = {
//   mgrDB: new DBMgr(app),
//   game: {},
//   localstore: new LocalStore(app, db),

//   db: { data, prob },
//   data: {}
// };

class GamesMgr {
  constructor(app) {
    this.DefGames = DefGames;
    // log("Lotteries:", this.DefGames);
    if (app) {
      this.app = app;
      this.app.mgrDB = this;
      this.app.DefGames = DefGames;
    }
    this.cfglu = CfgLotteryUpdater.read();
  }

  findGameById(gameid) {
    return this.DefGames.gamesById.get(gameid.toLowerCase());
  }

  retrieveFromStorage_(game, cb) {
    // retrieve data from storage if available and fresh
    let gameDataStoredObj = JSON.parse(this.app.localstore.getItem(game.id));
    if (gameDataStoredObj && gameDataStoredObj["data"] && gameDataStoredObj.data.length > 0) {
      let dtDif = new Date() - gameDataStoredObj.dt;
      if (dtDif / CONSTs.cHour < 2) return app.mgrDB._initNewData_(gameDataStoredObj.data, cb);
    }
    return false;
  }

  getData(gameid) {
    let need2Download = false;
    log(`getData '${gameid}'`);
    let odt = new Date(),
      dt = +odt;
    if (typeof gameid == "string") {
      need2Download = true;
      //gameid
      let game = this.findGameById(gameid);
      if (game) {
        gameid = game.id;

        // let s1 = path.join(__dirname, "../public");
        // let s2 = path.normalize(game.fname);
        // log(`path:${s1} - path.normalize:${s2}`);
        // let o = {
        //   exists: File.exists(game.fname),
        //   lines: File.readCSV(game.fname) | []
        // };
        // log(`[GamesMgr.getData] exists:${o.exists}, lines:#${o.lines.length}`);
        if (File.exists(game.fname)) {
          let dtLastUpdate = +this.cfglu.get(gameid);
          let stat = File.stat(game.fname);
          let mt = +Math.floor((dt - stat.mtime) / CONSTs.cMin),
            at = +Math.floor((dt - stat.atime) / CONSTs.cMin),
            ct = +Math.floor((dt - stat.ctime) / CONSTs.cMin),
            lut = +Math.floor((dt - dtLastUpdate) / CONSTs.cMin);
          log(`mt:${mt}, ct:${ct}, at: ${at}, lut: ${lut}`);
          if (mt < 60 /**|| lut < 60 */) {
            // log(`[GamesMgr.getData] reading ...${game.fname.substr(game.fname.length - 30, 50)}`);
            log(`[GamesMgr.getData] reading ...${game.fname}`);
            //if modified < 60 min ago read it. | redownload once/60 min at most.
            const lines = File.readCSV(game.fname);
            if (lines) {
              need2Download = false;
              return { status: 0, body: "[GamesMgr.getData]", msg: "success", params: { gameid }, data: lines };
            }
          }
        } else {
          log(`[GameMgr.getData] NO DATA FOUND! ('... ${game.fname.substr(game.fname.length - 30, 50)}') ***`);
        }
      }
    }
    if (need2Download) {
      // log("about 2 download " + gameid);
      log("[GamesMgr.getData].before downloadLottoData 0");
      const d = this.downloadLottoData(gameid);
      log("[GamesMgr.getData].after downloadLottoData 1");
      this.cfglu.set(gameid, dt);
      CfgLotteryUpdater.save(this.cfglu); //save lotteryUPdaterScheduler
      log("[GamesMgr.getData].after downloadLottoData 2");
      return d;
    }
  }

  /**
   *
   * @param {*} gameid
   * return {status: 0|-1, msg: "Message" | ErrorMsg, data: NULL | lines}
   * lines = array of fields. [[f1,f2,...f9], [f1,f2,...f9], ....]
   */
  async downloadLottoData(gameid) {
    // log(`in downloadLottoData (${gameid})...`);
    let game = this.findGameById(gameid);
    // log(`Game: ${game} (${!game})`);
    if (!game || !game.url) {
      log(`[GameMgr.downloadLottoData('${gameid}')] Invalid gameid`);
      // if (cb) cb({ status: -1, msg: "Invalid Game", data: null });
      // return;
      return { status: -1, msg: "Invalid Game", data: null };
    }
    let sURL = game.url;
    // sURL = "/imr/eoddata/lottery/daily3.txt";
    // log(`Downld ... ${sURL}`);
    log(`...Downloading ${sURL}`);
    // log(`[GameMgr.downloadLottoData('${gameid}')] DOWNLOADING... ${sURL}`);
    // log(`[GameMgr.downloadLottoData('${gameid}')] ... ${sURL.substr(sURL.length - 40, 50)}`);
    // try {
    //   const dogsresp = await fetch_("https://dog.ceo/api/breeds/list/all");
    //   const dogs = await dogsresp.json();
    //   console.log(`Fetched dogs:\n${JSON.stringify(dogs)}`);
    // } catch (error) {
    //   console.error("Dogs.error", error);
    // }
    // log(`***After dogs are fetched`);
    let txt = null;
    try {
      // log("Pre Fetch ...");
      // const resp = await axios.get(sURL);
      // txt = resp.data;
      const resp = await fetch_(sURL);
      // log(`[GameMgr.downloadLottoData('${gameid}')] FETCHED...`);
      log("...toText()");
      txt = await resp.text();
      // let sContType = (resp.headers["content-type"] || "").toLowerCase();
      // let isJson = sContType.indexOf("/json") >= 0 || sContType.indexOf("json/") > 0 || sContType.indexOf("json") > 0;
      // try {
      // log("parsing...", txt.substr(0, 400));
      // } catch (err2) {
      //   console.error(`[GameMgr.downloadLottoData('${gameid}')] Error Parsing:'${err2}'`);
      //   return { status: -12, body: "GamesMgr:Error", msg: "Failed:" + err2, params: { gameid }, data: null };
      // }
    } catch (err1) {
      // console.error(`***** [GameMgr.downloadLottoData('${gameid}')] Error`);
      console.error(`[GameMgr.downloadLottoData('${gameid}')] ERROR Fetching:'${err1}'`);
      return {
        status: -11,
        body: "GamesMgr.downloadLottoData.Error",
        msg: "Failed:" + err1.toString(),
        params: { gameid },
        data: null
      };
    }
    // log(`[GameMgr.downloadLottoData('${gameid}')] PARSING...`);
    log("...Parsing");

    // log("parsing...", txt.substr(0, 400));
    // .then(res => {
    //   // log(`Fetch Received data`);
    //   // log(res)
    //   return res.text();
    // })
    // .then(txt =>{

    let iStartPos = -1,
      iCntFields = -1;
    let lines = [];
    txt.split("\n").forEach((aline, idx) => {
      if (iStartPos < 0) {
        let i = aline.indexOf("-------- ");
        if (i >= 0) {
          iStartPos = i + 11;
          iCntFields = aline.trim().split(/\s+/g).length;
        }
        return;
      }
      aline = aline.trim();
      if (aline.length < 1) return; //skip empty lines
      var fields = aline.split(/\s{2,}/g).filter((v, i) => i > 0); //[date, n, n, n, ...]
      fields = fields.map((n, i) => Number.parseInt(i == 0 ? +Date.parse(n) : n));
      lines.push(fields);
    });
    // log(
    //   `[GameMgr.downloadLottoData('${gameid}')] Saving ('${lines.length}' lines)-${game.fname.substr(
    //     game.fname.length - 30,
    //     50
    //   )}`
    // );
    log(`...Saving ('${lines.length}' lines)-${game.fname.substr(game.fname.length - 30, 50)}`);

    // log("Saving to: ... " + game.fname + " (" + lines.length + " lines)");
    // let f2 = "./../public/data/" + path.basename(game.fname);
    // console.log(`***Saving to ... '${f2}'`);
    File.savecsv(game.fname, lines);
    // File.savecsv("./" + path.basename(f2), lines);
    // log(`[GameMgr.downloadLottoData('${gameid}')] exiting ...`);
    log(`...exiting`);
    return { status: 0, body: "[GamesMgr.downloadLottoData]", msg: "success", params: { gameid }, data: lines };
    // if (cb) cb({ status: 0, msg: "success", params: { gameid }, data: lines });
    // log(`Fetched ${sURL}`);
  }
}

module.exports = {
  CONSTs,
  LocalStore,
  GamesMgr
};
