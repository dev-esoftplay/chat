// useLibs
// noPage
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import { useEffect } from 'react';

export interface ChatHistoryReturn {
  data: any[],
  update: () => void,
  deleteCache: () => void,
  unread: number
}

const cattingHistory: any = useGlobalState<any[]>([], { inFastStorage: true, persistKey: 'chatting_history', inFile: true, isUserData: true });
export function state(): useGlobalReturn<any[]> {
  return cattingHistory
}
export default function m(): ChatHistoryReturn {
  const user = UserClass.state().useSelector((s: any) => s)
  const group_id = esp.config("group_id")

  useEffect(() => {
    _get()
  }, [])

  function update(hist: any) {
    let histories: any[] = []
    let count = 0

    const setvalue = () => {
      count++
      if (hist.length == count) {
        state().set(histories.sort((a, b) => b.time - a.time))
      }
    }

    if (hist.length > 0)
      hist.forEach((item: any) => {
        const path = ChattingLib().pathUsers
        const _snapshoot = item.data

        item['user_id'] = _snapshoot?.sender_id
        item['chat_id'] = _snapshoot?.chat_id
        item['chat_to'] = _snapshoot?.chat_to
        item['msg'] = _snapshoot?.last_message
        item['time'] = _snapshoot?.time
        item['read'] = _snapshoot.read

        if (_snapshoot?.chat_to_username && _snapshoot.chat_to_image) {
          item['image'] = _snapshoot.chat_to_image
          item['username'] = _snapshoot.chat_to_username
          histories.push({ ..._snapshoot, ...item })
          setvalue()
        } else {
          const firestore = esp.mod("firestore/index")()
          const app: any = firestore.instance()
          firestore.getCollectionWhere(app, [...path], [["user_id", "==", _snapshoot.chat_to]], (snap: any) => {
            if (snap) {
              histories.push({ ...snap?.[0]?.data, id: snap?.[0]?.id, ...item, })
              setvalue()
            } else {
              setvalue()
            }
          })
        }


      })
  }

  function _get() {
    if (!user || !user.hasOwnProperty("id") || !group_id) return
    const pathHistory = ChattingLib().pathHistory
    const firestore = esp.mod("firestore/index")()
    const app: any = firestore.instance()
    firestore.getCollectionWhereOrderBy(app, [...pathHistory], [["user_id", "==", String(user?.id)], ["group_id", "==", group_id]], [["time", "desc"]], (snapshoot: any) => {
      update(snapshoot)
    })
  }

  return {
    data: state().useSelector((x: any) => x),
    update: _get,
    deleteCache: state().reset,
    unread: state().useSelector((x: any) => x).filter?.(((x: any) => x?.data?.read == 0)).length
  }
}