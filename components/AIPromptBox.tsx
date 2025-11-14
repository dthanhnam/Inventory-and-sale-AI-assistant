
import React, { useState } from 'react';

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-indigo-500">
        <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3z" />
        <path d="M3 21L4 17" />
        <path d="M19 17L20 21" />
    </svg>
);


const LoaderIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


interface AIPromptBoxProps {
    title: string;
    description: string;
    placeholder: string;
    isLoading: boolean;
    onSubmit: (prompt: string) => void;
}

export const AIPromptBox: React.FC<AIPromptBoxProps> = ({ title, description, placeholder, isLoading, onSubmit }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt);
            setPrompt('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                    <SparklesIcon />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex-grow flex flex-col">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholder}
                    className="w-full flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
                    rows={4}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="mt-4 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center transition duration-150 ease-in-out"
                >
                    {isLoading ? <LoaderIcon /> : 'Process Prompt'}
                </button>
            </form>
        </div>
    );
};
