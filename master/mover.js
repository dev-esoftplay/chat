const fs = require('fs');
const shell = require('child_process').execSync;
const merge = require('lodash/merge')
const moduleName = "chatting"

/* copy directory */
if (fs.existsSync('../esoftplay/esp.ts')) {
  if (fs.existsSync('../esoftplay/modules/chatting'))
    shell('rm -r ../esoftplay/modules/chatting')
  shell("cp -r ./chatting ../esoftplay/modules/")
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
  untuk menambahkan default config["chatting"] pada main project otomatis saat install esoftplay-chatting
*/
injectConfig("../../config.json")
injectConfig("../../config.live.json")
injectConfig("../../config.debug.json")

/* move assets */
if (fs.existsSync("./assets/") && fs.existsSync("./assets/chatting")) {
  if (!fs.existsSync("../../assets/chatting"))
    shell("mkdir -p ../../assets/chatting")
  shell("cp -r -n ./assets/* ../../assets/chatting/")
}

/* inject libs */
if (fs.existsSync("./libs.json")) {
  const libs = require("./libs.json")
  // shell()
  // console.log("mohon tunggu ..")
  if (libs.length > 0) {
    console.log("installing \n" + libs.join("\n"))
    shell("cd ../../ && expo install " + libs.join(" && expo install "))
  }
}
