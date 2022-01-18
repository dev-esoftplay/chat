// useLibs
// noPage

import React, { useEffect, useMemo } from 'react'
import { ChattingLib, UserClass } from 'esoftplay'
import { AppState } from 'react-native'
import { set } from 'firebase/database'

export default function m(): void {
  const cl = useMemo(() => new ChattingLib(), [])
  const user = UserClass.state().useSelector(s => s)
  let time: any = undefined

  function _set() {
    if (user && user.hasOwnProperty("id")) {
      const timestamp = (new Date().getTime() / 1000).toFixed(0)
      set(cl.ref("users", user.id, "online"), timestamp)
      // main.child("users").child(user?.id).child("online").set(timestamp)
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
  }, [])
}