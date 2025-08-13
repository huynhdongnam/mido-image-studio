
import React, { useState, useEffect } from 'react';
import { generateImages } from '../../services/geminiService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useApiUsage } from '../../hooks/useApiUsage';
import { useImageLibrary } from '../../hooks/useImageLibrary';
import { Section } from '../../types';

interface CreateImageProps {
    saveToLibrary: (prompt: string) => void;
    showMessage: (message: string, type?: 'success' | 'error') => void;
    prefilledPrompt: string;
    clearPrefilledPrompt: () => void;
}

const CreateImage: React.FC<CreateImageProps> = ({ saveToLibrary, showMessage, prefilledPrompt, clearPrefilledPrompt }) => {
    const [prompt, setPrompt] = useState('');
    const [imageCount, setImageCount] = useState(4);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const { recordUsage, canUseApi } = useApiUsage(Section.CreateImage);
    const { saveToImageLibrary } = useImageLibrary();

    useEffect(() => {
        if (prefilledPrompt) {
            setPrompt(prefilledPrompt);
            clearPrefilledPrompt();
        }
    }, [prefilledPrompt, clearPrefilledPrompt]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            showMessage('Vui lòng nhập prompt để tạo ảnh.', 'error');
            return;
        }
        if (!canUseApi('image', imageCount)) {
            showMessage(`Bạn không đủ lượt tạo ảnh. Cần ${imageCount} lượt.`, 'error');
            return;
        }

        setIsLoading(true);
        setImages([]);
        
        try {
            const result = await generateImages(prompt, imageCount);
            
            if (result.images.length > 0) {
                setImages(result.images);
                saveToLibrary(prompt);
                saveToImageLibrary(prompt, result.images);
                recordUsage('image', result.images.length);
                
                if (result.filteredCount > 0) {
                     showMessage(`Thành công: ${result.images.length}/${imageCount} ảnh. ${result.filteredCount} ảnh đã bị chặn do chính sách an toàn.`, 'success');
                } else {
                     showMessage(`Tạo thành công ${result.images.length} ảnh!`, 'success');
                }
            }
        } catch (error: any) {
            let message = 'Tạo ảnh thất bại. Vui lòng thử lại.';
            if (error.message === 'PROMPT_BLOCKED') {
                message = 'Tạo ảnh thất bại. Prompt của bạn có thể đã vi phạm chính sách an toàn của Google.';
            } else if (error.message === 'QUOTA_EXCEEDED') {
                message = 'Lượt sử dụng API Key đã hết. Vui lòng thử lại sau hoặc đổi sang khóa mới.';
            } else if (error.message === 'API_ERROR') {
                message = 'Tạo ảnh thất bại. Có lỗi xảy ra với máy chủ AI, vui lòng thử lại.';
            }
            showMessage(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Tạo ảnh bằng AI Prompt</h2>
                <p className="text-gray-600 mt-2">Nhập prompt của bạn vào ô bên dưới để AI tạo ra hình ảnh.</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="imagePromptInput" className="font-semibold text-gray-700">Prompt tạo ảnh</label>
                <textarea
                    id="imagePromptInput"
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: a majestic dragon flying through a mystical forest, fantasy style, cinematic lighting..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50 text-gray-900 placeholder:text-gray-500"
                />
            </div>

            <div className="flex items-end justify-center gap-4">
                <div className="space-y-2">
                    <label htmlFor="imageCount" className="font-semibold text-gray-700">Số lượng ảnh</label>
                    <input
                        type="number"
                        id="imageCount"
                        value={imageCount}
                        onChange={(e) => setImageCount(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))}
                        min="1"
                        max="8"
                        className="w-24 text-center p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 text-gray-900"
                    />
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading}>
                    <i className="fas fa-image"></i> Tạo ảnh
                </Button>
            </div>

            <div className="mt-8 flex items-center justify-center min-h-[300px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4">
                {isLoading ? (
                    <Spinner size="lg" colorClass="border-blue-600" />
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {images.map((base64Data, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <img src={`data:image/png;base64,${base64Data}`} alt={`Generated image ${index + 1}`} className="rounded-lg shadow-md w-full h-auto" />
                                <a
                                    href={`data:image/png;base64,${base64Data}`}
                                    download={`mido-image-${Date.now()}-${index + 1}.png`}
                                    className="w-full text-center bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                                >
                                    <i className="fas fa-download mr-2"></i> Tải xuống
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Hình ảnh của bạn sẽ xuất hiện ở đây</p>
                )}
            </div>
        </div>
    );
};

export default CreateImage;
