
import { useState, useCallback } from 'react';
import { LibraryItem } from '../types';
import { PROMPT_LIBRARY_KEY } from '../constants';

export const useLibrary = () => {
    // A simple version counter to trigger re-renders in components that use the library
    const [libraryVersion, setLibraryVersion] = useState(0);

    const getLibrary = useCallback((): LibraryItem[] => {
        const data = localStorage.getItem(PROMPT_LIBRARY_KEY);
        return data ? JSON.parse(data) : [];
    }, []);

    const saveToLibrary = useCallback((promptText: string) => {
        if (!promptText) return;
        const library = getLibrary();
        const newItem: LibraryItem = {
            id: Date.now(),
            prompt: promptText,
            date: new Date().toISOString()
        };
        library.unshift(newItem);
        localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(library));
        setLibraryVersion(v => v + 1);
    }, [getLibrary]);

    const deleteFromLibrary = useCallback((id: number) => {
        let library = getLibrary();
        library = library.filter(item => item.id !== id);
        localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(library));
        setLibraryVersion(v => v + 1);
    }, [getLibrary]);

    return { getLibrary, saveToLibrary, deleteFromLibrary, libraryVersion };
};
