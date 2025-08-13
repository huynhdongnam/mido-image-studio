
import React from 'react';
import { Section } from '../types';
import { useApiUsage } from '../hooks/useApiUsage';

interface HeaderProps {
    activeSection: Section;
    setActiveSection: (section: Section) => void;
    onClearKey: () => void;
}

const navItems = [
    { id: Section.CreateImage, label: 'Tạo ảnh AI' },
    { id: Section.Translate, label: 'Dịch Prompt' },
    { id: Section.Chat, label: 'Chat & Phân tích ảnh' },
    { id: Section.DetailedPrompt, label: 'Tạo Prompt chi tiết' },
    { id: Section.IdeaToPrompt, label: 'Ý tưởng ra Prompt' },
    { id: Section.RandomPrompt, label: 'Prompt ngẫu nhiên' },
    { id: Section.CheckPrompt, label: '✨ Kiểm tra Prompt' },
    { id: Section.Library, label: 'Thư viện Prompt' },
    { id: Section.ImageLibrary, label: 'Thư viện ảnh' },
];

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, onClearKey }) => {
    const { getUsageDisplay, isLimitReachedForSection } = useApiUsage(activeSection);
    
    return (
        <header className="w-full bg-white shadow-sm p-4 flex flex-col items-center gap-4 sticky top-0 z-40">
            <div className="text-2xl font-extrabold text-blue-800">Mido Image Studio</div>
            <nav className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2.5 rounded-lg font-semibold transition-colors duration-200 ease-in-out
                            ${activeSection === item.id 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="flex items-center gap-3">
                <div className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${isLimitReachedForSection ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700'}`}>
                    <span>{getUsageDisplay()}</span>
                </div>
                <button onClick={onClearKey} className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-100 py-1 px-3 rounded-full transition-colors">
                    <i className="fas fa-key mr-1"></i> Đổi API Key
                </button>
            </div>
        </header>
    );
};

export default Header;
