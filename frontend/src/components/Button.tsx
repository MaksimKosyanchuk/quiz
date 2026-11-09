import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'default' | 'danger-solid' | 'danger';
    disabled?: boolean;
}

export default function Button({
    variant = 'primary',
    disabled = false,
    type = 'button',
    className = '',
    ...rest
}: ButtonProps) {
    const variantClass = {
        primary: 'btn--primary',
        default: '',
        danger: 'btn--danger',
        'danger-solid': 'btn--danger-solid',
    }[variant];

    return (
        <button
            type={type}
            disabled={disabled}
            className={`btn ${variantClass} ${className}`.trim()}
            {...rest}
        />
    );
}
