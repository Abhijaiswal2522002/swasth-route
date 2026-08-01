'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Headphones, 
  Phone, Mail, Calendar, ExternalLink, ShieldAlert,
  Loader2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ApiClient from '@/lib/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const emergencyHelplines = [
  {
    category: 'Critical Dispatch Desk',
    items: [
      { name: 'SwasthRoute 24/7 Hotline', value: '+91 98765 43210', type: 'phone', description: 'Immediate dispatcher support for emergency orders' },
      { name: 'Emergency Email Support', value: 'support@swasthroute.com', type: 'email', description: 'Urgent compliance or order adjustments' },
    ]
  },
  {
    category: 'Public Emergency Numbers',
    items: [
      { name: 'National Medical Helpline', value: '108', type: 'phone', description: 'Free emergency ambulance dispatch' },
      { name: 'Disaster Management', value: '1078', type: 'phone', description: 'National disaster response hotline' },
    ]
  },
  {
    category: 'Pharmacy & Fleet Desks',
    items: [
      { name: 'Merchant Helpline', value: 'merchant@swasthroute.com', type: 'email', description: 'Account, billing, and subscription support' },
      { name: 'Rider Coordinator Desk', value: 'rider-support@swasthroute.com', type: 'email', description: 'Rider registration, maps, and payouts assistance' },
    ]
  }
];

const sampleQueries = [
  'How do I track my order?',
  'How do subscription commission rates work?',
  'What is the refund timeline for canceled requests?',
  'Contact the 24/7 hotline'
];

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'helplines'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am SwasthAI, your automated emergency support agent. How can I assist you with deliveries, inventory, or order tracking today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Open chatbot via custom event (e.g. from buttons on homepage)
  useEffect(() => {
    const handleOpenSupport = () => {
      setIsOpen(true);
      setActiveTab('chat');
    };

    window.addEventListener('open-support-chat', handleOpenSupport);
    return () => {
      window.removeEventListener('open-support-chat', handleOpenSupport);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    try {
      // Map message history to send to Gemini
      const history = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const res = await ApiClient.sendSupportMessage(userText, history);
      
      const aiResponseText = res.data?.text || 'I apologize, but I am having trouble connecting to the support server. Please try calling our direct helpline at +91 98765 43210.';
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      console.error('Support chat send error:', err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'System Timeout: Unable to contact support servers. Please check your network connection or dial +91 98765 43210 directly.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSampleQueryClick = (query: string) => {
    if (query === 'Contact the 24/7 hotline') {
      setActiveTab('helplines');
    } else {
      setInputValue(query);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Floating Glowing Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(20,184,166,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 animate-bounce cursor-pointer"
        >
          <Headphones className="w-7 h-7" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[550px] bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-950 p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/10 p-2.5 rounded-2xl text-teal-400 border border-teal-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">Swasth Support</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Support Online</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950/50 p-1 border-b border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'chat'
                  ? 'text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('helplines')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'helplines'
                  ? 'text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Helplines Directory
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-hidden relative bg-slate-900/50">
            
            {/* TAB 1: CHATBOT */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between">
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-700/10'
                          : 'bg-slate-950 text-slate-100 rounded-bl-none border border-slate-800'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[8px] mt-1 text-right font-semibold ${msg.sender === 'user' ? 'text-teal-200' : 'text-slate-500'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-950 text-slate-400 p-4 rounded-2xl rounded-bl-none border border-slate-800 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">SwasthAI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Pre-made quick queries (only shown if history is small) */}
                {messages.length < 4 && (
                  <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-2 shrink-0">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Common Questions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleQueries.map((query, i) => (
                        <button
                          key={i}
                          onClick={() => handleSampleQueryClick(query)}
                          className="text-[10px] bg-slate-950 border border-slate-800 hover:border-teal-500/40 text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-all text-left"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2 shrink-0">
                  <Input
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your support message..."
                    className="flex-1 bg-slate-900 border-slate-850 rounded-xl h-11 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <Button 
                    type="submit"
                    disabled={isSending || !inputValue.trim()}
                    className="h-11 w-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center border-0 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 2: HELPLINES */}
            {activeTab === 'helplines' && (
              <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="bg-teal-950/20 border border-teal-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Emergency Order Support</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">For ongoing emergency orders requiring immediate assistance, please use the dispatcher phone line. Our call operators are active 24/7.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {emergencyHelplines.map((cat, i) => (
                    <div key={i} className="space-y-3">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-slate-800 pb-1.5">{cat.category}</p>
                      <div className="space-y-3">
                        {cat.items.map((item, j) => (
                          <div key={j} className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-extrabold text-white tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-gray-500 leading-normal">{item.description}</p>
                              <p className="text-xs font-black text-teal-400 pt-0.5 select-all">{item.value}</p>
                            </div>
                            
                            <a
                              href={item.type === 'phone' ? `tel:${item.value.replace(/\s+/g, '')}` : `mailto:${item.value}`}
                              className="p-2.5 bg-white/5 hover:bg-teal-600 hover:text-white rounded-xl text-gray-400 transition-all shrink-0 cursor-pointer border border-transparent hover:border-teal-500/30"
                              title={item.type === 'phone' ? 'Call' : 'Email'}
                            >
                              {item.type === 'phone' ? (
                                <Phone className="w-4 h-4" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
