// publsiher

import { moduleName } from "./index"
const fs = require('fs');
const shell = require('child_process').execSync;
const assets = "assets/" + moduleName

/* copy module */
if (fs.existsSync("./" + moduleName))
  shell("rm -r ./" + moduleName)
shell("cp -r ../mobile/modules/" + moduleName + " ./")

/* copy assets */
if (fs.existsSync("./assets"))
  shell("rm -r ./assets")
shell("mkdir -p assets")
if (fs.existsSync("../mobile/" + assets))
  shell("cp -r ../mobile/" + assets + "/* ./assets/")

/* copy config */
if (fs.existsSync("../mobile/config.json")) {
  const confMobile = require("../mobile/config.json")
  if (confMobile.config.hasOwnProperty(moduleName)) {
    const confMaster = { [moduleName]: confMobile.config[moduleName] }
    fs.writeFileSync("./config.json", JSON.stringify(confMaster, undefined, 2))
  }
}

if (fs.existsSync("./package.json")) {
  const packJson = require("./package.json")
  const letterVersion = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",]
  const version = packJson.version
  const letter = version.match(/([a-z])/g)
  const number = version.replace(/-/g, "").replace(letter, "")
  let nextLetter = ""
  let nextNumber = number.split(".")[2]
  let nextVersion = number.split(".")[0] + "." + number.split(".")[1] + "."
  if (!letter) {
    nextLetter = letterVersion[0]
    nextVersion += nextNumber
    nextVersion += "-" + nextLetter
  } else if (letter != "z") {
    nextLetter = letterVersion[letterVersion.indexOf(String(letter)) + 1]
    nextVersion += nextNumber
    nextVersion += "-" + nextLetter
  } else {
    nextNumber = Number(nextNumber) + 1
    nextVersion += nextNumber
  }
  const newPackJson = { ...packJson, version: nextVersion }
  fs.writeFileSync("./package.json", JSON.stringify(newPackJson, undefined, 2))
  shell("npm publish")
  console.log("\nnpm install --save esoftplay-" + moduleName + "@" + nextVersion + "\n")
}