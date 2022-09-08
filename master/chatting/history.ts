// useLibs
// noPage
import { esp, useGlobalState, useGlobalReturn } from 'esoftplay';
import { ChattingLib } from 'esoftplay/cache/chatting/lib.import';
import { UserClass } from 'esoftplay/cache/user/class.import';

import { get, limitToLast, off, onValue, query } from 'firebase/database'
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
  const cl = useMemo(() => new ChattingLib(), [])
  const [data, setData, delData] = state().useState()
  const user = UserClass.state().useSelector(s => s)
  const group_id = esp.config("group_id")

  useEffect(() => {
    let unsubsribe: any
    let cleaner: any
    cleaner = _get()
    unsubsribe = setInterval(() => {
      cleaner = _get()
    }, 60000)
    return () => {
      cleaner && cleaner()
      unsubsribe && clearInterval(unsubsribe)
    }
  }, [])

  function update(hist: any) {
    let histories: any[] = []
    let count = 0

    const setvalue = () => {
      count++
      if (Object.keys(hist).length == count) {
        function compare(a: any, b: any) {
          if (a.time < b.time) return 1
          if (a.time > b.time) return -1
          return 0;
        }
        setData(histories.sort(compare))
      }
    }

    if (hist)
      Object.values(hist).forEach((item: any) => {
        const opposite_id = item.user_id
        get(query(cl.ref("chat", item.chat_id, "conversation"), limitToLast(1))).then((snapshoot) => {
          if (snapshoot.exists() && snapshoot.val()) {
            const _snapshoot: any = Object.values(snapshoot.val())?.[0]
            if (_snapshoot) {
              item['user_id'] = _snapshoot.user_id
              item['chat_to'] = opposite_id
              item['msg'] = _snapshoot.msg
              item['time'] = _snapshoot.time
              item['read'] = _snapshoot.user_id != opposite_id ? '1' : _snapshoot.read
              get(cl.ref("users", opposite_id)).then((snapshoot) => {
                if (snapshoot.exists()) {
                  histories.push({ ...item, ...snapshoot.val() })
                  setvalue()
                } else {
                  setvalue()
                }
              })
            } else {
              setvalue()
            }
          } else {
            setvalue()
          }
        })
      })
  }

  function _get(): () => void {
    if (!user || !user.hasOwnProperty("id")) return () => { }
    off(cl.ref("history", user.id, group_id))
    const onValueChange = onValue(cl.ref("history", user.id, group_id), (snapshoot: any) => {
      update(snapshoot.val())
    })
    // main.child("history").child(user?.id).child(group_id).off('value')
    // main.child("history").child(user?.id).child(group_id).on('value', snapshoot => {
    //   if (!snapshoot.val()) return
    //   update(snapshoot.val())
    // })
    return () => onValueChange()
  }

  return {
    data: data,
    update: _get,
    deleteCache: delData,
    unread: data?.filter?.((x => x.read == 0)).length
  }
}