import { useState, useEffect, useCallback } from 'react';
import { API_TEXT_USAGE_KEY, API_IMAGE_USAGE_KEY, DAILY_TEXT_LIMIT, DAILY_IMAGE_LIMIT } from '../constants';
import { Section } from '../types';

type UsageData = {
    count: number;
    date: string;
};

const getUsage = (key: string): UsageData => {
    const data = localStorage.getItem(key);
    const usageData: UsageData = data ? JSON.parse(data) : { count: 0, date: '' };
    const today = new Date().toISOString().split('T')[0];
    if (usageData.date !== today) {
        return { count: 0, date: today };
    }
    return usageData;
};

const setUsage = (key: string, usageData: UsageData) => {
    localStorage.setItem(key, JSON.stringify(usageData));
};

export const useApiUsage = (activeSection: Section) => {
    const [textUsage, setTextUsage] = useState<UsageData>(() => getUsage(API_TEXT_USAGE_KEY));
    const [imageUsage, setImageUsage] = useState<UsageData>(() => getUsage(API_IMAGE_USAGE_KEY));
    const [timeToReset, setTimeToReset] = useState('');

    const isTextLimitReached = textUsage.count >= DAILY_TEXT_LIMIT;
    const isImageLimitReached = imageUsage.count >= DAILY_IMAGE_LIMIT;

    const updateDisplay = useCallback(() => {
        const currentTextUsage = getUsage(API_TEXT_USAGE_KEY);
        const currentImageUsage = getUsage(API_IMAGE_USAGE_KEY);
        setTextUsage(currentTextUsage);
        setImageUsage(currentImageUsage);
    }, []);

    useEffect(() => {
        updateDisplay();
        const interval = setInterval(updateDisplay, 5000); // Periodically sync with localStorage
        return () => clearInterval(interval);
    }, [updateDisplay]);

    useEffect(() => {
        let interval: number | null = null;
        if (isTextLimitReached || isImageLimitReached) {
            const calculateTimeToReset = () => {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const diff = tomorrow.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeToReset(`Reset sau: ${hours}h ${minutes}m ${seconds}s`);
            };
            calculateTimeToReset();
            interval = window.setInterval(calculateTimeToReset, 1000);
        } else {
            setTimeToReset('');
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTextLimitReached, isImageLimitReached]);
    
    const recordUsage = useCallback((type: 'text' | 'image', count: number = 1) => {
        const key = type === 'text' ? API_TEXT_USAGE_KEY : API_IMAGE_USAGE_KEY;
        const usage = getUsage(key);
        usage.count += count;
        setUsage(key, usage);
        updateDisplay();
    }, [updateDisplay]);

    const canUseApi = useCallback((type: 'text' | 'image', count: number = 1): boolean => {
        if (isTextLimitReached) return false;
        if (type === 'image' && imageUsage.count + count > DAILY_IMAGE_LIMIT) return false;
        return true;
    }, [isTextLimitReached, isImageLimitReached, imageUsage.count]);
    
    const getUsageDisplay = () => {
        if (activeSection === Section.CreateImage) {
            return isImageLimitReached || isTextLimitReached ? timeToReset : `Sử dụng ảnh: ${imageUsage.count}/${DAILY_IMAGE_LIMIT}`;
        }
        return isTextLimitReached ? timeToReset : `Sử dụng chung: ${textUsage.count}/${DAILY_TEXT_LIMIT}`;
    };
    
    const isLimitReachedForSection = activeSection === Section.CreateImage ? isTextLimitReached || isImageLimitReached : isTextLimitReached;

    return { recordUsage, canUseApi, getUsageDisplay, isLimitReachedForSection };
};