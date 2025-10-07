// useLibs
// noPage
import { ChattingCache } from 'esoftplay/cache/chatting/cache/import';
import { ChattingCache_sendProperty } from 'esoftplay/cache/chatting/cache_send/import';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { ChattingOnline_listener } from 'esoftplay/cache/chatting/online_listener/import';
import { ChattingOpen_listener } from 'esoftplay/cache/chatting/open_listener/import';
import { ChattingOpen_setter } from 'esoftplay/cache/chatting/open_setter/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { UseTasks } from 'esoftplay/cache/use/tasks/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import useGlobalState from 'esoftplay/global';
import isEqual from 'react-fast-compare';

import { collection, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter } from '@react-native-firebase/firestore';
import esp from 'esoftplay/esp';
import moment from 'esoftplay/moment';
import useSafeState from 'esoftplay/state';
import { useEffect } from 'react';
moment().locale('id')

export interface ChattingItem {
  key: string,
  msg: string,
  read: string,
  time: string,
  user_id: string,
  attach?: ChattingItemAttach
}

export interface ChattingItemAttach {
  description?: string,
  image?: string,
  module?: string,
  url?: string,
  title?: string,
  data?: any,
  type?: string,
  buttons?: ChattingItemAttachButtons
}

export interface ChattingItemAttachButtons {
  [user_id: string]: ChattingItemAttachButton[]
}

export interface ChattingItemAttachButton {
  type?: string,
  text: string,
  module?: string,
  data?: any,
  url: string,
  enabled: boolean
}

export interface ChattingChatProps {
  chat_to: string,
  group_id: string,
  chat_id: string
}

export interface ChatChatReturnUser {
  username: string,
  image: string,
  online: string,
  deleted: 0 | 1
}

export interface ChatChatReturn {
  chat_id: string,
  send: (message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: ChattingItem) => void, _chat_id?: string) => void,
  sendNoCache: (message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: ChattingItem) => void, _chat_id?: string) => void,
  chat_to_user: ChatChatReturnUser,
  chat_to_online: string,
  loadPrevious: (firstKey: string) => void,
  firstKey: string,
  conversation: ChattingItem[],
  hasPrevious: boolean,
  error: string,
  loading: boolean
}

const PAGE_SIZE = 10;
const lastVisible = useGlobalState<any>(null)
const isBlockedOnFirst = useGlobalState<any>(false)

const useTasks = UseTasks()

export default function m(props: ChattingChatProps): ChatChatReturn {
  const path: any = ChattingLib().pathChat
  const user = UserClass.state().useSelector((s: any) => s)
  const [chat_id, setChat_id] = useSafeState(props.chat_id)
  const { chat_to } = props
  const group_id = props?.group_id || esp.config('group_id')
  const [hasNext, setHasNext] = useSafeState(true)
  // const [data, setData] = useSafeState<any>([])

  const [data, setData] = ChattingCache<any>([], 'chatting_chat_message02' + chat_id)
  const [loading, setLoading] = useSafeState(data?.length > 0 ? false : true)
  const [isReady, setIsReady] = useSafeState(data?.length > 0 ? false : true)

  const [error, setError] = useSafeState("")
  // const [loading, setLoading] = useSafeState(true)
  // const [isReady, setIsReady] = useSafeState(false)

  const [online, opposite] = ChattingOnline_listener(chat_to)
  const [isOpenChat] = ChattingOpen_listener(chat_id, chat_to)

  const [sync] = useTasks((item: any) => new Promise((next) => {
    ChattingCache_sendProperty.sendCacheToServer(item, (msg, chat_id) => {
      ChattingCache_sendProperty.state().set((old: any) => old.filter((x: any) => !isEqual(item, x)))
      next()
    }, () => { });
  }))

  ChattingOpen_setter(chat_id)

  useEffect(() => {
    let exec = setTimeout(async () => {
      let error = ''
      if (chat_to == undefined || chat_to == '') {
        error = esp.lang("chatting/chat", "chatto_notfound")
      } else if (chat_to == user?.id) {
        error = esp.lang("chatting/chat", "self_send")
      } else if (group_id == undefined || group_id == "") {
        error = esp.lang("chatting/chat", "not_valid")
      }
      if (error != '') {
        setError(error)
        return
      }
      if (!chat_id) {
        ChattingLib().getChatId(chat_to, group_id, (chat_id) => {
          setLoading(false)
          setChat_id(chat_id)
        })
      }
      else {
        setLoading(false)
      }
    }, 0)
    return () => clearTimeout(exec)
  }, [])

  useEffect(() => {
    if (chat_id && !loading) {
      listenFirstPage()
    }
    if (!chat_id) {
      setData([])
    }
  }, [chat_id, loading])

  useEffect(() => {
    if (data) {
      if (data.length > 0) {
        data.filter((c: any) => c?.read == '0' && c?.user_id != user?.id).forEach((x: any) => {
          setRead(x)
        })
      }
    }
  }, [data])

  function setRead(chat: any) {
    const path = ChattingLib().pathChat
    const pathHistory = ChattingLib().pathHistory
    const app: any = esp.mod("firestore/index")().instance()

    if (!user || !user.hasOwnProperty("id")) return

    esp.mod("firestore/index")().updateDocument(app, [...path, chat_id, 'conversation', chat?.id], [{ key: "read", value: "1" }], () => { })
    esp.mod("firestore/index")().getCollectionIds(app, [...pathHistory], [["user_id", "==", user?.id], ["chat_to", "==", chat?.user_id]], [], (snap: any) => {
      const dt = snap?.[0]
      if (dt) {
        esp.mod("firestore/index")().updateDocument(app, [...pathHistory, dt], [{ key: "read", value: "1" }], () => { })
      }
    })
    esp.mod("firestore/index")().getCollectionIds(app, [...pathHistory], [["user_id", "==", chat?.user_id], ["chat_to", "==", user?.id]], [], (snap: any) => {
      const dt = snap?.[0]
      if (dt) {
        esp.mod("firestore/index")().updateDocument(app, [...pathHistory, dt], [{ key: "read", value: "1" }], () => { })
      }
    })
  }

  function listenFirstPage(): () => void {
    if (!chat_id) {
      return () => { }
    }
    const app: any = esp.mod("firestore/index")().instance()
    const db: any = getFirestore(app)

    const colRef = collection(db, esp.mod("firestore/index")().castPathToString(path), chat_id, 'conversation')
    const fRef = query(colRef, orderBy("time", 'desc'), limit(PAGE_SIZE))

    let datas: any[] = []
    const unsub = onSnapshot(fRef, (snap) => {
      if (snap?.docs?.length > 0) {
        lastVisible.set(snap.docs[snap.docs.length - 1])
        setIsReady(true)
        datas = []

        // snap.docs.forEach((doc) => {
        //   datas.push({ ...doc.data(), id: doc.id, key: doc.id })
        // })

        for (const doc of snap.docs) {
          const data = doc.data();
          const isBlocked = data?.hidden_history_user_ids?.includes(user?.id) || false
          if (isBlocked) {
            isBlockedOnFirst.set(true)
            lastVisible.reset()
            break;
          } else {
            isBlockedOnFirst.set(false)
          }
          datas.push({ ...data, id: doc.id, key: doc.id });
        }
      }

      setData(datas)
    }, (e) => {
      console.warn("ERROR : ", e);
    })
    return () => unsub()
  }

  function nextPage() {
    if (!chat_id) {
      return
    }
    const app: any = esp.mod("firestore/index")().instance()
    const db: any = getFirestore(app)
    const colRef = collection(db, esp.mod("firestore/index")().castPathToString(path), chat_id, 'conversation')
    const fRef = query(colRef, orderBy("time", 'desc'), startAfter(lastVisible.get()), limit(PAGE_SIZE))

    let datas: any[] = []
    getDocs(fRef).then((snap) => {
      if (!snap.empty) {
        lastVisible.set(snap.docs[snap.docs.length - 1])
        for (const doc of snap.docs) {
          const data = doc.data();
          const isBlocked = data?.hidden_history_user_ids?.includes(user?.id) || false
          if (isBlocked || isBlockedOnFirst.get()) {
            lastVisible.reset()
            break;
          }
          datas.push({ ...data, id: doc.id, key: doc.id });
        }
        // snap.docs.forEach((doc) => {
        //   datas.push({ ...doc.data(), id: doc.id, key: doc.id })
        // })

        setData(LibObject.push(data, ...datas)())
      }
    }).catch((e) => {
      console.warn('ERROR NEXT: ', e);
    })

  }

  function loadPrevious(lastKey: string) {
    if (isReady && lastVisible.get()) {
      LibUtils.debounce(() => {
        nextPage()
      }, 500)
    } else {
      setHasNext(false)
    }
  }

  function setNotif(chat_id: string, message: string): void {
    if (!isOpenChat) {
      new LibCurl('user_notif_chat', {
        chat_id: chat_id,
        chat_from: user?.id,
        chat_to: chat_to,
        group_id: group_id,
        message: message
      })
    }
  }

  function send(message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: ChattingItem) => void, _chat_id?: string) {
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let dummyMsg: any = {
      "data": {
        "msg": message,
        "read": "2",
        "time": _time,
        "user_id": user.id,
      },
      "id": _time,
    }
    if (attach) {
      dummyMsg.data["attach"] = attach
    }
    setData(LibObject.unshift(data, dummyMsg)())
    const lchat_id = _chat_id || chat_id

    if (lchat_id) {
      ChattingCache_sendProperty.insertToCache(lchat_id, chat_to, group_id, message, attach, false)
      sync(ChattingCache_sendProperty.state().get())
      setNotif(lchat_id, message)
      callback && callback(lchat_id, dummyMsg)
    } else {
      ChattingLib().chatSendNew(chat_to, message, attach, true, (msg: ChattingItem, chat_id) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg?.msg)
        setChat_id(chat_id)
      })
    }
  }

  function sendNoCache(message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: ChattingItem) => void, _chat_id?: string) {
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let dummyMsg: any = {
      "data": {
        "msg": message,
        "read": "2",
        "time": _time,
        "user_id": user.id,
      },
      "id": _time,
    }
    if (attach) {
      dummyMsg.data["attach"] = attach
    }
    setData(LibObject.unshift(data, dummyMsg)())
    const lchat_id = _chat_id || chat_id

    if (lchat_id) {
      ChattingLib().chatSend(lchat_id, chat_to, message, attach, (msg: ChattingItem) => {
        callback && callback(lchat_id, msg)
        setNotif(lchat_id, msg?.msg)
      })
    } else {
      ChattingLib().chatSendNew(chat_to, message, attach, true, (msg: ChattingItem, chat_id) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg?.msg)
        setChat_id(chat_id)
      })
    }
  }

  function formatTimestampToDate(timestamp: number) {
    const currentTimestamp = (new Date().getTime() / 1000).toFixed(0)
    const date = new Date(Number(timestamp || currentTimestamp) * 1000);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).
      padStart(2, '0')}-${String(date.getDate()).
        padStart(2, '0')} ${String(date.getHours()).
          padStart(2, '0')}:${String(date.getMinutes()).
            padStart(2, '0')}:${String(date.getSeconds()).
              padStart(2, '0')}`;
    return formattedDate
  }

  return {
    chat_id: chat_id,
    conversation: data.map((item: any) => ({ ...item?.data, ...item, key: item?.id, time: formatTimestampToDate(item.time) })),
    chat_to_online: online,
    chat_to_user: opposite,
    error: error,
    firstKey: data && data[0],
    hasPrevious: hasNext,
    loading: loading,
    loadPrevious: loadPrevious,
    send: send,
    sendNoCache: sendNoCache
  }
}