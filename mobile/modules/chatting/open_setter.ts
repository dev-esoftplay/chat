// useLibs
// noPage

import React, { useEffect, useMemo } from 'react'
import { ChattingLib, UserClass } from 'esoftplay'
import { AppState } from 'react-native'
import { set } from 'firebase/database'

export default function m(chat_id: string): void {
  const cl = useMemo(() => new ChattingLib(), [])
  const user = UserClass.state().useSelector(s => s)
  let time: any = undefined

  function _set() {
    if (chat_id) {
      const timestamp = (new Date().getTime() / 1000).toFixed(0)
      set(cl.ref("chat", chat_id, "member", user.id, "is_open"), timestamp)
      // main.child("chat").child(chat_id).child("member").child(user?.id).child("is_open").set(timestamp)
    }
  }

  function onAppStateChange(state: string) {
    if (state == "active") {
      if (time) clearInterval(time)
      setInterval(_set, 5000)
    } else {
      if (time) clearInterval(time)
    }
  }

  useEffect(() => {
    time = setInterval(_set, 5000)
    AppState.addEventListener("change", onAppStateChange)
    return () => {
      if (time) clearInterval(time)
      AppState.removeEventListener("change", onAppStateChange)
    }
  }, [chat_id])
}