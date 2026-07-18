import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

const DetailModal = ({ isOpen, onClose, topic, initialContent, financeData, currencySym, onUpdate }) => {
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

    // Interactive Income Simulator State (only used if topic === 'Finance')
    const [simAmount, setSimAmount] = useState(financeData?.income_amount || 0);
    const [simFreq, setSimFreq] = useState(financeData?.income_frequency || 'monthly');
    const [simRevenue, setSimRevenue] = useState(financeData?.monthly_revenue || 0);

    // Update simulated revenue when inputs change
    useEffect(() => {
        let calcRev = 0;
        const amt = parseFloat(simAmount) || 0;
        if (simFreq === 'daily') calcRev = amt * 30;
        else if (simFreq === 'yearly') calcRev = amt / 12;
        else calcRev = amt;
        setSimRevenue(calcRev);
    }, [simAmount, simFreq]);

    // Generate chart data based on topic and real/simulated finance data
    const exp = financeData?.monthly_expenses || 0;
    
    let chart;
    if (topic === 'Growth') {
        const rev = financeData?.monthly_revenue || 0;
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
        // Finance Topic uses simulated revenue
        const data = [
            { name: 'Profit/Buffer', value: Math.max(simRevenue - exp, 0) },
            { name: 'Expenses', value: exp }
        ];
        // Only render PieChart if there is actual data, otherwise show empty state
        if (simRevenue === 0 && exp === 0) {
            chart = <div className="text-slate-500 font-medium text-sm text-center">No financial data available. Enter income below to simulate.</div>;
        } else {
            chart = (
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
            );
        }
    }

    const handleApplySimulation = async () => {
        try {
            // Update finance data
            await api.post('/finance', {
                ...financeData,
                income_amount: simAmount,
                income_frequency: simFreq,
                monthly_revenue: simRevenue
            });
            if (onUpdate) await onUpdate(); // Fetch new data globally
            // Let the user know they should close and regenerate
            setMessages(prev => [...prev, { role: 'assistant', content: `I've updated your financial profile! Your new simulated monthly revenue is ${currencySym}${simRevenue.toLocaleString()}. The other charts (like Growth) will now reflect this base revenue! Please hit the "Generate" button in the dock to update your full Growth and Marketing strategies based on this new income!` }]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to update simulation.' }]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={onClose} 
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row max-h-[85vh]"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors border border-white/5 shadow-sm">
                            <X size={20} />
                        </button>

                        <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/20 overflow-y-auto">
                            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                <Sparkles className="text-primary" size={24}/> {topic} Insights
                            </h2>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed font-medium">{initialContent}</p>
                            
                            <div className="bg-black/40 p-6 rounded-2xl flex-1 flex flex-col border border-white/5 shadow-sm">
                                <h3 className="text-lg font-bold text-white mb-4">Interactive Projection</h3>
                                
                                {topic === 'Finance' && (
                                    <div className="mb-6 p-4 bg-slate-900/80 rounded-xl border border-white/5">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Income Simulator</h4>
                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="number" 
                                                className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" 
                                                placeholder="Amount" 
                                                value={simAmount}
                                                onChange={(e) => setSimAmount(e.target.value)}
                                            />
                                            <select 
                                                className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                                value={simFreq}
                                                onChange={(e) => setSimFreq(e.target.value)}
                                            >
                                                <option value="daily">Per Day</option>
                                                <option value="monthly">Per Month</option>
                                                <option value="yearly">Per Year</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-xs text-slate-400">Est. Monthly: <span className="text-white font-bold">{currencySym}{simRevenue.toLocaleString()}</span></div>
                                            <button onClick={handleApplySimulation} className="bg-primary hover:bg-secondary text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors">
                                                Apply Strategy
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 flex items-center justify-center">
                                    {chart}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 flex flex-col bg-slate-900">
                            <div className="p-4 border-b border-white/5 bg-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">AI Advisor</h3>
                                    <p className="text-xs text-slate-400 font-medium">Ask me anything about {topic.toLowerCase()}</p>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/10">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                            {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed font-medium ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/20' : 'bg-slate-800 border border-white/5 text-slate-300 rounded-tl-none shadow-sm'}`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-white/5 text-slate-400 rounded-tl-none text-sm flex gap-1 items-center shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-slate-900 border-t border-white/5">
                                <form onSubmit={handleSend} className="relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Ask about ${topic.toLowerCase()}...`}
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!input.trim() || loading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-secondary disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
                                    >
                                        <Send size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DetailModal;
