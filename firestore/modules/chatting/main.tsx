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
  const [show, setShow] = useSafeState(false)


  const user = { id: '1' }
  const group_id = "4"

  function page(page?: number) {
    Firestore.paginate(["sample"], [], [["id"]], 3, (dt, end) => {
      setShow(true)
      if (end) {
        setShow(false)
      }
      if (page == 0) {
        setList(dt)
      } else {
        setList([...list, ...dt])
      }
    }, (er) => {
      console.log(er);
    })
  }

  useEffect(() => {
    Firestore.init()
    Firestore.db()
    page(0)
    // Firestore.get.collection(['chat', 'chat'], (list) => {
    //   // setList(list)
    //   console.log(list);
    // })
    // Firestore.get.doc(['users', 'zOoEFO2PNETzsv8kD80l'], [], (doc) => {
    //   console.log("DOC", doc)
    // })
    // Firestore.listen.collection(['users'], (data) => {
    //   setList(data)
    // }, (err) => {
    //   console.log(err);
    // })
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
        const _time = (new Date().getTime() / 1000).toFixed(0)

        // Firestore.get.doc(['chat', 'chat', "1663735484", "1663735484", 'conversation', "4QyQ09JyvO1C7M2f8tc7"], [], (dt) => {
        //   console.log(dt);

        // })

        // Firestore.update.doc(['chat', 'history', '1', '4', 'history', "BMGLm0790rXKeFomzB1S"], "time", _time, () => { })

        // Firestore.get.collectionWhere(['chat', 'history', user.id, group_id, "history"], [['chat_id', '==', "1663735484"]], (data) => {
        //   const currentHistory = data
        //   // const currentKeyHistory = Object.keys(currentHistory)[0]
        //   console.log(data);

        // })


      }} style={{ marginBottom: 10, alignItems: 'center', padding: 10, backgroundColor: 'orange' }}>
        <LibTextstyle text='chatSendNew' textStyle='headline' style={{ color: 'white' }} />
      </Pressable>
      <Pressable onPress={() => {
        const chat_id = (new Date().getTime() / 1000).toFixed(0)
        let msg: any = {
          msg: "Hello",
          read: '0',
          time: chat_id,
          user_id: 10,
        }
        let member = {
          is_typing: false,
          draf: ''
        }
        Firestore.add.collection(['chat', 'chat', chat_id, chat_id, 'conversation'], msg, () => { })
        // Firestore.add.collection(['chat', 'chat', "1663732957", "1663732957", 'conversation'], msg, () => { })
        // Firestore.add.collection(['chat', 'chat', chat_id, chat_id, 'member'], member, () => { })

        // Firestore.add.doc(['chat', 'chat', '1663732957', '1663732957', 'member', '8'], member, () => { })
        // Firestore.add.doc(['chat', 'chat', '1663732957', '1663732957', 'member', '24'], member, () => { })

        // Firestore.add.collection(['chat', 'chat', chat_id], member, () => { })



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
        ListFooterComponent={<>
          {
            show &&
            <Pressable onPress={() => {
              page()
            }} style={{ width: 100, height: 40, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center' }}>
              <LibTextstyle text='Load More' textStyle='body' />
            </Pressable>
          }
        </>}
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
    </View >
  )
}