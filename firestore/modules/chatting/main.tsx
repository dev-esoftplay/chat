// withHooks

import { useSafeState } from 'esoftplay';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibInput } from 'esoftplay/cache/lib/input/import';
import { LibList } from 'esoftplay/cache/lib/list/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import useGlobalState from 'esoftplay/global';
import React, { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import Firestore from './firestore';


export interface ChattingMainArgs {

}
export interface ChattingMainProps {

}
const input = useGlobalState<string>('')
export default function m(props: ChattingMainProps): any {
  const [list, setList] = useSafeState<any[]>([]);
  const inputRef = useRef<LibInput>(null)

  useEffect(() => {
    Firestore.init()
    Firestore.db()
    // Firestore.get.collection(['users'], [], (list) => {
    //   setList(list)
    // })
    // Firestore.get.doc(['users', 'TB87yOhF8cH81gVmcQjA', 'chat_ids', 'UTYHdksUqjf3gFdVFrRq'], [], (doc) => {
    //   console.log("DOC", doc)
    // })
    Firestore.listen.collection(['users'], (data) => {
      setList(data)
    }, (err) => {
      console.log(err);
    })
    // Firestore.listen.doc(['users', 'gae58AMVAaKaygT0KppS'], (data) => {
    //   // setList(data)
    //   console.log(data);
    // }, (err) => {
    //   console.log(err);
    // })
  }, [])


  return (
    <View style={{ flex: 1, paddingTop: LibStyle.STATUSBAR_HEIGHT + 10 }} >

      <Pressable onPress={() => {
        Firestore.add.doc(['users', 'gae58AMVAaKaygT0KppS', 'chat', 'wu3O7SqjhjWJKU4q3maI'], { id: 1, name: 'mukhlis' }, () => {
          console.log('sukses add doc');
        })
      }} style={{ marginBottom: 10, alignItems: 'center', padding: 10, backgroundColor: 'orange' }}>
        <LibTextstyle text='ADD DOC' textStyle='headline' style={{ color: 'white' }} />
      </Pressable>

      <Pressable onPress={() => {
        Firestore.add.collection(['users'], { id: 1, name: 'mukhlis' }, () => {
          console.log('sukses add collection');
        }, (e) => {
          console.log(e);
        })
      }} style={{ marginBottom: 10, alignItems: 'center', padding: 10, backgroundColor: 'orange' }}>
        <LibTextstyle text='ADD COLLECTION' textStyle='headline' style={{ color: 'white' }} />
      </Pressable>

      <LibList
        data={list}
        renderItem={(item: any, i: number) => {
          return (
            <View key={Number(item?.data?.id)} style={{ marginBottom: 20, marginRight: 20 }} >
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                <LibTextstyle text={JSON.stringify(item)} textStyle="body" style={{ flex: 1 }} />
                {
                  item.id != "gae58AMVAaKaygT0KppS" &&
                  <Pressable onPress={() => {
                    Firestore.delete.doc(['users', item.id], () => {
                      console.log('deleted');

                    }, (err) => { })
                  }} >
                    <LibIcon name="delete" />
                  </Pressable>
                }
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <View style={{ borderWidth: 1, flex: 1, marginRight: 10 }}>
                  <LibInput
                    ref={inputRef}
                    base
                    defaultValue={item?.data?.name}
                    onChangeText={(t) => {
                      input.set(t)
                    }}
                    style={{ flex: 1, padding: 10 }}
                  />
                </View>
                <Pressable onPress={() => {
                  Firestore.update.doc(['users', item.id, 'name'], input.get(), () => {

                  }, (err) => {

                  })
                }}>
                  <LibIcon name="pencil" />
                </Pressable>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}