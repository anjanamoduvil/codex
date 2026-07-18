import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import DetailModal from '../components/DetailModal';
import SmartDock from '../components/SmartDock';
import { CheckCircle2, TrendingUp, Check, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, topic: '', content: '' });
    const [checkedTasks, setCheckedTasks] = useState({});
    
    const dashboardRef = useRef(null);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard');
            if (!res.data.business) return navigate('/business');
            if (!res.data.finance) return navigate('/finance');
            setData(res.data);
            
            if (res.data.ai_report?.id) {
                const savedTasks = localStorage.getItem(`tasks_${res.data.ai_report.id}`);
                if (savedTasks) setCheckedTasks(JSON.parse(savedTasks));
            }
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleGenerateAI = async () => {
        setAiLoading(true); setError('');
        try {
            await api.post('/ai/analyze');
            await fetchDashboard(); 
            setCheckedTasks({});
        } catch (err) {
            setError(err.response?.data?.error || 'AI Analysis failed');
        } finally {
            setAiLoading(false);
        }
    };

    const openModal = (topic, content) => setModalConfig({ isOpen: true, topic, content });

    const toggleTask = (index) => {
        const newChecked = { ...checkedTasks, [index]: !checkedTasks[index] };
        setCheckedTasks(newChecked);
        if (data?.ai_report?.id) localStorage.setItem(`tasks_${data.ai_report.id}`, JSON.stringify(newChecked));
    };

    if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    const sym = currencySymbols[data?.business?.currency] || '$';
    const isPlanning = data?.business?.status === 'planning';
    
    let steps = [];
    if (data?.ai_report?.actionable_steps) steps = typeof data.ai_report.actionable_steps === 'string' ? JSON.parse(data.ai_report.actionable_steps) : data.ai_report.actionable_steps;
    
    let trends = [];
    if (data?.ai_report?.market_trends) trends = typeof data.ai_report.market_trends === 'string' ? JSON.parse(data.ai_report.market_trends) : data.ai_report.market_trends;
    
    const tasksCompleted = Object.values(checkedTasks).filter(Boolean).length;
    const progress = steps.length > 0 ? (tasksCompleted / steps.length) * 100 : 0;
    
    let healthScore = 50; 
    if (data?.ai_report?.runway_months > 6) healthScore += 20;
    else if (data?.ai_report?.runway_months > 3) healthScore += 10;
    healthScore += Math.min(30, (tasksCompleted / (steps.length || 1)) * 30);
    healthScore = Math.round(healthScore);

    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative min-h-screen" 
            ref={dashboardRef}
        >
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">{data?.business?.name || 'Dashboard'}</h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Industry: <span className="text-white">{data?.business?.industry}</span> <span className="mx-3 text-white/20">|</span> Status: <span className="text-primary font-bold">{isPlanning ? 'Planning' : 'Active'}</span></p>
                </motion.div>
            </header>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8">{error}</div>}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">AI Executive Summary</h2>
                    <p className="text-slate-400 text-sm">Click any card to view detailed projections and chat.</p>
                </div>
            </div>

            {data?.ai_report ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* Trio Health Score Dial */}
                        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col items-center justify-center relative col-span-1 border-primary/20 bg-black/40">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 absolute top-6 flex items-center gap-2"><Activity size={16} className="text-primary"/> Trio Score</h3>
                            <div className="relative w-32 h-32 mt-6 flex items-center justify-center">
                                <svg className="transform -rotate-90 w-32 h-32">
                                    <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                    <motion.circle 
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} className="text-primary drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]" strokeLinecap="round" 
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{healthScore}</span>
                                </div>
                            </div>
                            <p className="text-xs text-center text-slate-500 mt-4 px-2">Based on runway and completed milestones.</p>
                        </motion.div>

                        {/* Growth Card */}
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }} onClick={() => openModal('Growth', data.ai_report.growth_suggestion)} className="glass-panel p-6 flex flex-col cursor-pointer border border-transparent hover:border-primary/50 transition-colors shadow-lg bg-black/40">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-4 shadow-[0_0_15px_rgba(14,165,233,0.1)]">📈</div>
                            <h3 className="text-lg font-bold text-white mb-2">Growth Strategy</h3>
                            <p className="text-slate-400 leading-relaxed flex-1 line-clamp-3">{data.ai_report.growth_suggestion}</p>
                            <div className="mt-4 text-primary text-sm font-bold flex items-center gap-1">View Details & Chat &rarr;</div>
                        </motion.div>

                        {/* Marketing Card */}
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }} onClick={() => openModal('Marketing', data.ai_report.marketing_suggestion)} className="glass-panel p-6 flex flex-col cursor-pointer border border-transparent hover:border-secondary/50 transition-colors shadow-lg bg-black/40">
                            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center text-2xl mb-4 shadow-[0_0_15px_rgba(139,92,246,0.1)]">🎯</div>
                            <h3 className="text-lg font-bold text-white mb-2">Marketing Focus</h3>
                            <p className="text-slate-400 leading-relaxed flex-1 line-clamp-3">{data.ai_report.marketing_suggestion}</p>
                            <div className="mt-4 text-secondary text-sm font-bold flex items-center gap-1">View Details & Chat &rarr;</div>
                        </motion.div>

                        {/* Finance Card */}
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }} onClick={() => openModal('Finance', data.ai_report.finance_insight)} className="glass-panel p-6 flex flex-col cursor-pointer border border-transparent hover:border-accent/50 transition-colors shadow-lg relative overflow-hidden bg-black/40">
                            <div className="absolute top-0 right-0 p-4 text-right">
                                <span className="block text-3xl font-black text-accent drop-shadow-[0_0_10px_rgba(244,63,94,0.2)]">{data.ai_report.runway_months}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Months Runway</span>
                            </div>
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center text-2xl mb-4 shadow-[0_0_15px_rgba(244,63,94,0.1)]">💰</div>
                            <h3 className="text-lg font-bold text-white mb-2">Financial Insight</h3>
                            <p className="text-slate-400 leading-relaxed flex-1 pr-12 line-clamp-3">{data.ai_report.finance_insight}</p>
                            <div className="mt-4 text-accent text-sm font-bold flex items-center gap-1">View Details & Chat &rarr;</div>
                        </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Actionable Roadmap */}
                        <motion.div variants={itemVariants} className="md:col-span-2 glass-panel p-6 border-t-2 border-t-primary/50 shadow-2xl bg-black/40">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-primary" size={24} />
                                    <h3 className="text-xl font-bold text-white">Actionable Roadmap</h3>
                                </div>
                                <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{tasksCompleted} / {steps.length || 0} Completed</div>
                            </div>
                            
                            <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary to-secondary"
                                />
                            </div>

                            <div className="space-y-3">
                                {steps && steps.length > 0 ? (
                                    steps.map((step, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            onClick={() => toggleTask(idx)}
                                            className={`p-4 rounded-xl border ${checkedTasks[idx] ? 'bg-primary/5 border-primary/30' : 'bg-slate-900/50 border-white/5'} transition-all cursor-pointer flex items-start gap-4`}
                                        >
                                            <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${checkedTasks[idx] ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'border-slate-500'}`}>
                                                {checkedTasks[idx] && <Check size={14} />}
                                            </div>
                                            <p className={`text-sm leading-relaxed font-medium ${checkedTasks[idx] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{step}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-white/5">Generate insights to see your roadmap.</div>
                                )}
                            </div>
                        </motion.div>

                        {/* Market Pulse */}
                        <motion.div variants={itemVariants} className="glass-panel p-6 border-t-2 border-t-secondary/50 shadow-2xl bg-black/40">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                <TrendingUp className="text-secondary" size={24} />
                                <h3 className="text-xl font-bold text-white">Market Pulse</h3>
                            </div>
                            <div className="space-y-4">
                                {trends && trends.length > 0 ? (
                                    trends.map((trend, idx) => (
                                        <motion.div whileHover={{ scale: 1.02 }} key={idx} className="p-4 bg-slate-900/50 rounded-xl border border-white/5 border-l-4 border-l-secondary shadow-sm">
                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{trend}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500">No trends available.</div>
                                )}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/10 space-y-5">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Financial Overview</h3>
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                    <span className="text-slate-400 text-sm font-bold">{isPlanning ? 'Est. Revenue' : 'Revenue'}</span>
                                    <span className="font-black text-white text-lg">{sym}{data?.finance?.monthly_revenue?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                    <span className="text-slate-400 text-sm font-bold">{isPlanning ? 'Est. Burn' : 'Expenses'}</span>
                                    <span className="font-black text-white text-lg">{sym}{data?.finance?.monthly_expenses?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-accent/10 p-3 rounded-lg border border-accent/20">
                                    <span className="text-accent text-sm font-bold">{isPlanning ? 'Initial Capital' : 'Cash Reserve'}</span>
                                    <span className="font-black text-accent text-lg">{sym}{data?.finance?.cash_on_hand?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            ) : (
                <div className="glass-panel p-12 text-center border-dashed border-2 border-slate-700 bg-black/40">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-5xl mb-4 inline-block">🤖</motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">No Insights Yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">Click the generate button in the dock below to analyze your business profile and financials using AI.</p>
                </div>
            )}

            <SmartDock onGenerate={handleGenerateAI} aiLoading={aiLoading} />
            
            <DetailModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} topic={modalConfig.topic} initialContent={modalConfig.content} financeData={data?.finance} currencySym={sym} />
        </motion.div>
    );
};

export default Dashboard;
