// useLibs

import React, { useEffect, useMemo } from 'react'
import { ChattingLib } from 'esoftplay'
import { useSelector } from 'react-redux'
import { AppState } from 'react-native'

export default function m(): void {
  const main = useMemo(() => new ChattingLib().ref(), [])
  const user = useSelector((s: any) => s.user_class)
  let time: any = undefined

  function set() {
    if (user && user.hasOwnProperty("id")) {
      const timestamp = (new Date().getTime() / 1000).toFixed(0)
      main.child("users").child(user?.id).child("online").set(timestamp)
    }
  }

  function onAppStateChange(state: string) {
    if (state == "active") {
      if (time) clearInterval(time)
      setInterval(set, 5000)
    } else {
      if (time) clearInterval(time)
    }
  }

  useEffect(() => {
    time = setInterval(set, 5000)
    AppState.addEventListener("change", onAppStateChange)
    return () => {
      if (time) clearInterval(time)
      AppState.removeEventListener("change", onAppStateChange)
    }
  }, [])
}