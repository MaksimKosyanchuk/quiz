'use client';

import { useEffect, useRef } from 'react';
import Button from './Button';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        cancelRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [loading, onCancel]);

    return (
        <div
            className={styles.backdrop}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onCancel();
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h2 id="modal-title" className={styles.title}>
                    {title}
                </h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button
                        ref={cancelRef}
                        type="button"
                        className="btn"
                        disabled={loading}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <Button variant="danger-solid" disabled={loading} onClick={onConfirm}>
                        {loading ? 'Deleting...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
