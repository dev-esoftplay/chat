// useLibs


import React, { useEffect, useMemo } from 'react'
import { useSafeState, ChatLib } from 'esoftplay'

export default function m(chat_id: string, chat_to: string): [number] {
  const main = useMemo(() => new ChatLib().ref(), [])
  const [status, setStatus] = useSafeState(0)

  useEffect(() => {
    if (chat_id && chat_to)
      main.child("chat").child(chat_id).child("member").child(chat_to).child("is_open").on("value", snapshoot => {
        if (snapshoot.val()) {
          const timeStamp = (new Date().getTime() / 1000).toFixed(0)
          const lastOpen = snapshoot.val()
          setStatus(Number(timeStamp) - Number(lastOpen) < 5 ? 1 : 0)
        } else {
          setStatus(0)
        }
      })
    return () => {
      if (chat_id && chat_to)
        main.child("chat").child(chat_id).child("member").child(chat_to).child("is_open").off("value")
    }
  }, [chat_to, chat_id])
  return [status]
}