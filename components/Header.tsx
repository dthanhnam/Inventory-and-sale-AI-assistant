
import React from 'react';

const BoxIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="bg-slate-800 shadow-md">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
                <div className="bg-slate-700 p-2 rounded-lg">
                    <BoxIcon />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Inventory & Sales AI Assistant</h1>
                    <p className="text-sm text-slate-300">Powered by Gemini</p>
                </div>
            </div>
        </header>
    );
};
