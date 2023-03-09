// @ts-ignore
// useLibs
// noPage
import { esp, useSafeState } from 'esoftplay';
import Firestore from 'esoftplay-firestore';
import { ChattingCache } from 'esoftplay/cache/chatting/cache/import';
import { ChattingCache_sendProperty } from 'esoftplay/cache/chatting/cache_send/import';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { ChattingOnline_listener } from 'esoftplay/cache/chatting/online_listener/import';
import { ChattingOpen_listener } from 'esoftplay/cache/chatting/open_listener/import';
import { ChattingOpen_setter } from 'esoftplay/cache/chatting/open_setter/import';
import { ChattingPaginate } from 'esoftplay/cache/chatting/paginate/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import { UserClass } from 'esoftplay/cache/user/class/import';

import moment from 'esoftplay/moment';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { useEffect, useRef } from 'react';
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
  chat_to_user: ChatChatReturnUser,
  chat_to_online: string,
  loadPrevious: (firstKey: string) => void,
  firstKey: string,
  conversation: ChattingItem[],
  hasPrevious: boolean,
  error: string,
  loading: boolean
  fetch: boolean
}

export default function m(props: ChattingChatProps): ChatChatReturn {
  const [cacheSendData] = ChattingCache_sendProperty.state().useState()
  const user = UserClass.state().useSelector((s: any) => s)
  const [chat_id, setChat_id] = useSafeState(props.chat_id)
  const { chat_to } = props
  const group_id = props?.group_id || esp.config('group_id')
  const [hasNext, setHasNext] = useSafeState(true)
  const [data, setData] = ChattingCache([], 'chatting_chat_message' + chat_id)
  const [error, setError] = useSafeState("")
  const [loading, setLoading] = useSafeState(data?.length > 0 ? false : true)
  const [isReady, setIsReady] = useSafeState(data?.length > 0 ? false : true)

  const [online, opposite] = ChattingOnline_listener(chat_to)
  const [isOpenChat] = ChattingOpen_listener(chat_id, chat_to)

  ChattingOpen_setter(chat_id)

  useEffect(() => {
    let exec = setTimeout(async () => {
      let error = ''
      if (chat_to == undefined || chat_to == '') {
        error = "Tujuan chat tidak ditemukan"
      } else if (chat_to == user?.id) {
        error = "Tidak dapat mengirim pesan ke diri sendiri"
      } else if (group_id == undefined || group_id == "") {
        error = "Tujuan chat tidak valid"
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


  function setRead(chat: any) {
    const path = ChattingLib().pathChat
    const pathHistory = ChattingLib().pathHistory

    if (!user || !user.hasOwnProperty("id")) return

    Firestore.update.doc([...path, chat_id, 'conversation', chat?.id], [{ key: "read", value: "1" }], () => { })
    Firestore.get.collectionIds([...pathHistory], [["user_id", "==", user?.id], ["chat_to", "==", chat?.user_id]], (snap: any) => {
      const dt = snap?.[0]
      if (dt) {
        Firestore.update.doc([...pathHistory, dt], [{ key: "read", value: "1" }], () => { })
      }
    })
    Firestore.get.collectionIds([...pathHistory], [["user_id", "==", chat?.user_id], ["chat_to", "==", user?.id]], (snap: any) => {
      const dt = snap?.[0]
      if (dt) {
        Firestore.update.doc([...pathHistory, dt], [{ key: "read", value: "1" }], () => { })
      }
    })
  }

  const dataRef = useRef(data)
  const [lastDocument, setLastDocument] = useSafeState<any>(null);
  const [fetchingData, setFetchingData] = useSafeState(true);

  function updateData(newData: any) {
    dataRef.current = newData;
    setData(newData);
    setIsReady(true)
  }

  function subs(): () => void {
    const unsub = ChattingPaginate().getFirstChatsBatch(chat_id, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const chats: any[] = [];
      querySnapshot.docChanges().forEach(({ type, doc }) => {
        if (type === "added") chats.push({ id: doc.id, ...doc.data() });
      });
      if (dataRef.current.length === 0)
        setLastDocument(
          querySnapshot.docChanges()[querySnapshot.docChanges().length - 1].doc
        );
      setFetchingData(false);
      updateData([...chats, ...dataRef.current]);
    });

    return () => {
      unsub();
    };
  }

  useEffect(() => {
    if (chat_id && !loading) {
      subs()
    }
  }, [chat_id, loading])


  useEffect(() => {
    if (data) {
      // update()
      if (data.length > 0) {
        data.filter((c: any) => c?.read == '0' && c?.user_id != user?.id).forEach((x: any) => {
          setRead(x)
        })
      }
    }
  }, [data])

  async function loadPrevious(lastKey: string) {
    if (isReady) {
      if (!lastDocument) return;
      setFetchingData(true);
      const { chats, lastVisible } = await ChattingPaginate().chatsNextBatch(chat_id, lastDocument);

      setLastDocument(lastVisible);
      setFetchingData(false);
      updateData([...data, ...chats]);

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
      callback && callback(lchat_id, dummyMsg)
      ChattingCache_sendProperty.insertToCache(lchat_id, chat_to, group_id, message, attach)
      setNotif(lchat_id, message)
    } else {
      ChattingLib().chatSendNew(chat_to, message, attach, true, (msg, chat_id) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg)
        setChat_id(chat_id)
      })
    }
  }

  const _time = (new Date().getTime() / 1000).toFixed(0)
  let dummies = cacheSendData.filter((x: any) => x.chat_to == chat_to)?.map?.((item: any) => {
    let dummyMsg: any = {
      "data": {
        "msg": item.message,
        "read": "2",
        "time": _time,
        "user_id": user.id,
      },
      "id": _time
    }
    return { ...dummyMsg, ...dummyMsg.data, key: dummyMsg.id }
  })

  const dataCurrent = data?.map?.((item: any) => ({ ...item?.data, ...item, key: item?.id }))
  const dataFromCache = dummies

  const ids = new Set(dataCurrent.map((d: any) => d.message));
  const merged = [...dataCurrent, ...dataFromCache.filter((d: any) => !ids.has(d.message))];

  return {
    chat_id: chat_id,
    conversation: merged || [],
    chat_to_online: online,
    chat_to_user: opposite,
    error: error,
    firstKey: data && data[0],
    hasPrevious: hasNext,
    loading: loading,
    loadPrevious: loadPrevious,
    send: send,
    fetch: fetchingData
  }
}