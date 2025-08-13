
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    colorClass?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', colorClass = 'border-white' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            className={`animate-spin rounded-full border-solid ${sizeClasses[size]} ${colorClass} border-t-transparent`}
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
