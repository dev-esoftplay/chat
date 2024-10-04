// useLibs
// noPage

import useSafeState from "esoftplay/state";
import Storage from "esoftplay/storage";
import { useLayoutEffect } from "react";


export default function m(initValue: any, persistKey: string) {
  const [a, b] = useSafeState<any>([])

  useLayoutEffect(() => {
    get()
  }, [])

  function get() {
    Storage.getItem(persistKey).then((val) => {
      b(val != null ? val : initValue)
    })
  }

  function set(val: any) {
    b(val)
    Storage.setItem(persistKey, JSON.stringify(val))
  }

  return [a, set]
}