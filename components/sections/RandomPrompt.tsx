
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import Button from '../ui/Button';
import { useApiUsage } from '../../hooks/useApiUsage';
import { Section } from '../../types';

interface RandomPromptProps {
    saveToLibrary: (prompt: string) => void;
    showMessage: (message: string, type?: 'success' | 'error') => void;
}

const RandomPrompt: React.FC<RandomPromptProps> = ({ saveToLibrary, showMessage }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<{ en: string; zh: string } | null>(null);
    const { recordUsage, canUseApi } = useApiUsage(Section.RandomPrompt);

    const handleGenerate = async () => {
        if (!canUseApi('text', 2)) {
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }
        setIsLoading(true);
        setOutput(null);

        try {
            const systemPromptEn = "Generate a single, creative, and detailed random image generation prompt in English. The prompt should be a single, coherent paragraph describing a unique scene with a clear subject, setting, style, and mood.";
            const enResult = await generateText(systemPromptEn);
            recordUsage('text');

            if (enResult) {
                saveToLibrary(enResult);
                setOutput({ en: enResult, zh: 'Đang dịch...' });

                const systemPromptZh = `You are an expert prompt translator. Translate the following text from English to Traditional Chinese. It is critical to identify and preserve all technical image generation keywords, such as artistic styles, technical terms, and artist names, in their original English. Only translate the descriptive, narrative parts of the prompt. Return only the final translated hybrid prompt.\n\nText: "${enResult}"`;
                const zhResult = await generateText(systemPromptZh);
                recordUsage('text');

                setOutput({ en: enResult, zh: zhResult || 'Bản dịch thất bại.' });
                showMessage('Prompt ngẫu nhiên đã được tạo!', 'success');
            } else {
                showMessage('Tạo prompt thất bại.', 'error');
            }
        } catch (error) {
            showMessage('Tạo prompt thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => showMessage('Đã sao chép!'), () => showMessage('Sao chép thất bại.', 'error'));
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Gợi ý Prompt ngẫu nhiên</h2>
                <p className="text-gray-600 mt-2">Nhấn nút để tạo một prompt ảnh ngẫu nhiên, khơi gợi ý tưởng mới lạ.</p>
            </div>
            <div className="flex justify-center">
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading} className="w-full max-w-md">
                    Tạo Prompt ngẫu nhiên <i className="fas fa-dice ml-2"></i>
                </Button>
            </div>
            {output && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {Object.entries(output).map(([lang, text]) => (
                         <div key={lang} className="relative">
                            <label className="font-semibold">{lang === 'en' ? 'Prompt (Tiếng Anh)' : 'Prompt (Tiếng Trung)'}</label>
                            <textarea value={text as string} rows={6} readOnly className="w-full p-2 border rounded bg-slate-50 font-mono text-gray-900"/>
                            <button onClick={() => copyToClipboard(text as string)} className="absolute top-8 right-2 bg-gray-300 p-1 rounded hover:bg-gray-400"><i className="fas fa-copy text-xs"></i></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RandomPrompt;
