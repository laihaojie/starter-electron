import Store from 'electron-store'

const store = new Store()

export function storeGet(key: string) {
  return store.get(key)
}

export function storeSet(key: string, value: any) {
  store.set(key, value)
}

export function storeRemote(key: string) {
  store.delete(key)
}
