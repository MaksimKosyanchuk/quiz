'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from './Button';
import { useAuth } from './AuthProvider';
import styles from './AuthForm.module.scss';

const schema = z.object({
    username: z.string().trim().min(3, 'At least 3 characters').max(30, 'At most 30 characters'),
    password: z.string().min(6, 'At least 6 characters').max(72, 'At most 72 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
    const { login, register: registerUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' });

    const isLogin = mode === 'login';

    async function onSubmit({ username, password }: FormValues) {
        setError(null);
        try {
            await (isLogin ? login : registerUser)(username, password);
        } catch (e) {
            setError((e as Error).message);
        }
    }

    return (
        <form className={`card ${styles.form}`} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h1>{isLogin ? 'Log in' : 'Create account'}</h1>
            <label className={styles.field}>
                Username
                <input className="input" autoComplete="username" {...register('username')} />
                {errors.username && <span className="error">{errors.username.message}</span>}
            </label>
            <label className={styles.field}>
                Password
                <input
                    type="password"
                    className="input"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    {...register('password')}
                />
                {errors.password && <span className="error">{errors.password.message}</span>}
            </label>
            {error && <p className="error">{error}</p>}
            <Button type="submit" disabled={!isValid || isSubmitting}>
                {isLogin ? 'Log in' : 'Register'}
            </Button>
            <p className="muted">
                {isLogin ? (
                    <>
                        No account? <Link href="/register">Register</Link>
                    </>
                ) : (
                    <>
                        Already registered? <Link href="/login">Log in</Link>
                    </>
                )}
            </p>
        </form>
    );
}
