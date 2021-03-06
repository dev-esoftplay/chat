// useLibs

import { usePersistState, esp, ChattingLib, useGlobalState, useGlobalReturn, UserClass } from 'esoftplay'
import { useEffect, useMemo } from 'react'

export interface ChatHistoryReturn {
  data: any[],
  update: () => void,
  deleteCache: () => void,
  unread: number
}

const cattingHistory = useGlobalState<any[]>([], { persistKey: 'chat_history' })
export function state(): useGlobalReturn<any[]> {
  return cattingHistory
}
export default function m(): ChatHistoryReturn {
  const main = useMemo(() => new ChattingLib().ref(), [])
  const [data, setData, delData] = state().useState()
  const user = UserClass.state().useSelector(s => s)
  const group_id = esp.config("group_id")

  useEffect(() => {
    let unsubsribe: any
    let cleaner: any
    cleaner = get()
    unsubsribe = setInterval(() => {
      cleaner = get()
    }, 60000)
    return () => {
      cleaner && cleaner()
      unsubsribe && clearInterval(unsubsribe)
    }
  }, [])

  function update(hist: any) {
    let histories: any[] = []
    Object.values(hist).forEach((item: any) => {
      const opposite_id = item.user_id
      main.child("chat").child(item.chat_id).child("conversation").limitToLast(1).once('value', snapshoot => {
        if (snapshoot && snapshoot.val()) {
          const _snapshoot: any = Object.values(snapshoot.val())[0]
          item['user_id'] = _snapshoot.user_id
          item['chat_to'] = opposite_id
          item['msg'] = _snapshoot.msg
          item['time'] = _snapshoot.time
          item['read'] = _snapshoot.user_id == opposite_id ? _snapshoot.read : '1'
          main.child('users').child(opposite_id).once('value', snapshoot => {
            histories.push({ ...item, ...snapshoot.val() })
            if (Object.keys(hist).length == histories.length) {
              function compare(a: any, b: any) {
                if (a.time < b.time) return 1
                if (a.time > b.time) return -1
                return 0;
              }
              setData(histories.sort(compare))
            }
          })
        }
      })
    })
  }

  function get(): () => void {
    if (!user || !user.hasOwnProperty("id")) return () => { }
    main.child("history").child(user?.id).child(group_id).off('value')
    main.child("history").child(user?.id).child(group_id).on('value', snapshoot => {
      if (!snapshoot.val()) return
      update(snapshoot.val())
    })
    return () => main.child("history").child(user?.id).child(group_id).off('value')
  }

  return {
    data: data,
    update: get,
    deleteCache: delData,
    unread: data?.filter?.((x => x.read == 0)).length
  }
}