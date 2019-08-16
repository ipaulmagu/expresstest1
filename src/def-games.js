const path = require("path");
const File = require("./AMFile");
const lotteries = [
  {
    id: "US",
    name: "United States",
    type: "country",
    states: [
      {
        id: "CA",
        name: "California",
        type: "state",
        games: [
          {
            name: "Daily 3",
            url: "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=daily-3&Order=No",
            min: 0,
            max: 9,
            num_cnt: 3,
            num_mega: 0,
            img: "https://static.www.calottery.com/~/media/Play/draw_games/Daily-3/daily-3-jackpot.png",
            nameServer: "Daily3-CA-US"
          },
          {
            name: "Daily 4",
            url: "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=daily-4&Order=No",
            min: 0,
            max: 9,
            num_cnt: 4,
            num_mega: 0,
            img: "https://static.www.calottery.com/~/media/Play/draw_games/Daily-4/daily-4-jackpot.png"
          },
          {
            name: "Fantasy 5",
            url:
              "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=fantasy-5&Order=No",
            min: 1,
            max: 39,
            num_cnt: 5,
            num_mega: 0,
            img: "https://static.www.calottery.com/~/media/Play/draw_games/Fantasy-5/fantasy-5-jackpot.png"
          },
          {
            name: "SuperLotto Plus",
            url:
              "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=superlotto-plus&Order=No",
            min: 1,
            max: 47,
            min_mega: 1,
            max_mega: 27,
            num_cnt: 5,
            num_mega: 1,
            img: "https://static.www.calottery.com/~/media/Play/draw_games/SuperLotto-Plus/superlottoplus-jackpot.png"
          },
          {
            name: "Mega Millions",
            url:
              "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=mega-millions&Order=No",
            min: 1,
            max: 70,
            min_mega: 1,
            max_mega: 25,
            num_cnt: 5,
            num_mega: 1,
            img:
              "https://static.www.calottery.com/~/media/Play/draw_games/Mega-Millions/megamillions_landing_page_logo.png"
          },
          {
            name: "PowerBall",
            url:
              "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=powerball&Order=No",
            min: 1,
            max: 69,
            min_mega: 1,
            max_mega: 26,
            num_cnt: 5,
            num_mega: 1,
            img: "https://static.www.calottery.com/~/media/Play/draw_games/Powerball/powerball_logo_landing_page.png"
          }
          // {
          //     name: "Daily Derby",
          //     id: "US-CA-DailyDerby",
          //     url: "https://www.calottery.com/sitecore/content/Miscellaneous/download-numbers/?GameName=daily-derby&Order=No",
          //     min: 0,
          //     max: 12,
          //     num_cnt: 3,
          //     num_mega: 0,
          // },
        ]
      },
      {
        id: "TX",
        name: "Texas",
        type: "state",
        games: []
      }
    ]
  }
];

function replaceAll(find, replacemt) {
  return this.replace(new RegExp("\\\\", "g"), "/");
}

if (String && !String.replaceAll) String.replaceAll = replaceAll;
else if ("".__proto__ && !"".__proto__.replaceAll) "".__proto__.replaceAll = replaceAll;

let gamesById;
if (!gamesById) {
  // console.log("def-games::Generating fnames, urls");
  // create filenames
  let g = lotteries[0].states[0].games[0];
  gamesById = new Map();
  // if (!g.fname || g.fname.length < 1) {
  // let f2 = "../public/data/daily3-ca-us.csv";
  // console.log(`'${f2}' exists:'${File.exists(f2)}'`);
  // f2 = "/public/data/daily3-ca-us.csv";
  // console.log(`'${f2}' exists:'${File.exists(f2)}'`);
  lotteries.forEach(oCounty => {
    oCounty.states.forEach(oState => {
      oState.games.forEach(og => {
        let name = (og.name.replace(/\s/g, "") + "-" + oState.id + "-" + oCounty.id).toLowerCase();
        // if (og.fname && og.fname.length > 0) return;
        // og.fname = "./" + name + ".csv";
        // og.fname = path.join(__dirname, "./", name + ".csv");
        og.fname = path.join(__dirname, "../public/data", name + ".csv");
        if (File.exists(og.fname)) console.log(`Lottery ${name} '${og.fname}' exists`);
        // f2 = og.fname.replace(new RegExp("\\\\", "g"), "/");
        // console.log(`'${f2}' exists:'${File.exists(f2)}'`);
        // f2 = ".." + f2;
        // console.log(`'${f2}' exists:'${File.exists(f2)}'`);
        // console.log(og.fname);
        og.id = name;
        og.localStorageId = name;
        gamesById.set(name, og);
      });
    });
  });
}
// const DefGames = ;
module.exports = {
  lotteries,
  gamesById
};
