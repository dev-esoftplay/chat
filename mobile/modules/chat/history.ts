// useLibs

import { usePersistState, esp, ChatLib } from 'esoftplay'
import { useSelector } from 'react-redux'
import { useEffect, useMemo } from 'react'

export interface ChatHistoryReturn {
  data: any[],
  update: () => void,
  deleteCache: () => void
}


export default function m(): ChatHistoryReturn {
  const main = useMemo(() => new ChatLib().ref(), [])
  const user = useSelector((s: any) => s.user_class)
  const group_id = esp.config("group_id")
  const [data, setData, reData, delData] = usePersistState<any[]>("chat_history", [])

  useEffect(() => {
    const unsubsribe = get()
    return () => unsubsribe()
  }, [])

  function get(): () => void {
    if (!user || !user.hasOwnProperty("id")) return () => { }
    main.child("history").child(user.id).child(group_id).on('value', snapshoot => {
      if (!snapshoot.val()) return
      let histories: any[] = []
      const keys = Object.keys(snapshoot.val())
      Object.values(snapshoot.val()).forEach((item: any) => {
        main.child("chat").child(item.chat_id).child("conversation").limitToLast(1).once('value', snapshoot => {
          const opposite_id = item.user_id
          if (snapshoot && snapshoot.val()) {
            const _snapshoot: any = Object.values(snapshoot.val())[0]
            item['user_id'] = _snapshoot.user_id
            item['chat_to'] = opposite_id
            item['msg'] = _snapshoot.msg
            item['time'] = _snapshoot.time
            item['read'] = _snapshoot.read
            main.child('users').child(opposite_id).once('value', snapshoot => {
              histories.push({ ...item, ...snapshoot.val() })
              if (keys.length == histories.length) {
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
    })
    return () => main.child("history").child(user.id).child(group_id).off('value')
  }
  return {
    data: data,
    update: get,
    deleteCache: delData
  }
}