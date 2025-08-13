
import { useState, useCallback } from 'react';
import { ImageLibraryItem } from '../types';
import { IMAGE_LIBRARY_KEY } from '../constants';

export const useImageLibrary = () => {
    const [imageLibraryVersion, setImageLibraryVersion] = useState(0);

    const getImageLibrary = useCallback((): ImageLibraryItem[] => {
        const data = localStorage.getItem(IMAGE_LIBRARY_KEY);
        return data ? JSON.parse(data) : [];
    }, []);

    // Save multiple images from a single prompt
    const saveToImageLibrary = useCallback((prompt: string, base64Images: string[]) => {
        if (!prompt || base64Images.length === 0) return;
        const library = getImageLibrary();
        const newItems: ImageLibraryItem[] = base64Images.map(base64 => ({
            id: Date.now() + Math.random(), // Add random to avoid collision in fast generation
            prompt: prompt,
            date: new Date().toISOString(),
            base64: base64,
        }));
        
        library.unshift(...newItems);
        // Limit library size to prevent excessive localStorage usage
        const limitedLibrary = library.slice(0, 50);
        localStorage.setItem(IMAGE_LIBRARY_KEY, JSON.stringify(limitedLibrary));
        setImageLibraryVersion(v => v + 1);
    }, [getImageLibrary]);

    const deleteFromImageLibrary = useCallback((id: number) => {
        let library = getImageLibrary();
        library = library.filter(item => item.id !== id);
        localStorage.setItem(IMAGE_LIBRARY_KEY, JSON.stringify(library));
        setImageLibraryVersion(v => v + 1);
    }, [getImageLibrary]);

    return { getImageLibrary, saveToImageLibrary, deleteFromImageLibrary, imageLibraryVersion };
};
