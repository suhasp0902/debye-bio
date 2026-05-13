import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { askCopilot } from '../lib/copilot';

export default function CopilotPanel({ designContext, onApplySuggestion, externalMessage, onExternalMessageProcessed }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to Debye. I am your AI Copilot. I can help you design, simulate, and debug bio-electronic interfaces. Ask me any questions, or click 'Explain' on DRC violations." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
      const response = await askCopilot(text, designContext, messages);
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
    <div className="w-[320px] bg-surface border-l border-border flex flex-col shrink-0 h-full relative z-10">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-accent-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <div className="text-text-primary text-sm font-bold">Debye Copilot</div>
          <div className="text-text-muted text-[10px]">Server-grounded biological literature</div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="max-h-[200px] border-b border-border p-3 overflow-y-auto custom-scrollbar bg-surface-raised shrink-0">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Context Suggestions</div>
          <div className="flex flex-col gap-2">
            {suggestions.map(sug => (
              <div key={sug.id} className="bg-surface border border-border p-2 rounded-md shadow-sm">
                <div className="flex gap-2 mb-2">
                  <div className="mt-0.5">{renderIcon(sug.type)}</div>
                  <div className="text-text-primary text-xs leading-relaxed">{sug.text}</div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleSend(`Explain why: ${sug.text}`)} className="text-[10px] text-text-secondary hover:text-text-primary px-2 py-1 rounded bg-surface-raised border border-border transition-colors">
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

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'assistant' && <div className="text-text-muted text-[10px] mb-1 ml-1 font-bold">Debye Copilot</div>}
            <div className={`p-3 rounded-lg max-w-[90%] text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-surface-raised border border-border text-text-secondary rounded-bl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="text-text-muted text-[10px] mb-1 ml-1 font-bold">Debye Copilot</div>
            <div className="p-3 rounded-lg bg-surface-raised border border-border rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-surface shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask anything about this design..."
            className="w-full bg-surface-raised border border-border text-text-primary text-sm rounded-md pl-3 pr-10 py-2.5 focus:outline-none focus:border-accent-primary"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 text-accent-primary hover:text-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
