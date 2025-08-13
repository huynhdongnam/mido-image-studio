
import React, { useEffect } from 'react';

interface MessageBoxProps {
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const baseClasses = 'fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-xl text-white transition-opacity duration-500';
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {message}
        </div>
    );
};

export default MessageBox;
