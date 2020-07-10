// withHooks

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChatFirebase, esp, ChatHistory, LibFocus, LibList, LibTextstyle, LibCurl, ChatOnline_setter, LibStyle, ChatOpen, ChatOpenProperty } from 'esoftplay';


export interface ChatIndexProps {

}

export default function m(props: ChatIndexProps): any {
  ChatOnline_setter()
  const { data, update, deleteCache } = ChatHistory()

  useEffect(() => {
    update()
  }, [])

  return (
    <View style={{ flex: 1, paddingTop: LibStyle.STATUSBAR_HEIGHT }} >
      <LibFocus onFocus={update} />
      <LibList
        data={data}
        renderItem={(item) => (
          <TouchableOpacity
            onPress={() => ChatOpenProperty.now(item.chat_to, item.chat_id)}
            style={{ paddingVertical: 10, paddingHorizontal: 17 }} >
            <LibTextstyle textStyle="body" text={item.username} />
            <LibTextstyle textStyle="footnote" text={item.msg} />
            <LibTextstyle textStyle="footnote" text={item.chat_to} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}