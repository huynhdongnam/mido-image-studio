
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import Button from '../ui/Button';
import { useApiUsage } from '../../hooks/useApiUsage';
import { Section } from '../../types';

interface CheckPromptProps {
    showMessage: (message: string, type?: 'success' | 'error') => void;
    usePrompt: (prompt: string) => void;
}

const CheckPrompt: React.FC<CheckPromptProps> = ({ showMessage, usePrompt }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const { recordUsage, canUseApi } = useApiUsage(Section.CheckPrompt);

    const handleAnalyze = async () => {
        if (!prompt.trim()) {
            showMessage('Vui lòng dán prompt cần phân tích.', 'error');
            return;
        }
        if (!canUseApi('text')) {
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }
        setIsLoading(true);
        setAnalysis('');
        setOptimizedPrompt('');

        try {
            const systemPrompt = `You are an expert image prompt engineer. Analyze the following user-submitted prompt. Provide a constructive critique in Vietnamese using Markdown.
1.  **Phân tích điểm mạnh:** What is good about the prompt.
2.  **Điểm cần cải thiện:** What is weak, unclear, or could be more descriptive.
3.  **Gợi ý viết lại (Prompt được tối ưu hóa):** Provide a rewritten, optimized version of the prompt in English, enclosed in a markdown code block.
            
User Prompt:\n"${prompt}"`;
            
            const result = await generateText(systemPrompt);
            recordUsage('text');

            if (result) {
                setAnalysis(result);

                let extractedPrompt = '';
                const regexWithCodeBlock = /\*\*Gợi ý viết lại \(Prompt được tối ưu hóa\):\*\*\s*```(?:[a-zA-Z]*)?\n([\s\S]*?)```/;
                let match = result.match(regexWithCodeBlock);

                if (match && match[1]) {
                    extractedPrompt = match[1].trim();
                } else {
                    const regexWithoutCodeBlock = /\*\*Gợi ý viết lại \(Prompt được tối ưu hóa\):\*\*\s*([\s\S]*)/;
                    match = result.match(regexWithoutCodeBlock);
                    if (match && match[1]) {
                        extractedPrompt = match[1].trim().replace(/```/g, '');
                    }
                }

                if (extractedPrompt) {
                    setOptimizedPrompt(extractedPrompt);
                }
                
                showMessage('Phân tích prompt thành công!', 'success');
            } else {
                showMessage('Phân tích thất bại.', 'error');
            }
        } catch (error) {
            showMessage('Phân tích thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => showMessage('Đã sao chép prompt!', 'success'))
            .catch(() => showMessage('Sao chép thất bại.', 'error'));
    };

    const renderAnalysis = () => {
        if (!analysis) return null;
        
        const cleanAnalysis = analysis.replace(/\*\*Gợi ý viết lại \(Prompt được tối ưu hóa\):\*\*[\s\S]*/, '');
        
        const html = cleanAnalysis
            .replace(/### (.*?)\n/g, '<h4 class="text-lg font-semibold text-blue-800 mt-4 mb-2">$1</h4>')
            .replace(/## (.*?)\n/g, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\* ([^*]+)/g, '<p class="ml-4">&bull; $1</p>')
            .replace(/```(.*?)\n([\s\S]*?)```/gs, '<pre class="bg-gray-200 p-3 rounded-md font-mono text-sm my-2 whitespace-pre-wrap">$2</pre>');

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">✨ Phân tích & Tối ưu hóa Prompt</h2>
                <p className="text-gray-600 mt-2">Dán prompt tạo ảnh của bạn vào đây để được AI phân tích và đưa ra gợi ý cải thiện.</p>
            </div>
            <div className="space-y-2">
                <label htmlFor="promptToAnalyze" className="font-semibold text-gray-700">Prompt cần phân tích</label>
                <textarea
                    id="promptToAnalyze"
                    rows={8}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono bg-slate-50 text-gray-900 placeholder:text-gray-500"
                    placeholder="Paste your image prompt here..."
                />
            </div>
            <div className="flex justify-center">
                <Button onClick={handleAnalyze} isLoading={isLoading} disabled={isLoading} className="w-full max-w-md">
                    Phân tích Prompt <i className="fas fa-search-plus ml-2"></i>
                </Button>
            </div>
            {analysis && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6 space-y-4">
                    {renderAnalysis()}
                    {optimizedPrompt && (
                         <div className="pt-4 border-t-2 border-dashed mt-4 space-y-2">
                            <h4 className="text-lg font-semibold text-blue-800">Gợi ý viết lại (Prompt được tối ưu hóa):</h4>
                            <p className="font-mono text-gray-800 bg-blue-50 p-3 rounded-md whitespace-pre-wrap">{optimizedPrompt}</p>
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="secondary" onClick={() => copyToClipboard(optimizedPrompt)}>
                                    <i className="fas fa-copy mr-2"></i> Sao chép
                                </Button>
                                <Button variant="primary" onClick={() => usePrompt(optimizedPrompt)}>
                                    <i className="fas fa-image mr-2"></i> Sử dụng Prompt này
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CheckPrompt;
