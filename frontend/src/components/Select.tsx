'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './Select.module.scss';

export interface SelectOption<T extends string> {
    value: T;
    label: string;
}

interface SelectProps<T extends string> {
    value: T;
    options: SelectOption<T>[];
    onChange: (value: T) => void;
    label?: string;
}

export default function Select<T extends string>({
    value,
    options,
    onChange,
    label,
}: SelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    const selectedIndex = options.findIndex((o) => o.value === value);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    function openList() {
        setActive(Math.max(selectedIndex, 0));
        setOpen(true);
    }

    function choose(index: number) {
        onChange(options[index].value);
        setOpen(false);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!open) openList();
                else setActive((i) => (i + 1) % options.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!open) openList();
                else setActive((i) => (i - 1 + options.length) % options.length);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (open) choose(active);
                else openList();
                break;
            case 'Escape':
                setOpen(false);
                break;
            case 'Tab':
                setOpen(false);
                break;
        }
    }

    return (
        <div className={styles.root} ref={rootRef}>
            <button
                type="button"
                className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
                role="combobox"
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
            >
                <span>{options[selectedIndex]?.label}</span>
                <svg
                    className={styles.chevron}
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    aria-hidden
                >
                    <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </button>
            {open && (
                <ul className={styles.list} id={listId} role="listbox">
                    {options.map((option, i) => (
                        <li
                            key={option.value}
                            role="option"
                            aria-selected={option.value === value}
                            className={`${styles.option} ${i === active ? styles.optionActive : ''} ${
                                option.value === value ? styles.optionSelected : ''
                            }`}
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(i)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
