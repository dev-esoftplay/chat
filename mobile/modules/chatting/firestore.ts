// useLibs
// noPage

import esp from "esoftplay/esp"

export interface ChattingFirestoreReturn {
  init: (appName?: string, config?: any) => void
}

export default function m(): ChattingFirestoreReturn {
  const init = (appName?: string, config?: string) => {
    esp.mod("firestore/index")().init?.(appName, config)
  }

  return {
    init: init
  }

}