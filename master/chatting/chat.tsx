// useLibs

import React, { useEffect, useMemo } from 'react';
import { ChattingLib, useSafeState, ChattingOnline_listener, ChattingOpen_listener, LibCurl, esp, ChattingOpen_setter, ChattingHistory, UserData, UserClass, LibWorkloop } from 'esoftplay';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import moment from 'moment/min/moment-with-locales'
moment.locale('id')

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
  AsyncStorage.setItem('chat_cache_' + chat_id, JSON.stringify(cache))
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

let dataChat: any = {}
let chatAddListener: any = undefined
let chatChangeListener: any = undefined
let chatRemoveListener: any = undefined
export default function m(props: ChattingChatProps): ChatChatReturn {
  const { update } = ChattingHistory()
  const user = UserClass.state().useSelector(s => s)
  const chatLib = useMemo(() => new ChattingLib(), [])
  const [chat_id, setChat_id] = useSafeState(props.chat_id)
  const { chat_to } = props
  const group_id = props?.group_id || esp.config('group_id')
  const [hasNext, setHasNext] = useSafeState(true)
  const [data, setData] = useSafeState<any>()
  const [error, setError] = useSafeState("")
  const [loading, setLoading] = useSafeState(true)
  const [isReady, setIsReady] = useSafeState(false)
  const [online, opposite] = ChattingOnline_listener(chat_to)
  const [isOpenChat] = ChattingOpen_listener(chat_id, chat_to)
  if (chat_id) {
    UserData.register('chat_cache_' + chat_id)
    ChattingOpen_setter(chat_id)
  }

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
      if (!chat_id)
        chatLib.getChatId(chat_to, group_id, chat_id => {
          setLoading(false)
          setChat_id(chat_id)
        })
      else
        setLoading(false)
    }, 0)
    return () => clearTimeout(exec)
  }, [])


  function setRead(chat: any) {
    if (String(chat.user_id) != String(user?.id) && String(chat.read) == '0') {
      chatLib.ref().child('chat').child(chat_id).child('conversation').child(chat.key).child('read').set('1')
    }
  }

  useEffect(() => {
    if (chat_id && !loading) {
      getCache(chat_id, (chats) => {
        if (chats) {
          let keys = Object.keys(chats)
          const lastKey = chats[keys[keys.length - 1]].key
          dataChat = data || chats
          if (chatAddListener == undefined && chatChangeListener == undefined && chatRemoveListener == undefined) {
            chatAddListener = chatLib.chatListenAdd(chat_id, String(lastKey), (chat: any) => {
              if (!Object.keys(dataChat).includes(chat.key)) {
                setRead(chat)
                dataChat = { ...dataChat, [chat.key]: chat }
                setData(dataChat)
              }
            })
            chatChangeListener = chatLib.chatListenChange(chat_id, (chat) => {
              setRead(chat)
              dataChat[chat.key] = chat
              setData({ ...dataChat })
            })
            chatRemoveListener = chatLib.chatListenRemove(chat_id, (chat) => {
              delete dataChat[chat.key]
              setData({ ...dataChat })
            })
          }
          setIsReady(true)
          setData(dataChat)
        } else {
          chatLib.chatGetAll(chat_id, '', (chats) => {
            if (chats) {
              let keys = Object.keys(chats)
              const lastKey = chats[keys[keys.length - 1]].key || ''
              dataChat = data || chats
              if (chatAddListener == undefined && chatChangeListener == undefined && chatRemoveListener == undefined) {
                chatAddListener = chatLib.chatListenAdd(chat_id, String(lastKey), (chat: any) => {
                  if (!Object.keys(dataChat).includes(chat.key)) {
                    setRead(chat)
                    dataChat = { ...dataChat, [chat.key]: chat }
                    setData(dataChat)
                  }
                })
                chatChangeListener = chatLib.chatListenChange(chat_id, (chat) => {
                  setRead(chat)
                  dataChat[chat.key] = chat
                  setData({ ...dataChat })
                })
                chatRemoveListener = chatLib.chatListenRemove(chat_id, (chat) => {
                  delete dataChat[chat.key]
                  setData({ ...dataChat })
                })
              }
            }
            setData(dataChat)
            setIsReady(true)
          })
        }
      })
    }
    return () => {
      if (chatAddListener) {
        chatAddListener()
        chatAddListener = undefined
      }
      if (chatChangeListener) {
        chatChangeListener()
        chatChangeListener = undefined
      }
      if (chatRemoveListener) {
        chatRemoveListener()
        chatRemoveListener = undefined
      }
    }
  }, [chat_id, loading])


  useEffect(() => {
    if (data) {
      LibWorkloop.execNextTix(setCache, [chat_id, data])
      update()
    }
  }, [data])

  function loadPrevious(lastKey: string) {
    if (isReady && lastKey) {
      chatLib.chatGetAll(chat_id, lastKey, (chats) => {
        dataChat = { ...chats, ...dataChat }
        setData(dataChat)
      })
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
      chatLib.chatSend(chat_id, chat_to, message, attach, (msg: ChattingItem) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg.msg)
      })
    } else {
      chatLib.chatSendNew(chat_to, message, attach, true, (msg: ChattingItem, chat_id: string) => {
        callback && callback(chat_id, msg)
        setNotif(chat_id, msg.msg)
        setChat_id(chat_id)
      })
    }
  }

  return {
    chat_id: chat_id,
    // @ts-ignore
    conversation: (Object.values(data || {}) || []).reverse(),
    chat_to_online: online,
    chat_to_user: opposite,
    error: error,
    firstKey: data && Object.keys(data)[0],
    hasPrevious: hasNext,
    loading: loading,
    loadPrevious: loadPrevious,
    send: send
  }
}