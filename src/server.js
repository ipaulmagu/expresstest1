const express = require("express");
const path = require("path");
// const serverless = require("serverless-http");
// const expressLayouts = require("express-ejs-layouts");
// var logger = require("morgan");

// const bodyparser = require("body-parser");
// const helmet = require("helmet");
const compression = require("compression");
const { hSetRespHeaders, h404, hGetGameData, hLottoAdmin, sync_ } = require("./controlers/controlers");

var app = express();
var log = console.log;
app.use(compression({ level: 6 }));
// app.use(logger("dev"));
app.use("/", hSetRespHeaders);
// app.engine("html", ejs.renderFile);
// app.set("view engine", "html");
// app.set("view engine", "ejs");
// app.use(expressLayouts);

// log(path.join(__dirname, "/public"));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/public/data", express.static(path.join(__dirname, "../public", "/data")));
app.use("/src", express.static(path.join(__dirname, "../src")));
app.use("/src/css", express.static(path.join(__dirname, "../src", "/css")));
app.use("/admin", hLottoAdmin);
// app.use(sync_);

var serverLottery = express.Router();
serverLottery.use(["/lotto/admin", "/manager"], hLottoAdmin);
serverLottery.use("/lotto/game/:gameid", hGetGameData); // "lotto/game/daily3-ca-us"
// serverLottery.use("/", h404);
app.use("/api", serverLottery);
// app.use("/lotto", serverLottery);

app.get("/", h404);

const port = 3000;
const server = app.listen(port, () => {
  console.log(`[Server] Rest @ localhost:${port}/lotto/game/:gameid`);
});

module.exports = app;
// module.exports.handler = serverless(app);
