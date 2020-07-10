// withHooks

import React, { useEffect } from 'react';
import { View, InteractionManager, TouchableOpacity, Text, Alert } from 'react-native';
import { LibLoading, useSafeState, esp, LibNavigation, LibTextstyle, ChatLib, LibIcon, LibUtils } from 'esoftplay';
import { useSelector } from 'react-redux';

export interface ChatOpenProps {

}
export function now(chat_to: string, chat_id?: string, group_id?: string) {
  LibNavigation.navigate('chat/open', { chat_to, chat_id, group_id })
}


export default function m(props: ChatOpenProps): any {

  const { chat_to, chat_id, group_id } = LibUtils.getArgsAll(props)
  const user = useSelector((state: any) => state.user_class)

  const [error, setError] = useSafeState('')
  const _group_id = group_id || esp.config('group_id')

  useEffect(() => {
    let exec = InteractionManager.runAfterInteractions(async () => {
      let error = ''
      if (chat_to == undefined || chat_to == '') {
        error = "Tujuan chat tidak ditemukan"
      } else if (chat_to == user.id) {
        error = "Tidak dapat mengirim pesan ke diri sendiri"
      } else if (_group_id == undefined || _group_id == "") {
        error = "Tujuan chat tidak valid"
      }
      if (error != '') {
        setError(error)
        return
      }
      if (!chat_id)
        new ChatLib().getChatId(chat_to, _group_id, chat_id => {
          LibNavigation.replace('chat/chat', {
            chat_to: chat_to,
            chat_id: chat_id,
            group_id: _group_id
          })
        })
      else
        LibNavigation.replace('chat/chat', {
          chat_to: chat_to,
          chat_id: chat_id,
          group_id: _group_id
        })
    })
    return exec.cancel
  }, [])

  return error ?
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }} >
      <LibIcon.AntDesign name="sync" color={'#444'} size={80} />
      <Text style={{ color: "#444", textAlign: "center", fontSize: 14, marginVertical: 40 }} >{error}</Text>
      <TouchableOpacity onPress={() => LibNavigation.back()} >
        <Text style={{ color: "#444", textAlign: "center", fontSize: 14, fontWeight: "bold" }} >Kembali</Text>
      </TouchableOpacity>
    </View>
    :
    <LibLoading />
}