// withHooks

import React, { useEffect } from 'react';
import { View, InteractionManager, Text, TouchableOpacity } from 'react-native';
import { LibUtils, LibNavigation, useSafeState, ChatMain, esp, LibLoading, LibIcon, ChatOnline_listener, ChatOpen_listener, ChatHeader, ChatOpen_setter, usePersistState } from 'esoftplay';
import { useSelector } from 'react-redux';


export interface ChatChatProps {

}


export default function m(props: ChatChatProps): any {
  const main = ChatMain()
  const user = useSelector((state: any) => state.user_class)
  const [chat_id, setChat_id] = useSafeState(LibUtils.getArgs(props, "chat_id"))
  const [chat_to] = useSafeState(LibUtils.getArgs(props, "chat_to"))
  const [group_id] = useSafeState(LibUtils.getArgs(props, "group_id", esp.config("group_id")))
  const [loading, setLoading] = useSafeState(true)
  const [error, setError] = useSafeState("")

  let exec
  useEffect(() => {
    exec = InteractionManager.runAfterInteractions(async () => {
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
      setChat_id(await getChatId(chat_id))
      setLoading(false)
    })
    return exec.cancel
  }, [])


  function getChatId(chat_id?: string): Promise<string> {
    return new Promise((r) => {
      if (chat_id && chat_id.length > 0) {
        r(chat_id)
      } else {
        /* here we go */
        if (!user.id) return
        const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
          main.child("history").child(id).child(group_id).once("value", snapshoot => {
            if (snapshoot.val()) {
              let s: any[] = Object.values(snapshoot).filter((s: any) => s.user_id == opposite_id)
              if (s.length > 0) {
                callback(s[0].chat_id)
              } else {
                callback("")
              }
            } else {
              callback("")
            }
          })
        }
        /* check my node */
        check(user.id, chat_to, chat_id => {
          if (chat_id) {
            r(chat_id)
          } else {
            /* check opposite node */
            check(chat_to, user.id, chat_id => {
              r(chat_id)
            })
          }
        })
      }
    })
  }

  if (error != '')
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }} >
        <LibIcon.AntDesign name="closecircleo" color={'#444'} size={20} />
        <Text style={{ color: "#444", textAlign: "center", fontSize: 14, marginVertical: 10 }} >{error}</Text>
        <TouchableOpacity onPress={() => LibNavigation.back()} >
          <Text style={{ color: "#444", textAlign: "center", fontSize: 14, fontWeight: "bold" }} >Kembali</Text>
        </TouchableOpacity>
      </View>
    )

  if (loading) return <LibLoading />

  return (
    <InnerChat
      chat_id={chat_id}
      chat_to={chat_to}
      group_id={group_id}
    />
  )
}

function InnerChat(props: any): any {
  const { chat_id, chat_to, group_id } = props
  ChatOpen_setter(chat_id)
  const [onlineStatus] = ChatOnline_listener(chat_to)
  const [openStatus] = ChatOpen_listener(chat_id, chat_to)
  const [chats, setChats] = usePersistState("chats-" + chat_id, {})

  return (
    <View style={{ flex: 1 }} >
      <ChatHeader />
    </View>
  )
}

function InnerListChat(props: any) {

}
