class LocalStorageService {
  /**
   * Check if localStorage is available (client-side only)
   */
  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  set<T>(key: string, value: T): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage is not available (SSR environment)");
      return;
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }

  get<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage is not available (SSR environment)");
      return null;
    }
    
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  }

  remove(key: string): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage is not available (SSR environment)");
      return;
    }
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage", error);
    }
  }

  clear(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage is not available (SSR environment)");
      return;
    }
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  }
}

const localStorageService = new LocalStorageService();
export default localStorageService;
