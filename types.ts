
export enum Section {
    CreateImage = 'createImage',
    Translate = 'translate',
    Chat = 'chat',
    DetailedPrompt = 'detailedPrompt',
    IdeaToPrompt = 'ideaToPrompt',
    RandomPrompt = 'randomPrompt',
    CheckPrompt = 'checkPrompt',
    Library = 'library',
    ImageLibrary = 'imageLibrary',
}

export interface LibraryItem {
    id: number;
    prompt: string;
    date: string;
}

export interface ImageLibraryItem {
    id: number;
    prompt: string;
    date: string;
    base64: string;
}

export type ChatMessageRole = 'user' | 'ai';

export interface ChatMessage {
    role: ChatMessageRole;
    text?: string;
    imageUrl?: string;
    isLoading?: boolean;
}