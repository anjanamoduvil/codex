import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const FloatingChat = ({ contextStr }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hi! I'm Trio AI. What business question can I help you with today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', { 
                message: userMsg,
                context: contextStr
            });
            setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute bottom-20 right-0 w-80 sm:w-96 glass-panel overflow-hidden flex flex-col bg-black/60 backdrop-blur-2xl border-white/10"
                        style={{ height: '500px', maxHeight: '80vh' }}
                    >
                        {/* Header */}
                        <div className="bg-primary/20 p-4 border-b border-primary/20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🤖</div>
                                <div>
                                    <h3 className="font-bold text-white leading-tight">Trio AI</h3>
                                    <p className="text-xs text-primary font-bold">Always online</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed font-medium ${
                                        msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/20' 
                                            : 'bg-slate-800 border border-white/5 text-slate-200 rounded-bl-none shadow-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 border border-white/5 text-slate-400 p-3 rounded-2xl rounded-bl-none text-sm flex gap-1 items-center shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-slate-900/80 border-t border-white/10">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a business question..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors font-medium"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim() || loading}
                                    className="bg-primary hover:bg-secondary disabled:opacity-50 text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-md"
                                >
                                    ↑
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-[0_10px_25px_rgba(14,165,233,0.5)] flex items-center justify-center text-3xl border-2 border-white/20 text-white"
            >
                {isOpen ? '✕' : '🤖'}
            </motion.button>
        </div>
    );
};

export default FloatingChat;
