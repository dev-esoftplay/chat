// withHooks

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LibStyle, LibIcon, LibNavigation } from 'esoftplay';


export interface ChatHeaderProps {

}
export default function m(props: ChatHeaderProps): any {
  return (
    <View style={{ paddingTop: LibStyle.STATUSBAR_HEIGHT, height: 50, flexDirection: "row", alignItems: "center" }} >
      <TouchableOpacity onPress={() => LibNavigation.back()} >
        <LibIcon.AntDesign name="arrowleft" />
      </TouchableOpacity>
      <Text style={{ marginLeft: 10 }} >Chat</Text>
    </View>
  )
}