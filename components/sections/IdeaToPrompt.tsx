
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import Button from '../ui/Button';
import { useApiUsage } from '../../hooks/useApiUsage';
import { Section } from '../../types';

interface IdeaToPromptProps {
    saveToLibrary: (prompt: string) => void;
    showMessage: (message: string, type?: 'success' | 'error') => void;
}

const IdeaToPrompt: React.FC<IdeaToPromptProps> = ({ saveToLibrary, showMessage }) => {
    const [idea, setIdea] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<{ en: string; zh: string } | null>(null);
    const { recordUsage, canUseApi } = useApiUsage(Section.IdeaToPrompt);

    const handleGenerate = async () => {
        if (!idea.trim()) {
            showMessage('Vui lòng nhập ý tưởng của bạn.', 'error');
            return;
        }
        if (!canUseApi('text', 2)) {
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }
        setIsLoading(true);
        setOutput(null);

        try {
            const systemPromptEn = `Based on the following Vietnamese idea, generate a detailed and artistic image generation prompt in English. The prompt should be a single, coherent paragraph. Embellish the idea with creative details related to style, lighting, composition, and mood. Vietnamese Idea: "${idea}"`;
            const enResult = await generateText(systemPromptEn);
            recordUsage('text');
            
            if (enResult) {
                saveToLibrary(enResult);
                setOutput({ en: enResult, zh: 'Đang dịch...' });

                const systemPromptZh = `You are an expert prompt translator. Translate the following text from English to Traditional Chinese. It is critical to identify and preserve all technical image generation keywords, such as artistic styles, technical terms, and artist names, in their original English. Only translate the descriptive, narrative parts of the prompt. Return only the final translated hybrid prompt.\n\nText: "${enResult}"`;
                const zhResult = await generateText(systemPromptZh);
                recordUsage('text');

                setOutput({ en: enResult, zh: zhResult || 'Bản dịch thất bại.' });
                showMessage('Prompt đã được tạo từ ý tưởng!', 'success');
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
                <h2 className="text-2xl font-bold text-gray-800">Từ ý tưởng đến Prompt ảnh</h2>
                <p className="text-gray-600 mt-2">Biến ý tưởng Tiếng Việt của bạn thành một prompt tạo ảnh đầy nghệ thuật.</p>
            </div>
            <div className="space-y-2">
                <label htmlFor="ideaInput" className="font-semibold text-gray-700">Nhập ý tưởng của bạn (Tiếng Việt)</label>
                <textarea
                    id="ideaInput"
                    rows={4}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ví dụ: một quán cà phê nhỏ ở Hà Nội vào một buổi chiều mưa, trông thật ấm cúng và hoài niệm..."
                    className="w-full p-3 border border-gray-300 rounded-lg bg-slate-50 text-gray-900 placeholder:text-gray-500"
                />
            </div>
            <div className="flex justify-center">
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading} className="w-full max-w-md">
                    <i className="fas fa-lightbulb mr-2"></i> Chuyển thành Prompt
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

export default IdeaToPrompt;
