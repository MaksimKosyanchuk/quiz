'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, tokenStore } from '@/services/api';
import type { AuthResponse, AuthUser } from '@/types/quiz';

interface AuthContextValue {
    user: AuthUser | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PUBLIC_PATHS = ['/login', '/register'];

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!tokenStore.get()) {
            setReady(true);
            return;
        }
        authApi
            .me()
            .then(setUser)
            .catch(() => tokenStore.clear())
            .finally(() => setReady(true));
    }, []);

    const isPublic = PUBLIC_PATHS.includes(pathname);

    useEffect(() => {
        if (!ready) return;
        if (!user && !isPublic) router.replace('/login');
        if (user && isPublic) router.replace('/quizzes');
    }, [ready, user, isPublic, router]);

    const handleAuth = useCallback((res: AuthResponse) => {
        tokenStore.set(res.accessToken);
        setUser(res.user);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            login: async (username, password) =>
                handleAuth(await authApi.login(username, password)),
            register: async (username, password) =>
                handleAuth(await authApi.register(username, password)),
            logout: () => {
                tokenStore.clear();
                setUser(null);
            },
        }),
        [user, handleAuth],
    );

    // Don't render protected pages until we know who the user is
    const allowed = ready && (user || isPublic);

    return <AuthContext.Provider value={value}>{allowed ? children : null}</AuthContext.Provider>;
}
