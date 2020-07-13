// withHooks

import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChatHistory, LibList, LibTextstyle, ChatOnline_setter, LibStyle, LibNavigation } from 'esoftplay';


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
      <LibList
        data={data}
        renderItem={(item) => (
          <TouchableOpacity
            onPress={() => LibNavigation.navigate('chat/chatting', { chat_to: item.chat_to })}
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