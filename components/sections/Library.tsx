
import React, { useState, useEffect } from 'react';
import { LibraryItem } from '../../types';
import { useLibrary } from '../../hooks/useLibrary';
import Button from '../ui/Button';

interface LibraryProps {
    showMessage: (message: string, type?: 'success' | 'error') => void;
    libraryVersion: number;
}

const Library: React.FC<LibraryProps> = ({ showMessage, libraryVersion }) => {
    const { getLibrary, deleteFromLibrary } = useLibrary();
    const [library, setLibrary] = useState<LibraryItem[]>([]);

    useEffect(() => {
        setLibrary(getLibrary());
    }, [libraryVersion, getLibrary]);

    const handleCopy = (prompt: string) => {
        navigator.clipboard.writeText(prompt)
            .then(() => showMessage('Đã sao chép prompt!', 'success'))
            .catch(() => showMessage('Sao chép thất bại.', 'error'));
    };

    const handleDelete = (id: number) => {
        deleteFromLibrary(id);
        showMessage('Đã xóa prompt khỏi thư viện.');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Thư viện Prompt</h2>
            <div className="space-y-4">
                {library.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Thư viện của bạn chưa có prompt nào.</p>
                ) : (
                    library.map(item => (
                        <div key={item.id} className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-2">
                                Đã tạo lúc: {new Date(item.date).toLocaleString('vi-VN')}
                            </p>
                            <p className="font-mono text-gray-700 whitespace-pre-wrap break-words mb-4">
                                {item.prompt}
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => handleCopy(item.prompt)} className="!py-1.5 !px-3 text-sm">
                                    <i className="fas fa-copy mr-2"></i> Sao chép
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(item.id)} className="!py-1.5 !px-3 text-sm">
                                    <i className="fas fa-trash-alt mr-2"></i> Xóa
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Library;