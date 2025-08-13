
import React, { useState, useCallback, useEffect } from 'react';
import { Section } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CreateImage from './components/sections/CreateImage';
import TranslatePrompt from './components/sections/TranslatePrompt';
import Chat from './components/sections/Chat';
import DetailedPrompt from './components/sections/DetailedPrompt';
import IdeaToPrompt from './components/sections/IdeaToPrompt';
import RandomPrompt from './components/sections/RandomPrompt';
import CheckPrompt from './components/sections/CheckPrompt';
import Library from './components/sections/Library';
import ImageLibrary from './components/sections/ImageLibrary';
import MessageBox from './components/ui/MessageBox';
import ApiKeyManager from './components/ApiKeyManager';
import { useLibrary } from './hooks/useLibrary';
import { useImageLibrary } from './hooks/useImageLibrary';
import { initializeAi } from './services/geminiService';

type MessageInfo = {
  text: string;
  type: 'success' | 'error';
} | null;

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
    const [activeSection, setActiveSection] = useState<Section>(Section.CreateImage);
    const [message, setMessage] = useState<MessageInfo>(null);
    const { saveToLibrary, libraryVersion } = useLibrary();
    const { imageLibraryVersion } = useImageLibrary();
    const [prefilledPrompt, setPrefilledPrompt] = useState<string>('');

    useEffect(() => {
        if (apiKey) {
            initializeAi(apiKey);
        }
    }, [apiKey]);

    const handleKeySubmit = (key: string) => {
        localStorage.setItem('gemini-api-key', key);
        setApiKey(key);
        showMessage('API Key đã được lưu. Chào mừng bạn đến với Mido Image Studio!', 'success');
    };
    
    const handleClearKey = () => {
        localStorage.removeItem('gemini-api-key');
        setApiKey(null);
        showMessage('Đã xóa API key. Vui lòng nhập khóa mới.', 'success');
    };

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveToLibrary = useCallback((prompt: string) => {
        saveToLibrary(prompt);
        showMessage('Đã lưu prompt vào thư viện!', 'success');
    }, [saveToLibrary]);

    const handleUsePrompt = useCallback((prompt: string) => {
        setPrefilledPrompt(prompt);
        setActiveSection(Section.CreateImage);
        showMessage('Đã sao chép prompt vào thẻ "Tạo ảnh AI".', 'success');
    }, []);

    if (!apiKey) {
        return <ApiKeyManager onKeySubmit={handleKeySubmit} />;
    }

    const sectionComponents = {
        [Section.CreateImage]: <CreateImage saveToLibrary={handleSaveToLibrary} showMessage={showMessage} prefilledPrompt={prefilledPrompt} clearPrefilledPrompt={() => setPrefilledPrompt('')} />,
        [Section.Translate]: <TranslatePrompt saveToLibrary={handleSaveToLibrary} showMessage={showMessage} usePrompt={handleUsePrompt} />,
        [Section.Chat]: <Chat saveToLibrary={handleSaveToLibrary} showMessage={showMessage} />,
        [Section.DetailedPrompt]: <DetailedPrompt saveToLibrary={handleSaveToLibrary} showMessage={showMessage} />,
        [Section.IdeaToPrompt]: <IdeaToPrompt saveToLibrary={handleSaveToLibrary} showMessage={showMessage} />,
        [Section.RandomPrompt]: <RandomPrompt saveToLibrary={handleSaveToLibrary} showMessage={showMessage} />,
        [Section.CheckPrompt]: <CheckPrompt showMessage={showMessage} usePrompt={handleUsePrompt} />,
        [Section.Library]: <Library showMessage={showMessage} libraryVersion={libraryVersion} />,
        [Section.ImageLibrary]: <ImageLibrary showMessage={showMessage} libraryVersion={imageLibraryVersion} />,
    };

    return (
        <div className="flex flex-col min-h-screen text-gray-700">
            <Header activeSection={activeSection} setActiveSection={setActiveSection} onClearKey={handleClearKey} />
            <main className="flex-grow flex justify-center items-start p-5">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 max-w-4xl w-full">
                    {Object.entries(sectionComponents).map(([sectionKey, component]) => (
                        <div key={sectionKey} className={activeSection === sectionKey ? '' : 'hidden'}>
                            {component}
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
            {message && <MessageBox message={message.text} type={message.type} onDismiss={() => setMessage(null)} />}
        </div>
    );
};

export default App;
