// withHooks

import React, { useEffect, useMemo } from 'react';
import { LibUtils, ChatLib, esp, useSafeState, LibStyle, LibList, LibTextstyle, LibObject, LibLoading, ChatOnline_listener, ChatOpen_listener } from 'esoftplay';
import AsyncStorage from '@react-native-community/async-storage';
import { View } from 'react-native';

export interface ChatChatProps {

}

function getCache(chat_id: string, callback: (cache: any) => void) {
  AsyncStorage.getItem(chat_id, (error, result) => {
    if (result)
      callback(JSON.parse(result))
    else
      callback(null)
  })
}

function setCache(chat_id: string, cache: any) {
  AsyncStorage.setItem(chat_id, JSON.stringify(cache))
}

export default function m(props: ChatChatProps): any {

  const args = LibUtils.getArgsAll(props)
  const [chat_id, setChat_id] = useSafeState(args.chat_id)
  const { chat_to, group_id } = args
  const [hasNext, setHasNext] = useSafeState(true)
  const chatLib = useMemo(() => new ChatLib(), [])
  const [data, setData] = useSafeState<any>()
  const [queryKeys, setQueryKeys] = useSafeState<string[]>([])
  const [online] = ChatOnline_listener(chat_to)
  const [openChat] = ChatOpen_listener(chat_id, chat_to)
  const [opposite, setOpposite] = useSafeState<any>()

  useEffect(() => {
    let userListener: () => void
    if (chat_id) {
      getCache(chat_id, (chats) => {
        if (chats) {
          setData({ ...chats, ...data })
          setQueryKeys(Object.keys(chats))
        } else {
          chatLib.chatGetAll(chat_id, '', (chats) => {
            setData({ ...chats, ...data })
            setCache(chat_id, { ...chats, ...data })
          })
        }
      })
      userListener = chatLib.listenUser(chat_to, (opposite) => {
        setOpposite(opposite)
      })
    }
    return () => {
      userListener()
    }
  }, [])

  function loadBefore(lastKey: string) {
    esp.log('CALLEDi');
    if (!queryKeys.includes(lastKey)) {
      esp.log('DHSKJDN');
      chatLib.chatGetAll(chat_id, lastKey, (chats) => {
        setQueryKeys(LibObject.push(queryKeys, lastKey)())
        setData({ ...chats, ...data })
        setCache(chat_id, { ...chats, ...data })
      })
    } else {
      setHasNext(false)
    }
  }

  if (!data) {
    return null
  }

  return (
    <View style={{ flex: 1, paddingTop: LibStyle.STATUSBAR_HEIGHT }} >
      {
        opposite &&
        <View>
          <LibTextstyle text={opposite?.username} textStyle="body" />
          <LibTextstyle text={online} textStyle="callout" />
        </View>
      }
      {
        !chat_id && (
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} >
            <LibTextstyle textStyle="body" text="Belum ada pesan" />
          </View>
        )
      }
      <LibList
        data={Object.values(data).reverse()}
        onEndReached={() => loadBefore(Object.keys(data)[0])}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => hasNext ? <LibLoading /> : <LibTextstyle textStyle="footnote" text="all pages " />}
        style={{ transform: [{ scaleY: -1 }], flex: 1 }}
        renderItem={(x) => <LibTextstyle textStyle="body" text={x.msg + ' ' + x.time} style={{ margin: 17, transform: [{ scaleY: -1 }] }} />}
      />
    </View>
  )
}