// useLibs

import React, { useEffect, useMemo } from 'react';
import { ChatLib, useSafeState, LibObject, ChatOnline_listener, ChatOpen_listener, LibCurl, LibNavigation, esp, ChatOpen_setter } from 'esoftplay';
import AsyncStorage from '@react-native-community/async-storage';
import { InteractionManager } from 'react-native';
import { useSelector } from 'react-redux';

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
  enabled: string
}


export interface ChatChatProps {
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
  online: string
}

export interface ChatChatReturn {
  chat_id: string,
  send: (message: string, attach?: any, callback?: (chat_id: string, message: string) => void) => void,
  chat_to_user: ChatChatReturnUser,
  chat_to_online: string,
  loadPrevious: (firstKey: string) => void,
  firstKey: string,
  conversation: ChattingItem[],
  hasPrevious: boolean,
  error: string,
  loading: boolean
}

export default function m(props: ChatChatProps): ChatChatReturn {
  const user = useSelector((state: any) => state.user_class)
  const chatLib = useMemo(() => new ChatLib(), [])
  const [chat_id, setChat_id] = useSafeState(props.chat_id)
  const { chat_to } = props
  const group_id = props?.group_id || esp.config('group_id')
  const [hasNext, setHasNext] = useSafeState(true)
  const [data, setData] = useSafeState<any>()
  const [queryKeys, setQueryKeys] = useSafeState<string[]>([])
  const [error, setError] = useSafeState("")
  const [loading, setLoading] = useSafeState(true)
  const [online, opposite] = ChatOnline_listener(chat_to)
  const [isOpenChat] = ChatOpen_listener(chat_id, chat_to)
  let chatAddListener: any = undefined
  let chatChangeListener: any = undefined
  ChatOpen_setter(chat_id)

  useEffect(() => {
    let exec = InteractionManager.runAfterInteractions(async () => {
      let error = ''
      if (chat_to == undefined || chat_to == '') {
        error = "Tujuan chat tidak ditemukan"
      } else if (chat_to == user.id) {
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
    })
    return () => exec.cancel()
  }, [])

  useEffect(() => {
    if (chat_id && !loading && chatAddListener == undefined && chatChangeListener == undefined) {
      getCache(chat_id, (chats) => {
        if (chats) {
          let keys = Object.keys(chats)
          const lastKey = chats[keys[keys.length - 1]].key
          // setQueryKeys(Object.keys(chats))
          setData(chats)
          chatAddListener = chatLib.chatListenAdd(chat_id, String(lastKey), (chat: any) => {
            const newChats = { ...data, [chat.key]: chat }
            setData(newChats)
            setCache(chat_id, newChats)
          })
          chatChangeListener = chatLib.chatListenChange(chat_id, (chat) => {
            const newChats = { ...data, [chat.key]: chat }
            setData(newChats)
            setCache(chat_id, newChats)
          })
        } else {
          chatLib.chatGetAll(chat_id, '', (chats) => {
            setData(chats)
            setQueryKeys(Object.keys(chats))
            setCache(chat_id, chats)
          })
        }
      })
    }
    return () => {
      if (chatAddListener) chatAddListener()
      if (chatChangeListener) chatChangeListener()
    }
  }, [chat_id, loading])

  function loadPrevious(lastKey: string) {
    if (!queryKeys.includes(lastKey)) {
      chatLib.chatGetAll(chat_id, lastKey, (chats) => {
        const allKeys = LibObject.push(queryKeys, lastKey)()
        if (allKeys.length == queryKeys.length) {
          setHasNext(false)
        }
        setQueryKeys(allKeys)
        setData({ ...chats, ...data })
        setCache(chat_id, { ...chats, ...data })
      })
    } else {
      setHasNext(false)
    }
  }

  function setNotif(chat_id: string, message: string): void {
    if (isOpenChat) {
      new LibCurl('user_notif_chat', {
        chat_id: chat_id,
        chat_from: user.id,
        chat_to: chat_to,
        group_id: group_id,
        message: message
      })
    }
  }

  function send(message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: string) => void) {
    if (chat_id) {
      chatLib.chatSend(chat_id, chat_to, message, attach, (msg) => {
        callback && callback(chat_id, message)
        setNotif(chat_id, message)
      })
    } else {
      chatLib.chatSendNew(chat_to, message, attach, true, (message: string, chat_id: string) => {
        setChat_id(chat_id)
        callback && callback(chat_id, message)
        setNotif(chat_id, message)
      })
    }
  }

  return {
    chat_id: chat_id,
    // @ts-ignore
    conversation: (data && Object.values(data) || []).reverse(),
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