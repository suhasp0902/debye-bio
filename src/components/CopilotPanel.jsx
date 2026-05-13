import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, Info, Lightbulb, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { askCopilot } from '../lib/copilot';

export default function CopilotPanel({ 
  designContext, 
  onApplySuggestion, 
  externalMessage, 
  onExternalMessageProcessed,
  width,
  setWidth,
  onClose 
}) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to Debye. I am your AI Copilot. I can help you design, simulate, and debug bio-electronic interfaces. Ask me any questions, or click 'Explain' on DRC violations." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  
  const isResizing = useRef(false);

  const startResizing = useCallback((e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 200 && newWidth < 800) {
      setWidth(newWidth);
    }
  }, [setWidth]);

  const suggestions = (() => {
    const newSuggestions = [];
    if (designContext?.drcResults?.errors?.length > 0) {
      designContext.drcResults.errors.forEach(err => {
        newSuggestions.push({
          id: err.id,
          type: 'warning',
          text: err.message,
          fixable: err.fixable,
        });
      });
    } else if (designContext?.nodes?.length === 0) {
      newSuggestions.push({
        id: 'empty-1',
        type: 'lightbulb',
        text: 'Start by dragging a Biological Tissue from the Palette, then connect an Electrode.',
        fixable: false,
      });
    } else {
      newSuggestions.push({
        id: 'tip-1',
        type: 'info',
        text: 'Run a mixed-signal simulation to verify impedance, noise, and SNR against the selected tissue model.',
        fixable: false,
      });
    }
    return newSuggestions;
  })();

  const handleSend = useCallback(async (text) => {
    if (!text.trim()) return;

    const newMsg = { role: 'user', content: text };
    const history = [...messages, newMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const response = await askCopilot(text, designContext, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI service.' }]);
    } finally {
      setLoading(false);
    }
  }, [designContext, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (externalMessage) {
      setTimeout(() => {
        handleSend(externalMessage);
        onExternalMessageProcessed();
      }, 0);
    }
  }, [externalMessage, handleSend, onExternalMessageProcessed]);

  const renderIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-accent-warning" />;
      case 'lightbulb': return <Lightbulb className="w-4 h-4 text-accent-secondary" />;
      case 'info': return <Info className="w-4 h-4 text-accent-primary" />;
      default: return <Sparkles className="w-4 h-4 text-accent-primary" />;
    }
  };

  return (
    <div 
      className="bg-surface border-l border-border flex flex-col shrink-0 h-full relative z-20 group/panel shadow-2xl"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div 
        onMouseDown={startResizing}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent-primary/50 transition-colors z-30"
      >
        <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-0 group-hover/panel:opacity-100 transition-opacity">
           <GripVertical className="w-3 h-3 text-text-muted" />
        </div>
      </div>

      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <div className="text-text-primary text-sm font-bold">Debye Copilot</div>
            <div className="text-text-muted text-[10px]">Powered by Gemini AI</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-surface-raised rounded transition-colors text-text-muted hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions Box */}
      <div className="border-b border-border overflow-hidden flex flex-col">
        <div className="w-full px-4 py-2 bg-surface-raised flex items-center justify-between">
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Context Suggestions</span>
            {showSuggestions ? <ChevronUp className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
          </button>
          {showSuggestions && (
            <button 
              onClick={() => setShowSuggestions(false)}
              className="p-0.5 hover:bg-red-500/10 rounded transition-colors text-text-muted hover:text-red-400"
              title="Close suggestions"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="max-h-[200px] p-3 overflow-y-auto custom-scrollbar bg-surface shrink-0">
            <div className="flex flex-col gap-2">
              {suggestions.map(sug => (
                <div key={sug.id} className="bg-surface-raised border border-border/50 p-2 rounded-md shadow-sm">
                  <div className="flex gap-2 mb-2">
                    <div className="mt-0.5">{renderIcon(sug.type)}</div>
                    <div className="text-text-primary text-xs leading-relaxed font-medium">{sug.text}</div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleSend(`Explain why: ${sug.text}`)} className="text-[10px] text-text-secondary hover:text-text-primary px-2 py-1 rounded bg-surface border border-border transition-colors">
                      Explain
                    </button>
                    {sug.fixable && (
                      <button onClick={() => onApplySuggestion(sug.id)} className="text-[10px] text-white hover:bg-accent-primary/90 px-2 py-1 rounded bg-accent-primary transition-colors shadow-sm">
                        Apply Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4 bg-surface-raised/30">
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'assistant' && <div className="text-text-muted text-[10px] mb-1 ml-1 font-bold">Debye Copilot</div>}
            <div className={`p-3 rounded-xl max-w-[95%] text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-surface border border-border text-text-secondary rounded-bl-none font-medium'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="text-text-muted text-[10px] mb-1 ml-1 font-bold">Debye Copilot</div>
            <div className="p-3 rounded-xl bg-surface border border-border rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-surface shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask about microfluidics, neuro-mod, or electrodes..."
            className="w-full bg-surface-raised border border-border text-text-primary text-sm rounded-lg pl-3 pr-10 py-3 focus:outline-none focus:border-accent-primary transition-all shadow-inner"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2.5 p-1 text-accent-primary hover:bg-accent-primary/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
