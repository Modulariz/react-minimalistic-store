import React, { createContext, useContext, useMemo, useState } from "react";
import _ from "lodash";

type SetStateFunc<T> = (
  newState: Partial<T>,
  config?: {
    mergeStrategy: "shallow" | "deep" | "replace";
  }
) => {};
type StoreContext<T> = { store: T; setState: SetStateFunc<T> };

export default function createStore<T>(initialState: T): {
  useStore: () => StoreContext<T>;
  StoreProvider: React.FC;
} {
  const Context = createContext<StoreContext<T>>({
    store: initialState,
    setState: (newState, mergeStrategy) => ({}),
  });

  const StoreProvider: React.FC = ({ children }) => {
    const [store, setStore] = useState(initialState);

    //TODO: check if these merge and spread operations cause rerenders
    const setState = (
      newState: Partial<T>,
      { mergeStrategy } = { mergeStrategy: "deep" }
    ) => {
      switch (mergeStrategy) {
        case "deep": {
          setStore(_.merge(newState, store));
          break;
        }
        case "shallow": {
          setStore({ ...store, ...newState });
          break;
        }
        case "replace": {
          setStore({ ...newState } as T);
          break;
        }
        default: {
          throw new Error(`merge strategy "${mergeStrategy}" not supported`);
        }
      }

      return {};
    };

    const value = useMemo(() => ({ store, setState }), [store, setState]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useStore = () => {
    return useContext(Context);
  };

  return { StoreProvider, useStore };
}
