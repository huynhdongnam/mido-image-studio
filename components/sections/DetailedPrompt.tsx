
import React, { useState } from 'react';
import Button from '../ui/Button';
import { useApiUsage } from '../../hooks/useApiUsage';
import { Section } from '../../types';
import {
    LIGHTING_OPTIONS,
    STYLE_OPTIONS,
    ACTION_OPTIONS,
    COMPOSITION_OPTIONS,
    NSFW_OPTIONS,
} from '../../constants';
import { generateText } from '../../services/geminiService';

interface DetailedPromptProps {
    saveToLibrary: (prompt: string) => void;
    showMessage: (message: string, type?: 'success' | 'error') => void;
}

const SelectInput: React.FC<{ id: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }> = ({ id, value, onChange, options }) => (
    <select id={id} value={value} onChange={onChange} className="w-full p-3 border border-gray-300 rounded-lg bg-slate-50 text-gray-900">
        {options.map(opt => <option key={opt} value={opt.includes('(') ? opt.split('(')[0].trim() : opt}>{opt}</option>)}
    </select>
);

const DetailedPrompt: React.FC<DetailedPromptProps> = ({ saveToLibrary, showMessage }) => {
    const [form, setForm] = useState({
        subject: '', action_text: '', action: 'Không có', setting: '', style_text: '', style: 'Không có',
        lighting_text: '', lighting: 'Không có', composition_text: '', composition: 'Không có',
        details: '', negativePrompt: '', nsfwToggle: false, nsfw_style: 'None'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<{en: string, zh: string, json: string} | null>(null);
    const { recordUsage, canUseApi } = useApiUsage(Section.DetailedPrompt);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setForm(prev => ({ ...prev, [id]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };

    const generatePrompt = async () => {
        if (!canUseApi('text', 2)) {
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }
        setIsLoading(true);
        setOutput(null);

        try {
            let parts = [
                form.subject,
                form.action_text || (form.action !== 'Không có' ? form.action : ''),
                form.setting ? `in ${form.setting}` : '',
                form.style_text || (form.style !== 'Không có' ? `${form.style} style` : ''),
                form.lighting_text || (form.lighting !== 'Không có' ? form.lighting : ''),
                form.composition_text || (form.composition !== 'Không có' ? form.composition : ''),
                form.details,
                form.nsfwToggle ? `NSFW, 18+ content${form.nsfw_style !== 'None' ? `, ${form.nsfw_style}` : ''}`: ''
            ];
            let finalPrompt = parts.filter(Boolean).join(', ');
            if (form.negativePrompt) {
                finalPrompt += ` --no ${form.negativePrompt}`;
            }
            
            saveToLibrary(finalPrompt);
            
            setOutput({en: finalPrompt, zh: 'Đang dịch...', json: JSON.stringify(form, null, 2)});

            const translatePrompt = `You are an expert prompt translator. Translate the following text from English to Traditional Chinese. It is critical to identify and preserve all technical image generation keywords, such as artistic styles, technical terms, and artist names, in their original English. Only translate the descriptive, narrative parts of the prompt. Return only the final translated hybrid prompt.\n\nText: "${finalPrompt}"`;
            const zhResult = await generateText(translatePrompt);
            recordUsage('text', 2);
            
            setOutput(prev => prev ? ({...prev, zh: zhResult || 'Bản dịch thất bại.'}) : null);
            showMessage('Prompt đã được tạo!', 'success');
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
            <h2 className="text-2xl font-bold text-gray-800 text-center">Tạo Prompt hình ảnh chi tiết</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="font-semibold">Chủ thể chính</label><textarea id="subject" value={form.subject} onChange={handleChange} rows={2} placeholder="Ví dụ: Một con rồng uy nghi..." className="w-full p-2 border rounded bg-slate-50 text-gray-900 placeholder:text-gray-400"/></div>
                <div className="space-y-2"><label className="font-semibold">Hành động</label><input type="text" id="action_text" value={form.action_text} onChange={handleChange} placeholder="Hoặc nhập hành động tùy chỉnh..." className="w-full p-2 border rounded mb-2 bg-slate-50 text-gray-900 placeholder:text-gray-400"/><SelectInput id="action" value={form.action} onChange={handleChange} options={ACTION_OPTIONS}/></div>
                <div className="space-y-2"><label className="font-semibold">Bối cảnh</label><textarea id="setting" value={form.setting} onChange={handleChange} rows={2} placeholder="Ví dụ: trong một khu rừng thần tiên..." className="w-full p-2 border rounded bg-slate-50 text-gray-900 placeholder:text-gray-400"/></div>
                <div className="space-y-2"><label className="font-semibold">Phong cách</label><input type="text" id="style_text" value={form.style_text} onChange={handleChange} placeholder="Hoặc nhập phong cách tùy chỉnh..." className="w-full p-2 border rounded mb-2 bg-slate-50 text-gray-900 placeholder:text-gray-400"/><SelectInput id="style" value={form.style} onChange={handleChange} options={STYLE_OPTIONS}/></div>
                <div className="space-y-2"><label className="font-semibold">Ánh sáng</label><input type="text" id="lighting_text" value={form.lighting_text} onChange={handleChange} placeholder="Hoặc nhập ánh sáng tùy chỉnh..." className="w-full p-2 border rounded mb-2 bg-slate-50 text-gray-900 placeholder:text-gray-400"/><SelectInput id="lighting" value={form.lighting} onChange={handleChange} options={LIGHTING_OPTIONS}/></div>
                <div className="space-y-2"><label className="font-semibold">Góc máy</label><input type="text" id="composition_text" value={form.composition_text} onChange={handleChange} placeholder="Hoặc nhập góc máy tùy chỉnh..." className="w-full p-2 border rounded mb-2 bg-slate-50 text-gray-900 placeholder:text-gray-400"/><SelectInput id="composition" value={form.composition} onChange={handleChange} options={COMPOSITION_OPTIONS}/></div>
                <div className="space-y-2"><label className="font-semibold">Chi tiết</label><textarea id="details" value={form.details} onChange={handleChange} rows={2} placeholder="Ví dụ: 8K, siêu chi tiết..." className="w-full p-2 border rounded bg-slate-50 text-gray-900 placeholder:text-gray-400"/></div>
                <div className="space-y-2"><label className="font-semibold text-red-600">Prompt không mong muốn</label><textarea id="negativePrompt" value={form.negativePrompt} onChange={handleChange} rows={2} placeholder="Ví dụ: xấu, biến dạng..." className="w-full p-2 border rounded bg-slate-50 text-gray-900 placeholder:text-gray-400"/></div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <div className="font-semibold text-red-800">Chế độ NSFW 18+</div>
                    <div className="text-sm text-red-600">Bật/tắt cho nội dung người lớn. Hãy cân nhắc.</div>
                </div>
                <label className="relative inline-block w-[50px] h-7">
                    <input type="checkbox" id="nsfwToggle" checked={form.nsfwToggle} onChange={handleChange} className="opacity-0 w-0 h-0 peer"/>
                    <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition duration-300 peer-checked:bg-red-600 before:absolute before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform before:duration-300 peer-checked:before:translate-x-[22px]"></span>
                </label>
            </div>
            {form.nsfwToggle && <div className="space-y-2"><label className="font-semibold text-red-600">Tùy chọn NSFW</label><SelectInput id="nsfw_style" value={form.nsfw_style} onChange={handleChange} options={NSFW_OPTIONS}/></div>}

            <div className="flex justify-center"><Button onClick={generatePrompt} isLoading={isLoading} disabled={isLoading} className="w-full max-w-md"><i className="fas fa-magic mr-2"></i> Tạo Prompt</Button></div>
            
            {output && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {['en', 'zh'].map(lang => (
                        <div key={lang} className="relative">
                            <label className="font-semibold">{lang === 'en' ? 'Prompt (Tiếng Anh)' : 'Prompt (Tiếng Trung)'}</label>
                            <textarea value={output[lang as keyof typeof output]} rows={6} readOnly className="w-full p-2 border rounded bg-slate-50 font-mono text-gray-900"/>
                            <button onClick={() => copyToClipboard(output[lang as keyof typeof output])} className="absolute top-8 right-2 bg-gray-300 p-1 rounded hover:bg-gray-400"><i className="fas fa-copy text-xs"></i></button>
                        </div>
                    ))}
                    <div className="md:col-span-2 relative">
                        <label className="font-semibold">Cấu trúc JSON</label>
                        <textarea value={output.json} rows={6} readOnly className="w-full p-2 border rounded bg-slate-50 font-mono text-gray-900"/>
                        <button onClick={() => copyToClipboard(output.json)} className="absolute top-8 right-2 bg-gray-300 p-1 rounded hover:bg-gray-400"><i className="fas fa-copy text-xs"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailedPrompt;
