import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

// ─── Hardcoded Admin Credentials & Simulated Store ──────────────────────────

export const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '123456',
  name: 'مدير النظام',
  role: 'ADMIN' as UserRole,
};

const USERS_STORAGE_KEY = 'komur_registered_users';
const SESSION_STORAGE_KEY = 'komur_auth_user';

interface StoredAccount {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

function getStoredUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStoredUsers(users: StoredAccount[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // Persist session
  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      // Simulate quick natural network latency
      await new Promise((r) => setTimeout(r, 450));

      const normalised = email.trim().toLowerCase();

      // Check Hardcoded Admin Credentials
      if (normalised === ADMIN_CREDENTIALS.email) {
        if (password === ADMIN_CREDENTIALS.password) {
          const adminUser: AuthUser = {
            id: 'admin_root',
            name: ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            role: 'ADMIN',
          };
          setUser(adminUser);
          return { ok: true };
        } else {
          return { ok: false, error: 'كلمة المرور غير صحيحة لحساب المسؤول.' };
        }
      }

      // Check registered accounts
      const existingUsers = getStoredUsers();
      const existing = existingUsers.find((u) => u.email.toLowerCase() === normalised);

      if (existing) {
        if (existing.password !== password) {
          return { ok: false, error: 'كلمة المرور غير صحيحة.' };
        }
        const authUser: AuthUser = {
          id: `user_${Date.now()}`,
          name: existing.name,
          email: existing.email,
          role: existing.role || 'USER',
        };
        setUser(authUser);
        return { ok: true };
      }

      // Any other email & password combination registers or logs in as standard regular USER
      const fallbackName = normalised.split('@')[0] || 'مستخدم كريم';
      const formattedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
      
      const newRegularUser: StoredAccount = {
        name: formattedName,
        email: normalised,
        password: password,
        role: 'USER',
      };
      existingUsers.push(newRegularUser);
      saveStoredUsers(existingUsers);

      const authUser: AuthUser = {
        id: `user_${Date.now()}`,
        name: formattedName,
        email: normalised,
        role: 'USER',
      };
      setUser(authUser);
      return { ok: true };
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 450));

      const normalised = email.trim().toLowerCase();

      // If signing up with the exact admin email, verify or assign
      if (normalised === ADMIN_CREDENTIALS.email) {
        if (password === ADMIN_CREDENTIALS.password) {
          const adminUser: AuthUser = {
            id: 'admin_root',
            name: name.trim() || ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            role: 'ADMIN',
          };
          setUser(adminUser);
          return { ok: true };
        } else {
          return { ok: false, error: 'هذا البريد مخصص للمسؤول، يرجى كتابة كلمة المرور الصحيحة (123456).' };
        }
      }

      const existingUsers = getStoredUsers();
      const alreadyExistsIndex = existingUsers.findIndex((u) => u.email.toLowerCase() === normalised);

      const userRecord: StoredAccount = {
        name: name.trim() || 'عميل كُومُر',
        email: normalised,
        password: password,
        role: 'USER',
      };

      if (alreadyExistsIndex >= 0) {
        existingUsers[alreadyExistsIndex] = userRecord;
      } else {
        existingUsers.push(userRecord);
      }
      saveStoredUsers(existingUsers);

      const authUser: AuthUser = {
        id: `user_${Date.now()}`,
        name: userRecord.name,
        email: userRecord.email,
        role: 'USER',
      };
      setUser(authUser);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.role === 'ADMIN',
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
