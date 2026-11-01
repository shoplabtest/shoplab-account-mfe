declare module 'host/ui' {
  export interface User { id: string; role: 'customer' | 'staff' | 'admin' }
  export function useAuth(): {
    user: User | null;
    login(email: string, password: string): Promise<void>;
    logout(): Promise<void>;
  };
  export function authFetch<T>(path: string, init?: RequestInit): Promise<T>;
}
