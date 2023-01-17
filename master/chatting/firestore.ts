// useLibs
// noPage

import Firestore from "esoftplay-firestore"

export interface ChattingFirestoreReturn {
  init: () => void
}

export default function m(): ChattingFirestoreReturn {
  const init = () => {
    Firestore?.init?.()
  }

  return {
    init: init
  }

}