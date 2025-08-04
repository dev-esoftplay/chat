// useLibs
// noPage
import { collection, getDocs, getFirestore, limit as limitFn, orderBy, query, startAfter as startAfterFn, where } from '@react-native-firebase/firestore';
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import { useEffect } from 'react';

export interface ChatHistoryReturn {
  data: any[],
  refresh: () => void,
  loadMore: () => void,
  deleteCache: () => void,
  unread: number
}

const chattingHistory = useGlobalState<any[]>([], {
  inFastStorage: true,
  persistKey: 'chatting_history',
  inFile: true,
  isUserData: true
});
export function state(): useGlobalReturn<any[]> {
  return chattingHistory;
}

const lastVisibleRef = useGlobalState<any>(null)
const loadingRef = useGlobalState<boolean>(false)
const limit = 20;

export default function m(): ChatHistoryReturn {
  const user = UserClass.state().useSelector((s: any) => s);
  const group_id = esp.config("group_id");
  const espFirestore = esp.mod("firestore/index")()
  const app: any = espFirestore.instance()

  useEffect(() => {
    refresh();
  }, []);

  async function update(docs: any[], replace = false) {
    let histories: any[] = [];

    await Promise.all(
      docs.map(async (item: any) => {
        const _snapshoot = item.data();

        const base = {
          user_id: _snapshoot?.sender_id,
          chat_id: _snapshoot?.chat_id,
          chat_to: _snapshoot?.chat_to,
          msg: _snapshoot?.last_message,
          time: _snapshoot?.time,
          read: _snapshoot.read,
          id: item.id,
          data: _snapshoot
        };

        if (_snapshoot?.chat_to_username && _snapshoot?.chat_to_image) {
          histories.push({
            ..._snapshoot,
            ...base,
            username: _snapshoot.chat_to_username,
            image: _snapshoot.chat_to_image
          });
        } else {
          const userPath = ChattingLib().pathUsers;
          const db = getFirestore(app)

          const docRef = query(
            collection(db, espFirestore.castPathToString([...userPath])),
            where("user_id", "==", _snapshoot.chat_to)
          );
          const docSnap = await getDocs(docRef);
          const userData = docSnap.docs[0]?.data();

          if (userData) {
            histories.push({
              ...userData,
              ...base,
              username: userData.username,
              image: userData.image
            });
          } else {
            histories.push(base);
          }
        }
      })
    );

    const newData = replace ? histories : [...state().get(), ...histories];
    state().set(newData.sort((a, b) => b.time - a.time));
  }

  async function _get(replace = false) {
    const db = getFirestore(app)
    if (!user?.id || !group_id || loadingRef.get()) return;
    loadingRef.set(true);

    const pathHistory = ChattingLib().pathHistory;
    const colRef = collection(db, espFirestore.castPathToString([...pathHistory]));

    const constraints = [
      where("user_id", "==", String(user.id)),
      where("group_id", "==", group_id),
      orderBy("time", "desc"),
      limitFn(limit)
    ];

    if (!replace && lastVisibleRef.get()) {
      constraints.push(startAfterFn(lastVisibleRef.get()));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);


    if (!snap.empty) {
      const docs = snap.docs;
      lastVisibleRef.set(docs[docs.length - 1])
      await update(docs, replace);
    }

    loadingRef.reset()
  }

  function refresh() {
    lastVisibleRef.reset()
    _get(true);
  }

  function loadMore() {
    _get(false);
  }

  return {
    data: state().useSelector((x: any) => x),
    refresh,
    loadMore,
    deleteCache: state().reset,
    unread: state().useSelector((x: any) => x).filter?.((x: any) => x?.data?.read === 0)?.length ?? 0
  };
}