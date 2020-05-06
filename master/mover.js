const fs = require('fs');
const shell = require('child_process').execSync;
const merge = require('lodash/merge')
import { moduleName } from "./index"

/* copy directory */
if (fs.existsSync('../esoftplay/esp.ts')) {
  if (fs.existsSync('../esoftplay/modules/' + moduleName))
    shell('rm -r ../esoftplay/modules/' + moduleName)
  shell("cp -r ./" + moduleName + " ../esoftplay/modules/")
} else {
  throw "Mohon install esoftplay package terlebih dahulu"
}

function injectConfig(configPath) {
  if (fs.existsSync(configPath)) {
    const exsConf = require(configPath)
    if (!exsConf.config.hasOwnProperty(moduleName)) {
      const conf = require("./config.json")
      fs.writeFileSync(configPath, JSON.stringify(merge(exsConf, { config: conf }), undefined, 2))
    }
  }
}
/*
  untuk menambahkan default config["chat"] pada main project otomatis saat install esoftplay-chat
*/
injectConfig("../../config.json")
injectConfig("../../config.live.json")
injectConfig("../../config.debug.json")

/* move assets */
if (fs.existsSync("./assets")) {
  if (!fs.existsSync("../../assets/" + moduleName))
    shell("mkdir -p ../../assets/" + moduleName)
  shell("cp -r -n ./assets/* ../../assets/" + moduleName + "/")
}

/* inject libs */
if (fs.existsSync("./libs.json")) {
  const libs = require("./libs.json")
  // shell()
  // console.log("mohon tunggu ..")
  console.log("installing \n" + libs.join("\n"))
  shell("cd ../../ && expo install " + libs.join(" && expo install "))
}
