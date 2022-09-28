// @ts-ignore
// useLibs
// noPage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { esp, useSafeState } from 'esoftplay';
import { ChattingHistory } from 'esoftplay/cache/chatting/history/import';
import { ChattingOnline_listener } from 'esoftplay/cache/chatting/online_listener/import';
import { ChattingOpen_listener } from 'esoftplay/cache/chatting/open_listener/import';
import { ChattingOpen_setter } from 'esoftplay/cache/chatting/open_setter/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { LibWorkloop } from 'esoftplay/cache/lib/workloop/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserData } from 'esoftplay/cache/user/data/import';

import moment from 'esoftplay/moment';
import { useEffect } from 'react';
import Firestore from './firestore';
import ChattingLib from './lib';
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

function getCache(chat_id: string, callback: (cache: any) => void) {
  AsyncStorage.getItem('chat_cache_' + chat_id, (error, result) => {
    if (result)
      callback(JSON.parse(result))
    else
      callback(null)
  })
}

function setCache(chat_id: string, cache: any) {
  // AsyncStorage.setItem('chat_cache_' + chat_id, JSON.stringify(cache))
}

export interface ChatChatReturnUser {
  username: string,
  image: string,
  online: string,
  deleted: 0 | 1
}

export interface ChatChatReturn {
  chat_id: string,
  send: (message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: ChattingItem) => void) => void,
  chat_to_user: ChatChatReturnUser,
  chat_to_online: string,
  loadPrevious: (firstKey: string) => void,
  firstKey: string,
  conversation: ChattingItem[],
  hasPrevious: boolean,
  error: string,
  loading: boolean
}

export default function m(props: ChattingChatProps): ChatChatReturn {

  const { update } = ChattingHistory()
  const user = UserClass.state().useSelector((s: any) => s)
  const [chat_id, setChat_id] = useSafeState(props.chat_id)
  const { chat_to } = props
  const group_id = props?.group_id || esp.config('group_id')
  const [hasNext, setHasNext] = useSafeState(true)
  const [data, setData] = useSafeState<any>([])
  const [error, setError] = useSafeState("")
  const [loading, setLoading] = useSafeState(true)
  const [isReady, setIsReady] = useSafeState(false)

  const [online, opposite] = ChattingOnline_listener(chat_to)
  const [isOpenChat] = ChattingOpen_listener(chat_id, chat_to)
  UserData.register('chat_cache_' + chat_id)
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
        ChattingLib().getChatId(chat_to, group_id, chat_id => {
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

    Firestore.update.doc([...path, chat_id, 'conversation', chat.id], [{ key: "read", value: "1" }], () => { })
    Firestore.get.collectionIds([...pathHistory, user.id, group_id], ["time", "==", chat?.data?.time], (snap) => {
      const dt = snap?.[0]
      if (dt) {
        Firestore.update.doc([...pathHistory, user.id, group_id, dt], [{ key: "read", value: "1" }], () => { })
      }
    })
    Firestore.get.collectionIds([...pathHistory, chat.data.user_id, group_id], ["time", "==", chat?.data?.time], (snap) => {
      const dt = snap?.[0]
      if (dt) {
        Firestore.update.doc([...pathHistory, chat.data.user_id, group_id, dt], [{ key: "read", value: "1" }], () => { })
      }
    })
  }

  useEffect(() => {
    if (chat_id && !loading) {
      ChattingLib().chatListenChange(chat_id, (datas) => {
        ChattingLib().chatGetAll(chat_id, (chats, endReach) => {
          setData(chats)
          setIsReady(true)
        }, 1, 20)
      })
    }
  }, [chat_id, loading])


  useEffect(() => {
    if (data) {
      update()
      LibWorkloop.execNextTix(setCache, [chat_id, data])
      if (data.length > 0) {
        data.filter((c: any) => c?.data?.read == '0' && c?.data?.user_id != user?.id).forEach((x: any) => {
          setRead(x)
        })
      }
    }
  }, [data])

  function loadPrevious(lastKey: string) {
    if (isReady) {
      LibUtils.debounce(() => {
        ChattingLib().chatGetAll(chat_id, (chats) => {
          if (chats) {
            setData([...data, ...chats])
          } else {
          }
        }, 0, 20)
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

  function send(message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: ChattingItem) => void) {
    if (chat_id) {
      ChattingLib().chatSend(chat_id, chat_to, message, attach, (msg: ChattingItem) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg.msg)
      })
    } else {
      ChattingLib().chatSendNew(chat_to, message, attach, true, (msg: ChattingItem, chat_id: string) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg.msg)
        setChat_id(chat_id)
      })
    }
  }

  return {
    chat_id: chat_id,
    conversation: data,
    chat_to_online: online,
    chat_to_user: opposite,
    error: error,
    firstKey: data && data[0],
    hasPrevious: hasNext,
    loading: loading,
    loadPrevious: loadPrevious,
    send: send
  }
}