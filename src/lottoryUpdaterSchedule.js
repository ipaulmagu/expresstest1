const AMFile = require("./AMFile");
const log = console.log;
const sConfigFilename = "./lotto-updates.json";
let lotUpdates; // new Map ([[gameid, date], [gameid2, dt2], ...])

class ConfigLotteryUpdater {
  static get() {
    return lotUpdates;
  }
  static save(dataAsMap) {
    if (!dataAsMap || !dataAsMap.entries) {
      log("data must be a map::" + JSON.stringify(dataAsMap));
      return;
    }
    let ar = [...dataAsMap.entries()];
    AMFile.write(sConfigFilename, JSON.stringify(ar));
  }
  static read() {
    // if (lotUpdates) return lotUpdates
    let data = AMFile.readFile(sConfigFilename);
    // log("read()=>", JSON.stringify(data));
    if (!data || data.length < 1) {
      const { gamesById } = require("./def-games");
      lotUpdates = new Map();
      gamesById.forEach(g => {
        if (!g.dtLastUpdate) g.dtLastUpdate = 0;
        lotUpdates.set(g.id, 0);
      });
      // log("read()==>1st save ... ::", JSON.stringify([...lotUpdates.entries()]));
      this.save(lotUpdates);
      return lotUpdates;
    }
    lotUpdates = new Map(JSON.parse(data));
    // log("Read{2}():" + JSON.stringify([...lotUpdates.entries()]));
    return lotUpdates;
  }
}

module.exports = ConfigLotteryUpdater;
