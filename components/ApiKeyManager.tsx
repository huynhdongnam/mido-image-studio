
import React, { useState } from 'react';
import Button from './ui/Button';

interface ApiKeyManagerProps {
    onKeySubmit: (apiKey: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl text-center">
                <h1 className="text-3xl font-extrabold text-blue-800">Chào mừng đến với Mido Image Studio</h1>
                <p className="text-gray-600">
                    Để bắt đầu, vui lòng nhập khóa API của Google AI. Ứng dụng này cần khóa của bạn để có thể giao tiếp với các mô hình AI của Google.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Dán khóa API của bạn vào đây"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center"
                        aria-label="API Key Input"
                    />
                    <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
                        Lưu và Bắt đầu sử dụng
                    </Button>
                </form>
                <div className="pt-4 border-t">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                        Không có khóa? Lấy khóa API miễn phí từ Google AI Studio <i className="fas fa-external-link-alt text-xs ml-1"></i>
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                        Khóa API của bạn sẽ được lưu trữ an toàn trong trình duyệt này để tự động sử dụng cho các lần sau. Bạn có thể xóa khóa này bất cứ lúc nào trong phần đầu trang.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManager;
