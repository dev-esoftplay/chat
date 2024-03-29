// useLibs
// noPage
import Firestore from 'esoftplay-firestore';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export default function m(): void {
  const user = UserClass?.state?.()?.useSelector?.((s: any) => s)
  let time: any = undefined

  function _set() {
    if (user && user.hasOwnProperty("id")) {
      const path = ChattingLib().pathUsers
      const timestamp = (new Date().getTime() / 1000).toFixed(0)

      Firestore.get.collectionIds([...path], [["user_id", '==', user?.id]], (id: any) => {
        if (id.length > 0) {
          Firestore.update.doc([...path, id?.[0]], [{ key: "online", value: timestamp }], () => { })
        }
      })
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
    const subs: any = AppState.addEventListener("change", onAppStateChange)
    return () => {
      if (time) clearInterval(time)
      subs.remove()
    }
  }, [])
}