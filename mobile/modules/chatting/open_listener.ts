// useLibs
// noPage


import React, { useEffect, useMemo } from 'react'
import { useSafeState, ChattingLib } from 'esoftplay'
import { onValue } from 'firebase/database'

export default function m(chat_id: string, chat_to: string): [number] {
  const cl = useMemo(() => new ChattingLib(), [])
  const [status, setStatus] = useSafeState(0)

  useEffect(() => {
    let listener
    if (chat_id && chat_to)
      listener = onValue(cl.ref("chat", chat_id, "member", chat_to, "is_open"), (snapshoot) => {
        if (snapshoot.exists()) {
          if (snapshoot.val()) {
            const timeStamp = (new Date().getTime() / 1000).toFixed(0)
            const lastOpen = snapshoot.val()
            setStatus(Number(timeStamp) - Number(lastOpen) < 5 ? 1 : 0)
          } else {
            setStatus(0)
          }
        } else {
          setStatus(0)
        }
      })
    return () => {
      if (chat_id && chat_to && listener)
        listener()
    }
  }, [chat_to, chat_id])
  return [status]
}