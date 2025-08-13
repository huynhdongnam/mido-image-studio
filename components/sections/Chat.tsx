
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { generateText, generateTextWithImage } from '../../services/geminiService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useApiUsage } from '../../hooks/useApiUsage';
import { Section } from '../../types';

interface ChatProps {
    saveToLibrary: (prompt: string) => void;
    showMessage: (message: string, type?: 'success' | 'error') => void;
}

const Chat: React.FC<ChatProps> = ({ saveToLibrary, showMessage }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'ai', text: 'Chào bạn! Tôi là Mido Image. Bạn cần trợ giúp về prompt tạo ảnh hay muốn phân tích một bức ảnh? Hãy gửi tin nhắn hoặc tải ảnh lên nhé!' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const { recordUsage, canUseApi } = useApiUsage(Section.Chat);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;
        if (!canUseApi('text')) {
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }

        const newMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmedInput }, { role: 'ai', isLoading: true }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const aiResponse = await generateText(trimmedInput);
            recordUsage('text');
            
            const aiResponseMessage: ChatMessage = { role: 'ai', text: aiResponse || 'Xin lỗi, tôi không thể tạo phản hồi lúc này.' };
            const finalMessages = [...newMessages.slice(0, -1), aiResponseMessage];
            setMessages(finalMessages);
        } catch (error) {
            setMessages(prev => [...prev.slice(0,-1), { role: 'ai', text: 'Lỗi: Không thể kết nối tới AI.'}]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || isLoading) return;
         if (!canUseApi('text')) {
            showMessage('Bạn đã hết lượt sử dụng cho hôm nay.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageUrl = e.target?.result as string;
            const base64Image = imageUrl.split(',')[1];
            
            const newMessages: ChatMessage[] = [...messages, { role: 'user', imageUrl }, { role: 'ai', isLoading: true }];
            setMessages(newMessages);
            setIsLoading(true);

            try {
                const promptForImage = "Analyze this image and create a detailed, artistic image generation prompt in English that could be used to recreate a similar image. Describe the subject, setting, style, lighting, composition, and mood. Format the output as a single block of text.";
                const aiResponse = await generateTextWithImage(promptForImage, base64Image, file.type);
                recordUsage('text');
                
                if (aiResponse) saveToLibrary(aiResponse);

                const aiResponseMessage: ChatMessage = { role: 'ai', text: aiResponse || 'Xin lỗi, tôi không thể phân tích hình ảnh lúc này.' };
                const finalMessages = [...newMessages.slice(0, -1), aiResponseMessage];
                setMessages(finalMessages);
            } catch(error) {
                setMessages(prev => [...prev.slice(0,-1), { role: 'ai', text: 'Lỗi: Không thể phân tích ảnh.'}]);
            } finally {
                 setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => showMessage('Đã sao chép prompt!'), () => showMessage('Sao chép thất bại.', 'error'));
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Chat & Phân tích ảnh</h2>
                <p className="text-gray-600 mt-2">Hỏi đáp về prompt tạo ảnh, hoặc tải ảnh lên để AI phân tích.</p>
            </div>
            <div ref={chatBoxRef} className="h-96 bg-slate-50 border border-gray-200 rounded-xl p-4 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`max-w-[90%] p-3 rounded-xl flex flex-col ${msg.role === 'user' ? 'self-end bg-blue-500 text-white rounded-br-none' : 'self-start bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                        {msg.isLoading ? <Spinner size="sm" colorClass="border-gray-700" /> :
                         msg.text ? 
                            <div className="whitespace-pre-wrap">{msg.text}
                            {msg.role === 'ai' && msg.text.length > 20 && !msg.text.startsWith('Chào bạn!') &&
                                <button onClick={() => copyToClipboard(msg.text!)} className="bg-gray-400 text-white text-xs px-2 py-1 rounded mt-2 hover:bg-gray-500">Sao chép</button>
                            }
                            </div>
                         :
                         msg.imageUrl ? <img src={msg.imageUrl} alt="uploaded content" className="max-w-[200px] rounded-lg" /> : null}
                    </div>
                ))}
            </div>
            <div className="flex items-start gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="h-12 w-12 flex-shrink-0 !p-0">
                    <i className="fas fa-plus"></i>
                </Button>
                <textarea 
                    value={userInput} 
                    onChange={e => setUserInput(e.target.value)}
                    onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Nhập tin nhắn..." 
                    rows={1} 
                    className="flex-grow p-3 border border-gray-300 rounded-lg resize-none min-h-[48px] max-h-32 overflow-y-auto bg-slate-50 text-gray-900 placeholder:text-gray-500"
                />
                <Button onClick={handleSendMessage} isLoading={isLoading} className="h-12 !px-6">Gửi</Button>
            </div>
        </div>
    );
};

export default Chat;
