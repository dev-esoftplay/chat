const fs = require('fs');
const shell = require('child_process').execSync;
const merge = require('lodash/merge')
const { moduleName } = require("./index")
const assetsFonts = "assets/fonts"

/* copy directory */
if (fs.existsSync('../esoftplay/esp.ts')) {
  if (fs.existsSync('../esoftplay/modules/' + moduleName))
    shell('rm -r ../esoftplay/modules/' + moduleName)
  shell("cp -r ./" + moduleName + " ../esoftplay/modules/")
} else {
  throw "Mohon install esoftplay package terlebih dahulu"
}

function readAsJson(path) {
  let out = ""
  try {
    out = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))
  } catch (e) {

  }
  return out;
}

function injectConfig(configPath) {
  if (fs.existsSync(configPath)) {
    const exsConf = readAsJson(configPath)
    const conf = readAsJson("./config.json")
    let _cf = merge({ config: conf }, exsConf)
    fs.writeFileSync(configPath, JSON.stringify({ ..._cf }, undefined, 2))
  }
}

/* injectConfig */
injectConfig("../../config.json")
injectConfig("../../config.live.json")
injectConfig("../../config.debug.json")

/* move assets */
if (fs.existsSync("./assets/")) {
  if (!fs.existsSync("../../assets/" + moduleName))
    shell("mkdir -p ../../assets/" + moduleName)
  try {
    shell("cp -r -n ./assets/* ../../assets/" + moduleName + "/")
  } catch (error) { }
}

if (fs.existsSync("./fonts/")) {
  if (!fs.existsSync("../../" + assetsFonts))
    shell("mkdir -p ../../" + assetsFonts)
  try {
    shell("cp -r -n ./fonts/* ../../" + assetsFonts + "/")
  } catch (error) { }
}

/* inject lang */
if (fs.existsSync("./id.json")) {
  let moduleLang = readAsJson("./id.json")
  if (fs.existsSync("../../assets/locale/id.json")) {
    let projectLang = readAsJson("../../assets/locale/id.json")
    let _lg = merge(moduleLang, projectLang)
    moduleLang = { ..._lg }
  }
  fs.writeFileSync("../../assets/locale/id.json", JSON.stringify(moduleLang, undefined, 2))
}

/* inject libs */
if (fs.existsSync("./libs.json")) {
  let libs = readAsJson("./libs.json")
  let libsToSkip = []
  libs.forEach((element, index) => {
    console.log(element.split("@")[0])
    if (fs.existsSync("../../node_modules/" + element.split("@")[0])) {
      libsToSkip.push(element)
    }
  })
  if (libsToSkip.length > 0) {
    libsToSkip.forEach((lib) => {
      libs = libs.filter((x) => x != lib)
      console.log(lib + " is exist, Skipped")
    })
  }
  if (libs.length > 0) {
    console.log("mohon tunggu ..")
    console.log("installing \\n" + libs.join("\\n"))
    shell("cd ../../ && expo install " + libs.join(" && expo install "))
  }
  console.log("Success..!")
}

/* inject user Index */
const be = `//esoftplay-chatting`
const toBe = `
  useEffect(() => {
    if (user && esp.config('firebase').hasOwnProperty('apiKey')) {
      try {
        const Firestore = esp.mod('chatting/firestore')
        Firestore()?.init?.()
        const ChattingLib = esp.mod('chatting/lib')
        ChattingLib().setUser()
      } catch (error) {

      }
    }
  }, [user])
`
if (fs.existsSync('../esoftplay/modules/user/index.tsx')) {
  let userIndexString = fs.readFileSync('../esoftplay/modules/user/index.tsx', { encoding: 'utf-8' })
  userIndexString = userIndexString.replace(be, toBe)
  fs.writeFileSync('../esoftplay/modules/user/index.tsx', userIndexString, { encoding: 'utf-8' })
  console.log("chat inserted !")
}
