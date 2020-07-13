// useLibs

import React, { useEffect, useMemo } from 'react'
import { useSafeState, ChatLib } from 'esoftplay'
import moment from 'moment/min/moment-with-locales'
moment.locale('id')

export default function m(chat_to: string): [string, any] {
  const main = useMemo(() => new ChatLib().ref(), [])
  const [status, setStatus] = useSafeState<string>("Loading...")
  const [opposite, setOpposite] = useSafeState<string>("Loading...")

  useEffect(() => {
    if (chat_to)
      main
        .child("users")
        .child(chat_to)
        .on('value',
          snapshoot => {
            if (snapshoot) {
              const timeStamp = (new Date().getTime() / 1000).toFixed(0)
              if (Number(timeStamp) - snapshoot.val().online < 6) {
                setStatus("Online")
              } else
                setStatus(moment(snapshoot.val()).fromNow())
              setOpposite(snapshoot.val())
            }
          })
    return () => {
      if (chat_to)
        main
          .child("users")
          .child(chat_to)
          .off('value')
    }
  }, [chat_to])

  return [status, opposite]
}