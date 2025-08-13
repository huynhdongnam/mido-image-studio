
import React, { useState, useEffect } from 'react';
import { ImageLibraryItem } from '../../types';
import { useImageLibrary } from '../../hooks/useImageLibrary';
import Button from '../ui/Button';

interface ImageLibraryProps {
    showMessage: (message: string, type?: 'success' | 'error') => void;
    libraryVersion: number;
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({ showMessage, libraryVersion }) => {
    const { getImageLibrary, deleteFromImageLibrary } = useImageLibrary();
    const [library, setLibrary] = useState<ImageLibraryItem[]>([]);

    useEffect(() => {
        setLibrary(getImageLibrary());
    }, [libraryVersion, getImageLibrary]);

    const handleDelete = (id: number) => {
        deleteFromImageLibrary(id);
        showMessage('Đã xóa ảnh khỏi thư viện.');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Thư viện Ảnh</h2>
            {library.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Thư viện ảnh của bạn chưa có ảnh nào.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {library.map(item => (
                        <div key={item.id} className="bg-slate-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2 group relative overflow-hidden">
                            <img 
                                src={`data:image/png;base64,${item.base64}`} 
                                alt={item.prompt} 
                                className="rounded-lg shadow-md w-full h-auto aspect-square object-cover" 
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-center items-center text-white text-center text-xs overflow-auto">
                                <p className="font-mono break-words">{item.prompt}</p>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                                <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                            </div>
                             <div className="flex justify-between gap-2">
                                <a
                                    href={`data:image/png;base64,${item.base64}`}
                                    download={`mido-image-${item.id}.png`}
                                    className="flex-1 text-center bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-semibold transition-colors text-sm"
                                >
                                    <i className="fas fa-download mr-1"></i> Tải
                                </a>
                                <Button variant="danger" onClick={() => handleDelete(item.id)} className="flex-1 !py-1.5 !px-3 text-sm">
                                    <i className="fas fa-trash-alt mr-1"></i> Xóa
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;
