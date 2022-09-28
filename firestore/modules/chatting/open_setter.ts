// useLibs
// noPage
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import Firestore from './firestore';

export default function m(chat_id: string): void {
  const user = UserClass.state().useSelector((s: any) => s)
  let time: any = undefined

  function _set() {
    if (chat_id) {
      const path = ChattingLib().pathChat
      const timestamp = (new Date().getTime() / 1000).toFixed(0)
      Firestore.update.doc([...path, chat_id, "member", user.id], [{ key: "is_open", value: timestamp }], () => { })
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