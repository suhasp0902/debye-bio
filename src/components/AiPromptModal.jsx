import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function AiPromptModal({ isOpen, onClose, onSubmit }) {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt);
    setPrompt('');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-accent-primary font-bold">
            <Sparkles className="w-5 h-5" />
            AI Design Generator
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <label className="block text-sm text-text-primary font-medium mb-2">
            What is your biological objective?
          </label>
          <p className="text-xs text-text-muted mb-4">
            Describe the device you want to build in plain English. The AI copilot will generate a starting layout grounded in published science.
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Design a gastric pacemaker to stimulate the stomach lining with 2mA pulses, intended for 5 year implantation."
            className="w-full h-32 bg-surface-raised border border-border rounded-md p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary resize-none mb-4 custom-scrollbar"
            autoFocus
          />
          
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!prompt.trim()}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Design
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
