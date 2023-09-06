// useLibs
// noPage

import useFirestore from "esoftplay-firestore"

export interface ChattingFirestoreReturn {
  init: (appName?: string, config?: any) => void
}

export default function m(): ChattingFirestoreReturn {
  const init = (appName?: string, config?: string) => {
    useFirestore().init?.(appName, config)
  }

  return {
    init: init
  }

}