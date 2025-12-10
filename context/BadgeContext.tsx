import React, { createContext, useState, useContext, ReactNode } from 'react';

interface BadgeContextType {
    profileRefreshVersion: number;
    triggerProfileRefresh: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: ReactNode }) {
    const [profileRefreshVersion, setProfileRefreshVersion] = useState(0);

    const triggerProfileRefresh = () => {
        setProfileRefreshVersion(prev => prev + 1);
    };

    return (
        <BadgeContext.Provider value={{ profileRefreshVersion, triggerProfileRefresh }}>
            {children}
        </BadgeContext.Provider>
    );
}

export function useBadgeContext() {
    const context = useContext(BadgeContext);
    if (context === undefined) {
        throw new Error('useBadgeContext must be used within a BadgeProvider');
    }
    return context;
}
