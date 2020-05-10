// useLibs

import React, { useEffect } from 'react'
import { ChatMain, useSafeState } from 'esoftplay'
import moment from 'moment/min/moment-with-locales'

export default function m(chat_to: string): [string] {
  const main = ChatMain()
  const [status, setStatus] = useSafeState<string>("Loading...")

  useEffect(() => {
    main
      .child("users")
      .child(chat_to)
      .on('value',
        snapshoot => {
          if (snapshoot) {
            const timeStamp = (new Date().getTime() / 1000).toFixed(0)
            if (Number(timeStamp) - snapshoot.val().online < 6) {
              setStatus("Online")
            }
            setStatus(moment(snapshoot.val()).fromNow())
          }
        })
    return () => {
      main
        .child("users")
        .child(chat_to)
        .off('value')
    }
  }, [])

  return [status]
}