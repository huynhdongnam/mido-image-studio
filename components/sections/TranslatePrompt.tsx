
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useApiUsage } from '../../hooks/useApiUsage';
import { Section } from '../../types';

interface TranslatePromptProps {
    saveToLibrary: (prompt: string) => void;
    showMessage: (message: string, type?: 'success' | 'error') => void;
    usePrompt: (prompt: string) => void;
}

type Translations = {
    vietnamese: string;
    english: string;
    chinese: string;
};

const TranslatePrompt: React.FC<TranslatePromptProps> = ({ saveToLibrary, showMessage, usePrompt }) => {
    const [sourcePrompt, setSourcePrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [translations, setTranslations] = useState<Translations | null>(null);
    const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
    const { recordUsage, canUseApi } = useApiUsage(Section.Translate);
    
    const handleTranslate = async () => {
        if (!sourcePrompt.trim()) {
            showMessage('Vui lòng nhập prompt cần dịch.', 'error');
            return;
        }
        if (!canUseApi('text', 3)) { // detect + 2 translations
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }
        setIsLoading(true);
        setTranslations(null);
        setOptimizedPrompt('');

        try {
            const detectLangPrompt = `Detect the language of the following text. Respond with only one of these options: "Vietnamese", "English", or "Traditional Chinese".\n\nText: "${sourcePrompt}"`;
            const detectedLang = (await generateText(detectLangPrompt))?.trim();
            recordUsage('text');

            if (!detectedLang || !['Vietnamese', 'English', 'Traditional Chinese'].includes(detectedLang)) {
                showMessage('Không thể xác định ngôn ngữ của prompt.', 'error');
                setIsLoading(false);
                return;
            }

            const translate = (text: string, source: string, target: string) => {
                const systemPrompt = `Translate the following text from ${source} to ${target}. Provide a literal, meaning-for-meaning translation. Do not add any extra text or explanations. \n\nText: "${text}"`;
                return generateText(systemPrompt);
            };

            const targetLangs = ['Vietnamese', 'English', 'Traditional Chinese'].filter(lang => lang !== detectedLang);
            const [trans1, trans2] = await Promise.all([
                translate(sourcePrompt, detectedLang, targetLangs[0]),
                translate(sourcePrompt, detectedLang, targetLangs[1])
            ]);
            recordUsage('text', 2);
            
            const newTranslations: Partial<Translations> = {
                [detectedLang.toLowerCase().replace('traditional ', '')]: sourcePrompt,
                [targetLangs[0].toLowerCase().replace('traditional ', '')]: trans1 || 'Bản dịch thất bại',
                [targetLangs[1].toLowerCase().replace('traditional ', '')]: trans2 || 'Bản dịch thất bại',
            };

            setTranslations(newTranslations as Translations);
        } catch (error) {
            showMessage('Dịch thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptimize = async (sourceLang: 'Vietnamese' | 'Traditional Chinese', text: string) => {
        if (!text.trim()) {
            showMessage('Không có nội dung để tối ưu hóa.', 'error');
            return;
        }
        if (!canUseApi('text')) {
             showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }
        setIsOptimizing(true);
        try {
            const systemPrompt = `You are an expert prompt translator. Translate the following text from ${sourceLang} to English. It is critical to identify and preserve all technical image generation keywords, such as artistic styles (e.g., 'cinematic', 'photorealistic', 'anime'), technical terms (e.g., '8k', 'high detail', 'bokeh', 'rim light'), and artist names, in their original English. Only translate the descriptive, narrative parts of the prompt. Return only the final translated hybrid prompt.\n\nText: "${text}"`;
            
            const result = await generateText(systemPrompt);
            recordUsage('text');

            if (result) {
                setOptimizedPrompt(result);
                saveToLibrary(result);
            } else {
                showMessage('Tối ưu hóa thất bại.', 'error');
            }
        } catch (error) {
            showMessage('Tối ưu hóa thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsOptimizing(false);
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => showMessage('Đã sao chép!'), () => showMessage('Sao chép thất bại.', 'error'));
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Dịch và Tối ưu hóa Prompt</h2>
            </div>
            
            <div className="space-y-2">
                <label htmlFor="sourcePrompt" className="font-semibold text-gray-700">1. Nhập Prompt cần dịch</label>
                <textarea id="sourcePrompt" value={sourcePrompt} onChange={e => setSourcePrompt(e.target.value)} rows={4} placeholder="Dán prompt của bạn vào đây..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 text-gray-900 placeholder:text-gray-500"/>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleTranslate} isLoading={isLoading} disabled={isLoading} className="w-full max-w-md">
                    <i className="fas fa-language mr-2"></i> Dịch để chỉnh sửa
                </Button>
            </div>
            
            {isLoading && <div className="text-center"><Spinner colorClass="border-blue-600"/></div>}

            {translations && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-xl font-semibold text-gray-800">2. Chỉnh sửa bản dịch (nếu cần)</h3>
                    <div className="space-y-4">
                        {/* Vietnamese */}
                        <div>
                             <label className="font-semibold text-gray-700">Tiếng Việt</label>
                             <textarea value={translations.vietnamese} onChange={e => setTranslations({...translations, vietnamese: e.target.value})} rows={3} className="w-full p-2 border rounded bg-slate-50 text-gray-900"/>
                             <div className="text-right mt-1">
                                <Button variant="primary" className="py-1 px-3 text-sm" onClick={() => handleOptimize('Vietnamese', translations.vietnamese)} disabled={isOptimizing}>Tối ưu sang Tiếng Anh</Button>
                             </div>
                        </div>
                        {/* English */}
                        <div>
                             <label className="font-semibold text-gray-700">English</label>
                             <textarea value={translations.english} onChange={e => setTranslations({...translations, english: e.target.value})} rows={3} className="w-full p-2 border rounded bg-slate-50 text-gray-900"/>
                             <div className="flex justify-end gap-2 mt-1">
                                <Button variant="secondary" className="py-1 px-3 text-sm" onClick={() => copyToClipboard(translations.english)}><i className="fas fa-copy mr-1"></i> Sao chép</Button>
                                <Button variant="primary" className="py-1 px-3 text-sm" onClick={() => usePrompt(translations.english)}><i className="fas fa-image mr-1"></i> Dùng Prompt này</Button>
                             </div>
                        </div>
                        {/* Chinese */}
                        <div>
                             <label className="font-semibold text-gray-700">Tiếng Trung phồn thể</label>
                             <textarea value={translations.chinese} onChange={e => setTranslations({...translations, chinese: e.target.value})} rows={3} className="w-full p-2 border rounded bg-slate-50 text-gray-900"/>
                              <div className="text-right mt-1">
                                <Button variant="primary" className="py-1 px-3 text-sm" onClick={() => handleOptimize('Traditional Chinese', translations.chinese)} disabled={isOptimizing}>Tối ưu sang Tiếng Anh</Button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {isOptimizing && <div className="text-center"><Spinner colorClass="border-blue-600"/></div>}

            {optimizedPrompt && (
                <div className="space-y-2 pt-4 border-t">
                     <h3 className="text-xl font-semibold text-gray-800">3. Sử dụng Prompt đã tối ưu hóa</h3>
                     <label htmlFor="finalPrompt" className="font-semibold text-gray-700">Prompt Tiếng Anh (sẵn sàng để tạo ảnh)</label>
                     <textarea id="finalPrompt" value={optimizedPrompt} rows={4} className="w-full p-2 border rounded bg-blue-50 font-mono text-gray-900" readOnly />
                     <div className="flex justify-end gap-2 mt-2">
                        <Button variant="secondary" onClick={() => copyToClipboard(optimizedPrompt)}><i className="fas fa-copy mr-2"></i> Sao chép</Button>
                        <Button variant="primary" onClick={() => usePrompt(optimizedPrompt)}><i className="fas fa-image mr-2"></i> Dùng Prompt này</Button>
                     </div>
                </div>
            )}
        </div>
    );
};

export default TranslatePrompt;
