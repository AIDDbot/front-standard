type Listener<T> = (value: T) => void;

interface StoreOptions {
  persist?: boolean;
}

export function createStore<T>(key: string, initial: T, options: StoreOptions = {}) {
  let value = initial;

  if (options.persist) {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        value = JSON.parse(stored) as T;
      } catch {
        // corrupt entry — keep the initial value
      }
    }
  }

  const listeners = new Set<Listener<T>>();

  return {
    get(): T {
      return value;
    },
    set(next: T): void {
      value = next;
      if (options.persist) localStorage.setItem(key, JSON.stringify(next));
      for (const listener of listeners) listener(next);
    },
    subscribe(listener: Listener<T>): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
