// useLibs
// noPage
import useFirestore from 'esoftplay-firestore';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { useEffect } from 'react';

//@ts-ignore
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import moment from 'esoftplay/moment';
import useSafeState from 'esoftplay/state';
moment().locale('id')

export default function m(chat_to: string): [string, any] {
  const [status, setStatus] = useSafeState<string>("Loading...")
  const [opposite, setOpposite] = useSafeState<string>("Loading...")
  const [offlineMode, setOfflineMode] = useSafeState(false)
  const { db } = useFirestore().init()

  function update(data: any) {
    const online = data.online
    const time = parseInt((new Date().getTime() / 1000).toFixed(0))
    setStatus((time - parseInt(online) <= 6) ? 'Online' : moment(online).fromNow())
    setOpposite(data)
  }

  useEffect(() => {
    if (chat_to) {
      const pathUser = ChattingLib().pathUsers
      useFirestore().listenCollection(db, [...pathUser], [["user_id", '==', chat_to]], [], (snapshoot: any) => {
        if (snapshoot.length > 0) {
          update({ ...snapshoot[0], ...snapshoot?.[0]?.data })
        }
      })
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