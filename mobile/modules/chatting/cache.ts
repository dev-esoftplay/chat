// useLibs

import { UserData } from 'esoftplay/cache/user/data/import';
import FastStorage from 'esoftplay/mmkv';
import useSafeState from 'esoftplay/state';
import { useLayoutEffect } from 'react';

export default function m<T>(initValue: T, persistKey: string) {
  UserData.register(persistKey)
  const [state, setState, get] = useSafeState<T>(initValue);

  useLayoutEffect(() => {
    const storedValue: any = FastStorage.getItemSync(persistKey);
    try {
      if (storedValue !== null && storedValue != undefined) {
        setState(JSON.parse(storedValue));
      }
    } catch (error) {
      console.error("Failed to parse stored value:", error);
      setState(initValue);
    }
  }, [persistKey]);

  const setPersistentState = (value: T) => {
    setState(value);
    try {
      FastStorage.setItem(persistKey, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to store value:", error);
    }
  };

  return [state, setPersistentState, get] as const;
}