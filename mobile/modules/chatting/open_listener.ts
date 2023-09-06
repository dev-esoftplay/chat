// useLibs
// noPage
import { useSafeState } from 'esoftplay';
import useFirestore from 'esoftplay-firestore';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { useEffect } from 'react';

export default function m(chat_id: string, chat_to: string): [number] {
  const [status, setStatus] = useSafeState(0)
  const { db } = useFirestore().init()

  useEffect(() => {
    if (chat_id && chat_to) {
      const path = ChattingLib().pathChat

      useFirestore().listenCollection(db, [...path, chat_id, "member"], [["user_id", "==", chat_to]], [], (snapshoot: any) => {
        if (snapshoot.length > 0) {
          const timeStamp = (new Date().getTime() / 1000).toFixed(0)
          const lastOpen = snapshoot?.[0].is_open
          setStatus(Number(timeStamp) - Number(lastOpen) < 5 ? 1 : 0)
        } else {
          setStatus(0)
        }
      })
    }
  }, [chat_to, chat_id])
  return [status]
}