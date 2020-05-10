// useLibs

import { ChatMain, usePersistState, esp } from 'esoftplay'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

export default function m(): [any[], () => void, () => void] {
  const main = ChatMain()
  const user = useSelector((s: any) => s.user_class)
  const group_id = esp.config("group_id")
  const [data, setData, reData, delData] = usePersistState<any[]>("chat-history", [])

  useEffect(get, [])

  function get() {
    if (!user.hasOwnProperty("id")) return
    let counterStart = 0
    let counterEnd = 0
    main.child("history").child(user.id).child(group_id).once('value', snapshoot => {
      if (!snapshoot.val())
        return
      let histories: any[] = []
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
              counterEnd++
              if (counterEnd == counterStart) {
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
  }
  return [data, get, delData]
}