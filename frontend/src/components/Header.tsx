'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import styles from './Header.module.scss';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/quizzes" className={styles.logo}>
                    Quiz Builder
                </Link>
                {user && (
                    <nav className={styles.nav}>
                        <Link href="/quizzes">Quizzes</Link>
                        <Link href="/create">Create</Link>
                        <span className={styles.user}>{user.username}</span>
                        <button type="button" className={styles.logout} onClick={logout}>
                            Log out
                        </button>
                    </nav>
                )}
            </div>
        </header>
    );
}
