// withHooks

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { ChatFirebase, esp, ChatHistory, LibFocus } from 'esoftplay';


export interface ChatIndexProps {

}

export default function m(props: ChatIndexProps): any {
  const [data, update, delData] = ChatHistory()
  
  return (
    <View style={{ flex: 1 }} >
      <LibFocus onFocus={update} />
    </View>
  )
}