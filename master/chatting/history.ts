// useLibs
// noPage

import { collection, getDocs, getFirestore, limit as limitFn, orderBy, query, startAfter as startAfterFn, where } from '@react-native-firebase/firestore'
import { ChattingLib } from 'esoftplay/cache/chatting/lib/import'
import { UserClass } from 'esoftplay/cache/user/class/import'
import esp from 'esoftplay/esp'
import useGlobalState, { useGlobalReturn } from 'esoftplay/global'
import { useMemo } from 'react'

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
})

export function state(): useGlobalReturn<any[]> {
  return chattingHistory
}
export const loadingData = useGlobalState<boolean>(false)

const lastVisibleRef = useGlobalState<any>(null)
const loadingRef = useGlobalState<boolean>(false)

const LIMIT = 20
export default function m(): ChatHistoryReturn {
  const user = UserClass.state().useSelector(s => s)
  const data = state().useSelector(s => s)

  const group_id = esp.config('group_id')

  const espFirestore = esp.mod('firestore/index')()
  const app: any = espFirestore.instance()

  const db = useMemo(() => getFirestore(app), [app])

  const pathHistory = ChattingLib().pathHistory
  const pathUsers = ChattingLib().pathUsers

  async function resolveUsers(docs: any[]) {
    const needFetch = docs
      .map(d => d.data())
      .filter(d => !d.chat_to_username)
      .map(d => d.chat_to)

    if (!needFetch.length) return {}

    const uniq = [...new Set(needFetch)].slice(0, 10)

    const snap = await getDocs(
      query(
        collection(db, espFirestore.castPathToString([...pathUsers])),
        where('user_id', 'in', uniq)
      )
    )

    return Object.fromEntries(
      snap.docs.map(d => [d.data().user_id, d.data()])
    )
  }

  async function update(docs: any[], replace = false) {
    const userMap = await resolveUsers(docs)

    const incoming = docs.map(item => {
      const d = item.data()
      const cachedUser = userMap[d.chat_to]

      return {
        id: item.id,
        chat_id: d.chat_id,
        chat_to: d.chat_to,
        user_id: d.sender_id,
        msg: d.last_message,
        time: d.time,
        read: d.read,
        data: d,
        username: d.chat_to_username ?? cachedUser?.username,
        image: d.chat_to_image ?? cachedUser?.image
      }
    })

    if (replace) {
      state().set(incoming)
      return
    }

    const map = new Map<string, any>()

    for (const item of state().get()) {
      map.set(item.id, item)
    }

    for (const item of incoming) {
      map.set(item.id, item)
    }

    state().set(
      Array.from(map.values()).sort((a, b) => b.time - a.time)
    )
  }

  async function fetchData(replace = false) {
    if (replace) {
      loadingData.set(true)
      lastVisibleRef.reset()
    }

    if (
      !user?.id ||
      !group_id ||
      loadingRef.get() ||
      lastVisibleRef.get() === 'EOF'
    ) {
      loadingData.reset()
      return
    }

    loadingRef.set(true)

    try {
      const constraints: any[] = [
        where('user_id', '==', String(user.id)),
        where('group_id', '==', group_id),
        orderBy('time', 'desc'),
        limitFn(LIMIT)
      ]

      if (!replace && lastVisibleRef.get()) {
        constraints.push(startAfterFn(lastVisibleRef.get()))
      }

      const snap = await getDocs(
        query(
          collection(db, espFirestore.castPathToString([...pathHistory])),
          ...constraints
        )
      )

      if (snap.empty) {
        lastVisibleRef.set('EOF')
        return
      }

      lastVisibleRef.set(snap.docs.at(-1))
      await update(snap.docs, replace)
    } finally {
      loadingRef.reset()
      loadingData.reset()
    }
  }

  function refresh() {
    fetchData(true)
  }

  function loadMore() {
    fetchData(false)
  }

  const unread = useMemo(
    () => data.filter(x => x?.data?.read === 0).length,
    [data]
  )

  return {
    data,
    refresh,
    loadMore,
    deleteCache: state().reset,
    unread
  }
}
