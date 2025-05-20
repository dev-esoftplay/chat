// useLibs
// noPage
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { useEffect } from 'react';

//@ts-ignore
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import esp from 'esoftplay/esp';
import moment from 'esoftplay/moment';
import useSafeState from 'esoftplay/state';
moment().locale('id')

export default function m(chat_to: string): [string, any] {
  const [status, setStatus] = useSafeState<string>("Loading...")
  const [opposite, setOpposite] = useSafeState<string>("Loading...")
  const [offlineMode, setOfflineMode] = useSafeState(false)

  function update(data: any) {
    const online = data.online
    const time = parseInt((new Date().getTime() / 1000).toFixed(0))
    setStatus((time - parseInt(online) <= 6) ? 'Online' : moment(online).fromNow())
    setOpposite(data)
  }

  useEffect(() => {
    console.log({ chat_to })
    if (chat_to) {
      return
    }
    const app: any = esp.mod("firestore/index")().instance()
    const pathUser = ChattingLib().pathUsers
    const subs = esp.mod("firestore/index")().listenCollection(app, [...pathUser], [["user_id", '==', chat_to]], [], (snapshoot: any) => {
      console.log('snapshoot', snapshoot.exists())
      if (snapshoot.length > 0) {
        update({ ...snapshoot[0], ...snapshoot?.[0]?.data })
      }
    }, (e) => console.log('error', e))

    return () => subs()
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