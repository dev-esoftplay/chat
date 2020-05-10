// useLibs


import React, { useEffect } from 'react'
import { ChatMain, useSafeState } from 'esoftplay'

export default function m(chat_id: string, chat_to: string): [number] {
  const main = ChatMain()
  const [status, setStatus] = useSafeState(0)

  useEffect(() => {
    main.child("chat").child(chat_id).child("member").child("is_open").on("value", snapshoot => {
      if (snapshoot.val()) {
        const timeStamp = (new Date().getTime() / 1000).toFixed(0)
        const lastOpen = snapshoot.val()
        setStatus(Number(timeStamp) - Number(lastOpen) < 5 ? 1 : 0)
      }
    })
    return () => {
      main.child("chat").child(chat_id).child("member").child("is_open").off("value")
    }
  }, [])
  return [status]
}