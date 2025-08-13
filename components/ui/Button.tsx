
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'px-4 py-2.5 rounded-lg font-semibold cursor-pointer transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none';
    
    const variantClasses = {
        primary: 'bg-blue-600 text-white shadow-md hover:bg-blue-700 disabled:bg-gray-400 hover:disabled:bg-gray-400',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-200 disabled:text-gray-500 hover:disabled:bg-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 hover:disabled:bg-gray-400',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Spinner size="sm" />}
            {children}
        </button>
    );
};

export default Button;
