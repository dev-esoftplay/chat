// useLibs
// noPage
import { esp, useGlobalReturn } from 'esoftplay';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import useGlobalState from 'esoftplay/global';

import { useEffect } from 'react';
export interface ChatHistoryReturn {
  data: any[],
  update: () => void,
  deleteCache: () => void,
  unread: number
}

const cattingHistory: any = useGlobalState<any[]>([]);
export function state(): useGlobalReturn<any[]> {
  return cattingHistory
}
export default function m(): ChatHistoryReturn {
  const [data, setData, delData] = state().useState()
  const user = UserClass.state().useSelector((s: any) => s)
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
      if (hist.length == count) {
        function compare(a: any, b: any) {
          if (a.time < b.time) return 1
          if (a.time > b.time) return -1
          return 0;
        }
        setData(histories.sort(compare))
      }
    }

    if (hist.length > 0)
      hist.forEach((item: any) => {
        const path = ChattingLib().pathUsers
        const _snapshoot = item.data

        // item['user_id'] = _snapshoot?.user_id
        item['user_id'] = _snapshoot?.sender_id
        item['chat_id'] = _snapshoot?.chat_id
        item['chat_to'] = _snapshoot?.chat_to
        item['msg'] = _snapshoot?.last_message
        item['time'] = _snapshoot?.time
        item['read'] = _snapshoot.read
        // item['read'] = _snapshoot.sender_id == user.id ? '1' : _snapshoot.read
        const Firestore = esp.mod('chatting/firestore')
        Firestore.get.collectionWhere([...path], [["user_id", "==", _snapshoot.chat_to]], (snap: any) => {
          if (snap) {
            histories.push({ ...snap?.[0]?.data, id: snap?.[0]?.id, ...item, })
            setvalue()
          } else {
            setvalue()
          }
        })

      })
  }

  function _get() {
    if (!user || !user.hasOwnProperty("id")) return
    const pathHistory = ChattingLib().pathHistory
    const Firestore = esp.mod('chatting/firestore')
    Firestore.listen.collection([...pathHistory], [["user_id", "==", String(user?.id)], ["group_id", "==", group_id]], [], (snapshoot: any) => {
      update(snapshoot)
    })
  }

  return {
    data: data,
    update: _get,
    deleteCache: delData,
    unread: data?.filter?.((x => x?.data?.read == 0)).length
  }
}