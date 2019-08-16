const fs = require("fs");

module.exports = class File {
  static exists(fname) {
    try {
      return fs.existsSync(fname);
    } catch (error) {
      console.error(`     AMFile.exists('${fname}').error='${error.toString()}'`);
      return undefined;
    }
  }
  static delete(fname) {
    return fs.unlink(fname, err => {
      if (err) {
        console.error(`     [AMFile.delete('${fname}')].error='${err.toString()}'`);
        throw err;
      }
      console.log(`     [AMFile.delete('${fname}')] SUCCESS!`);
    });
  }
  static stat(fname) {
    return fs.statSync(fname);
  }
  static readFile(fname) {
    try {
      if (File.exists(fname)) {
        let data = fs.readFileSync(fname, "utf8");
        console.error(`     [AMFile.readFile('${fname}')] SUCCESS!'`);
        // console.error(`[AMFile.readFile('${fname}')] Read: '${data.substr(0, 100)}...'`);
        return data;
      } else return null;
    } catch (err) {
      console.error(`     [AMFile.readFile('${fname}')]Error:'${err.toString()}'`);
      return null;
    }
  }

  /**
   * Return lines of text fields; Array of Arrays: i.e. [[f1,f2,f3,...], [f1,f2,f3,...], ...[]]
   * @param {*} fname
   * @param {*} delimeter
   */
  static readCSV(fname, delimeter = ",") {
    let txt = File.readFile(fname);
    return !txt ? [] : txt.split("\n").map(aline => aline.split(delimeter));
  }

  static write(fname, data) {
    if (!fname || fname.length < 1) return -1;
    if (!data) return -2;
    // console.log("Saving:...\n", data.substr(0, 100));
    const _data = new Uint8Array(Buffer.from(data));
    // console.log("Saving(_Buffer):...\n", _data.substr(0, 100));
    let res = null;
    try {
      res = fs.writeFileSync(fname, _data, { encoding: "utf8", flag: "w" });
      console.log(`     [AMFile.write('${fname}')] SUCCESS`);
    } catch (error) {
      console.error(`     [AMFile.write] Error writting to ${fname} ...`);
      console.error(data.substr(0, 100));
    }
    // console.log("Saved res:");

    // fs.writeFile(fname, _data, err => {
    //   if (err) throw err;
    //   console.log(`${fname} been written!`);
    //   // console.log(`${fname} been written! ${data}`);
    // });
  }
  /**
   *
   * @param {*} fname
   * @param {*} lines | ["f1,f2,f3,...", "f1,f2,f3, ...", ... ]
   * @param {*} lineDel
   */
  static save(fname, lines, lineDel = "\n") {
    if (!fname || fname.length < 1) return -1;
    if (!lines || lines.length < 1) return -2;
    const dataLines = Array.isArray(lines) ? lines.join(lineDel) : lines;
    const data = new Uint8Array(Buffer.from(dataLines));
    // fs.writeFileSync(fname,data)
    fs.writeFile(fname, data, err => {
      if (err) throw err;
      console.log(`     [AMFile.save] Success ${fname}!`);
    });
  }

  static savecsv(fname, lines) {
    return File.write(fname, lines.map(aline => aline.join(",")).join("\n"));
  }
};
