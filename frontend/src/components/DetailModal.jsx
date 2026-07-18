import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Send, Bot, User } from 'lucide-react';
import api from '../api/axios';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

const DetailModal = ({ isOpen, onClose, topic, initialContent, financeData, currencySym }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { role: 'assistant', content: `Hi! I'm your AI advisor. Let's discuss your ${topic} strategy. Here's a breakdown to start with:\n\n${initialContent}` }
            ]);
        }
    }, [isOpen, topic, initialContent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                topic,
                message: userMsg,
                history: messages
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Generate dummy chart data based on topic and real finance data
    const rev = financeData?.monthly_revenue || 0;
    const exp = financeData?.monthly_expenses || 0;
    
    let chart;
    if (topic === 'Growth') {
        const data = [
            { month: 'Month 1', revenue: rev },
            { month: 'Month 2', revenue: rev * 1.15 },
            { month: 'Month 3', revenue: rev * 1.35 },
            { month: 'Month 4', revenue: rev * 1.6 },
            { month: 'Month 5', revenue: rev * 1.9 },
        ];
        chart = (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(val) => `${currencySym}${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        );
    } else if (topic === 'Marketing') {
        const data = [
            { channel: 'Social Media', spend: exp * 0.4 },
            { channel: 'SEO/Content', spend: exp * 0.25 },
            { channel: 'Paid Ads', spend: exp * 0.2 },
            { channel: 'Email', spend: exp * 0.15 },
        ];
        chart = (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="channel" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    } else {
        const data = [
            { name: 'Profit/Buffer', value: Math.max(rev - exp, 0) },
            { name: 'Expenses', value: exp }
        ];
        chart = (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-5xl h-[80vh] flex flex-col md:flex-row overflow-hidden relative border-white/20">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full transition-colors">
                    <X size={20} />
                </button>

                {/* Left Side: Visuals & Graph */}
                <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-slate-900/40 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-white mb-2">{topic} Insights</h2>
                    <p className="text-slate-400 mb-8 text-sm leading-relaxed">{initialContent}</p>
                    
                    <div className="bg-slate-800/50 p-6 rounded-2xl flex-1 flex flex-col">
                        <h3 className="text-lg font-medium text-white mb-6">Interactive Projection</h3>
                        <div className="flex-1 min-h-[300px] flex items-center justify-center">
                            {chart}
                        </div>
                    </div>
                </div>

                {/* Right Side: Chatbot */}
                <div className="w-full md:w-1/2 flex flex-col bg-slate-900/80">
                    <div className="p-4 border-b border-white/10 bg-slate-800/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">AI Advisor</h3>
                            <p className="text-xs text-slate-400">Ask me anything about {topic.toLowerCase()}</p>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-secondary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-400 rounded-tl-none text-sm flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-slate-800/30 border-t border-white/10">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Ask about ${topic.toLowerCase()}...`}
                                className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
