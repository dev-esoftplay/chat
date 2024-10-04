// useLibs
// noPage
import useFirestore from 'esoftplay-firestore';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export default function m(): void {
  let time: any = undefined

  function _set() {
    const user = UserClass?.state().get()
    if (user && user.hasOwnProperty("id")) {
      const { db } = useFirestore().init()
      const path = ChattingLib().pathUsers
      const timestamp = (new Date().getTime() / 1000).toFixed(0)

      // adding orderby to get only document with uid field
      useFirestore().getCollectionWhereOrderBy(db, [...path], [["user_id", '==', String(user?.id)]], [["uid", "desc"]], (dta: any) => {
        if (dta?.length > 0) {
          const updatedId = dta.filter((x: any) => x?.data?.online && x?.data?.uid)?.[0]?.id || dta?.[0]?.id
          useFirestore().updateDocument(db, [...path, updatedId], [{ key: "online", value: timestamp }], () => { })
        }
      })
    }
  }

  function onAppStateChange(state: string) {
    if (state == "active") {
      if (time) clearInterval(time)
      setInterval(_set, (60 * 1000))
    } else {
      if (time) clearInterval(time)
    }
  }

  useEffect(() => {
    time = setInterval(_set, (60 * 1000))
    const subs: any = AppState.addEventListener("change", onAppStateChange)
    return () => {
      if (time) clearInterval(time)
      subs.remove()
    }
  }, [])
}