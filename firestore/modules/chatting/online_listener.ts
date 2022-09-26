// useLibs
// noPage
import { useSafeState } from 'esoftplay';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { useEffect } from 'react';

//@ts-ignore
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import moment from 'esoftplay/moment';
import Firestore from './firestore';
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
    if (chat_to) {
      const path = ChattingLib().pathUsers
      Firestore.listen.doc([...path, chat_to], (snapshoot) => {
        update(snapshoot)
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