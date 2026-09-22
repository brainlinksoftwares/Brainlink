/**
 * Unified persistence engine for Brainlink Studio CRM.
 * Manages collections with reactive listeners and persistent local cache.
 */

type ListenerCallback = () => void;

class StorageEngine {
  private listeners: Map<string, Set<ListenerCallback>> = new Map();

  private getKey(collectionName: string): string {
    return `brainlink_studio_${collectionName}`;
  }

  get<T>(collectionName: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(collectionName));
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error(`Error reading ${collectionName} from storage`, err);
      return [];
    }
  }

  set<T>(collectionName: string, items: T[]): void {
    try {
      localStorage.setItem(this.getKey(collectionName), JSON.stringify(items));
      this.notify(collectionName);
    } catch (err) {
      console.error(`Error saving ${collectionName} to storage`, err);
    }
  }

  subscribe(collectionName: string, callback: ListenerCallback): () => void {
    if (!this.listeners.has(collectionName)) {
      this.listeners.set(collectionName, new Set());
    }
    const set = this.listeners.get(collectionName)!;
    set.add(callback);

    return () => {
      set.delete(callback);
    };
  }

  private notify(collectionName: string): void {
    const set = this.listeners.get(collectionName);
    if (set) {
      set.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  clearAll(): void {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('brainlink_studio_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}

export const storageEngine = new StorageEngine();
