'use client';

import { useState, useEffect, useRef } from 'react';
import { Language, t } from '@/lib/i18n';

interface Message { role: 'user' | 'assistant'; content: string; }
const MAX_TURNS = 5;

interface ChatPanelProps {
  lang: Language;
  contactId: string;
}

export function ChatPanel({ lang, contactId }: ChatPanelProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && messages.length === 0)
      setMessages([{ role: 'assistant', content: t(lang, 'chatWelcome') }]);
  }, [chatOpen, lang, messages.length]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || chatLoading || turns >= MAX_TURNS) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, lang, contact_id: contactId }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        setTurns(MAX_TURNS); // Disable further input
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        setTurns(t => t + 1);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally { setChatLoading(false); }
  }

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setChatOpen(v => !v)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[var(--vonage-purple)] text-white text-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform animate-pulse-glow"
        aria-label="Open AI Chat"
      >
        💬
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-[340px] max-w-[calc(100vw-40px)] h-[480px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/[0.15] bg-[rgba(12,10,28,0.95)] backdrop-blur-xl animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.1] bg-[rgba(139,92,246,0.12)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--vonage-purple)]/20 border border-[var(--vonage-purple)]/50 flex items-center justify-center text-sm">🤖</div>
              <span className="text-sm font-bold text-white">{t(lang, 'chatTitle')}</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.15] text-white/60 flex items-center justify-center text-xs cursor-pointer hover:bg-white/[0.15]"
            >✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble-ai flex items-center gap-1.5 py-3">
                <span className="w-2 h-2 rounded-full bg-[var(--vonage-purple)] animate-[dot-bounce_1.4s_ease-in-out_infinite]" />
                <span className="w-2 h-2 rounded-full bg-[var(--vonage-purple)] animate-[dot-bounce_1.4s_ease-in-out_0.2s_infinite]" />
                <span className="w-2 h-2 rounded-full bg-[var(--vonage-purple)] animate-[dot-bounce_1.4s_ease-in-out_0.4s_infinite]" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/[0.1]">
            {turns >= MAX_TURNS ? (
              <p className="text-xs text-center text-white/50 py-2">{t(lang, 'chatLimit')}</p>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 text-sm !py-2.5 !px-3"
                  placeholder={t(lang, 'chatPlaceholder')}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  disabled={chatLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={chatLoading || !input.trim()}
                  className="btn-primary !px-4 !py-2.5 text-sm disabled:opacity-40"
                >
                  {t(lang, 'chatSend')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
