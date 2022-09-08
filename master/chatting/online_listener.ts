// useLibs
// noPage
import { useSafeState } from 'esoftplay';
import { ChattingLib } from 'esoftplay/cache/chatting/lib.import';
import { LibUtils } from 'esoftplay/cache/lib/utils.import';
import { useEffect, useMemo } from 'react';

//@ts-ignore
import moment from 'esoftplay/moment';
import { onValue } from 'firebase/database';
moment().locale('id')

export default function m(chat_to: string): [string, any] {
  const cl = useMemo(() => new ChattingLib(), [])
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
    let listener: any
    if (chat_to)
      listener = onValue(cl.ref("users", chat_to), (snapshoot) => {
        if (snapshoot.exists()) {
          update(snapshoot.val())
        }
      })
    return () => {
      if (chat_to && listener)
        listener()
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