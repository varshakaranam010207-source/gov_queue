import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Send,
  User,
  Bot,
  HelpCircle,
  ShieldCheck,
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  sources?: string[];
  suggestions?: string[];
  timestamp: string;
}

const STARTER_QUESTIONS = [
  'What documents do I need for a passport appointment?',
  'How do I apply for an income certificate?',
  'Which center provides driving licence services?',
  'How long will I have to wait in the queue today?',
  'Can I book an Aadhaar biometric update appointment tomorrow?',
];

export const GovGuidePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { error: toastError } = useToast();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: `Namaste! I am **GovGuide AI**, your official assistant for government appointment reservations and queue facilitation.

I can guide you on:
* **Required Documents:** Certified checklists for Aadhaar, Passports, Driving Licences, and Certificates
* **Eligibility & Guidelines:** How to apply and who qualifies
* **Locations & Centers:** Regional Transport Offices, Passport Seva Kendras, and Collectorate centers
* **Live Queue Navigation:** Token rules and counter wait time expectations

Feel free to ask a question below or select one of the suggested topics!`,
      sources: ['National e-Governance Division', 'Citizen Service Charter'],
      suggestions: STARTER_QUESTIONS.slice(0, 3),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle query from URL parameter (e.g. /guide?q=...)
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery.trim()) {
      handleSend(urlQuery.trim());
    }
  }, [searchParams]);

  const handleSend = async (queryToSend: string) => {
    if (!queryToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: queryToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.askGovGuide(queryToSend.trim());
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        sources: res.sources,
        suggestions: res.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      toastError(err?.message || 'GovGuide AI service is temporarily slow. Please retry.');
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        content: `I apologize, but GovGuide AI is experiencing network latency. You can browse the services catalog directly or contact the administrative facilitation helpline at **1800-11-2026**.`,
        sources: ['Official Helpdesk'],
        suggestions: ['How do I book an appointment?', 'Where are the service centers located?'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-govnavy-900 tracking-tight">GovGuide AI</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Grounded in Official Data
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Verified public administrative guidance &bull; Google Gemini Intelligence
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Statutory Compliance Ensured</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-govnavy-900'
                  : 'bg-gradient-to-br from-emerald-600 to-teal-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-govnavy-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-subtle'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-2">
                {msg.content}
              </div>

              {/* Sources Citation */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-600" /> Sources:
                  </span>
                  {msg.sources.map((src, i) => (
                    <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                      {src}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Followups */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Suggested Questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        className="text-left text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className={`block text-[9px] mt-2 ${msg.sender === 'user' ? 'text-slate-300 text-right' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>GovGuide AI is reviewing the official administrative requirements...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Legal Disclaimer */}
      <div className="shrink-0 space-y-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(inputQuery); }}
          className="bg-white p-2 rounded-2xl border border-slate-200 shadow-card flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything about required documents, appointment procedures, wait times..."
            className="flex-1 px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-40 shadow-sm shrink-0"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400">
          GovGuide AI provides administrative guidance. Please verify current statutory requirements with the relevant government department.
        </p>
      </div>
    </div>
  );
};
