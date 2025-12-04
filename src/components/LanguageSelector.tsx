import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/bhasiniService';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = '',
  disabled = false,
}) => {

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-white border border-slate-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name} ({language.code})
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
      
      {/* Globe icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Globe className="h-4 w-4 text-slate-400" />
      </div>
      
      {/* Adjust padding for icons */}
      <style dangerouslySetInnerHTML={{
        __html: `
          select {
            padding-left: 2.5rem;
          }
        `
      }} />
    </div>
  );
};

export default LanguageSelector;