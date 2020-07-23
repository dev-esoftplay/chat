// useLibs

import React, { useEffect, useMemo } from 'react'
import { useSafeState, ChattingLib, LibUtils, esp } from 'esoftplay'
//@ts-ignore
import moment from 'moment/min/moment-with-locales'
moment.locale('id')

export default function m(chat_to: string): [string, any] {
  const main = useMemo(() => new ChattingLib().ref(), [])
  const [status, setStatus] = useSafeState<string>("Loading...")
  const [opposite, setOpposite] = useSafeState<string>("Loading...")
  const [offlineMode, setOfflineMode] = useSafeState(false)

  function update(data: any) {
    const online = data.online
    const time = parseInt((new Date().getTime() / 1000).toFixed(0))
    setStatus((time - parseInt(online) <= 6) ? 'Online' : moment.unix(parseInt(online)).fromNow())
    setOpposite(data)
  }

  useEffect(() => {
    if (chat_to)
      main.child("users").child(chat_to).on('value',
        snapshoot => {
          if (snapshoot.val()) {
            update(snapshoot.val())
          }
        })
    return () => {
      if (chat_to)
        main.child("users").child(chat_to).off('value')
    }
  }, [chat_to])

  useEffect(() => {
    if (opposite != 'Loading...' && offlineMode == false) {
      LibUtils.debounce(() => {
        update(opposite)
        setOfflineMode(true)
      }, 8000)
    }
  }, [status])


  useEffect(() => {
    let unsubsribe: any
    if (offlineMode) {
      unsubsribe = setInterval(() => {
        update(opposite)
      }, 60000)
    }
    return () => {
      unsubsribe && clearInterval(unsubsribe)
    }
  }, [offlineMode])

  return [status, opposite]
}