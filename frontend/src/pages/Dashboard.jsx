import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import DetailModal from '../components/DetailModal';
import { CheckCircle2, TrendingUp, Download, Check } from 'lucide-react';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, topic: '', content: '' });
    const [checkedTasks, setCheckedTasks] = useState({});
    
    const dashboardRef = useRef(null);
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard');
            if (!res.data.business) {
                navigate('/business'); 
                return;
            }
            if (!res.data.finance) {
                navigate('/finance'); 
                return;
            }
            setData(res.data);
            
            // Try to load checked tasks from local storage
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

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleGenerateAI = async () => {
        setAiLoading(true);
        setError('');
        try {
            await api.post('/ai/analyze');
            await fetchDashboard(); 
            setCheckedTasks({}); // Reset tasks for new report
        } catch (err) {
            setError(err.response?.data?.error || 'AI Analysis failed');
        } finally {
            setAiLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTask = (index) => {
        const newChecked = { ...checkedTasks, [index]: !checkedTasks[index] };
        setCheckedTasks(newChecked);
        if (data?.ai_report?.id) {
            localStorage.setItem(`tasks_${data.ai_report.id}`, JSON.stringify(newChecked));
        }
    };

    const exportPDF = () => {
        window.print();
    };

    const openModal = (topic, content) => {
        setModalConfig({ isOpen: true, topic, content });
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    const sym = currencySymbols[data?.business?.currency] || '$';
    const isPlanning = data?.business?.status === 'planning';
    
    // Check if we have actionable steps, if it's a string, we parse it, otherwise use it if array
    let steps = [];
    if (data?.ai_report?.actionable_steps) {
        steps = typeof data.ai_report.actionable_steps === 'string' ? JSON.parse(data.ai_report.actionable_steps) : data.ai_report.actionable_steps;
    }
    
    let trends = [];
    if (data?.ai_report?.market_trends) {
        trends = typeof data.ai_report.market_trends === 'string' ? JSON.parse(data.ai_report.market_trends) : data.ai_report.market_trends;
    }
    
    const tasksCompleted = Object.values(checkedTasks).filter(Boolean).length;
    const progress = steps.length > 0 ? (tasksCompleted / steps.length) * 100 : 0;

    return (
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative bg-background min-h-screen" ref={dashboardRef}>
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-white">{data?.business?.name || 'Dashboard'}</h1>
                    <p className="text-slate-400">Industry: {data?.business?.industry} <span className="mx-2 text-white/20">|</span> Status: <span className="text-accent">{isPlanning ? 'Planning' : 'Active'}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <button id="export-btn" onClick={exportPDF} className="hidden md:flex items-center gap-2 px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">
                        <Download size={16} /> Export PDF
                    </button>
                    <button onClick={handleLogout} className="px-4 py-2 border border-slate-700 hover:bg-red-900/50 hover:text-red-300 hover:border-red-800 rounded-lg text-slate-300 transition-colors">Logout</button>
                </div>
            </header>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8">{error}</div>}

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">AI Executive Summary</h2>
                    <p className="text-slate-400 text-sm">Click any card to view detailed projections and chat.</p>
                </div>
                <button 
                    id="generate-btn"
                    onClick={handleGenerateAI} 
                    disabled={aiLoading}
                    className="btn-primary flex items-center gap-2"
                >
                    {aiLoading ? (
                        <><div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></div> Analyzing...</>
                    ) : (
                        <>✨ Generate New Insights</>
                    )}
                </button>
            </div>

            {data?.ai_report ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Growth Card */}
                        <div onClick={() => openModal('Growth', data.ai_report.growth_suggestion)} className="glass-panel p-6 flex flex-col hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-1">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center text-2xl mb-4">📈</div>
                            <h3 className="text-lg font-bold text-white mb-2">Growth Strategy</h3>
                            <p className="text-slate-300 leading-relaxed flex-1 line-clamp-4">{data.ai_report.growth_suggestion}</p>
                            <div className="mt-4 text-primary text-sm font-medium flex items-center gap-1">View Details & Chat &rarr;</div>
                        </div>

                        {/* Marketing Card */}
                        <div onClick={() => openModal('Marketing', data.ai_report.marketing_suggestion)} className="glass-panel p-6 flex flex-col hover:border-secondary/50 transition-all cursor-pointer hover:-translate-y-1">
                            <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center text-2xl mb-4">🎯</div>
                            <h3 className="text-lg font-bold text-white mb-2">Marketing Focus</h3>
                            <p className="text-slate-300 leading-relaxed flex-1 line-clamp-4">{data.ai_report.marketing_suggestion}</p>
                            <div className="mt-4 text-secondary text-sm font-medium flex items-center gap-1">View Details & Chat &rarr;</div>
                        </div>

                        {/* Finance Card */}
                        <div onClick={() => openModal('Finance', data.ai_report.finance_insight)} className="glass-panel p-6 flex flex-col hover:border-accent/50 transition-all cursor-pointer hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="text-right">
                                    <span className="block text-3xl font-bold text-accent">{data.ai_report.runway_months}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Months Runway</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center text-2xl mb-4">💰</div>
                            <h3 className="text-lg font-bold text-white mb-2">Financial Insight</h3>
                            <p className="text-slate-300 leading-relaxed flex-1 pr-12 line-clamp-4">{data.ai_report.finance_insight}</p>
                            <div className="mt-4 text-accent text-sm font-medium flex items-center gap-1">View Details & Chat &rarr;</div>
                        </div>
                    </div>
                    
                    {/* NEW PHASE 3 FEATURES */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        
                        {/* Actionable Roadmap */}
                        <div className="md:col-span-2 glass-panel p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-primary" size={24} />
                                    <h3 className="text-xl font-bold text-white">Actionable Roadmap</h3>
                                </div>
                                <div className="text-sm font-medium text-slate-400">
                                    {tasksCompleted} / {steps.length || 0} Completed
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="space-y-3">
                                {steps && steps.length > 0 ? (
                                    steps.map((step, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => toggleTask(idx)}
                                            className={`p-4 rounded-xl border ${checkedTasks[idx] ? 'bg-primary/5 border-primary/20' : 'bg-slate-900/50 border-slate-700'} hover:border-primary/50 transition-all cursor-pointer flex items-start gap-4`}
                                        >
                                            <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${checkedTasks[idx] ? 'bg-primary border-primary text-white' : 'border-slate-500'}`}>
                                                {checkedTasks[idx] && <Check size={14} />}
                                            </div>
                                            <p className={`text-sm leading-relaxed ${checkedTasks[idx] ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                                {step}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                                        Generate insights to see your roadmap.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Market Pulse */}
                        <div className="glass-panel p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                <TrendingUp className="text-secondary" size={24} />
                                <h3 className="text-xl font-bold text-white">Market Pulse</h3>
                            </div>
                            <div className="space-y-4">
                                {trends && trends.length > 0 ? (
                                    trends.map((trend, idx) => (
                                        <div key={idx} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 border-l-4 border-l-secondary">
                                            <p className="text-sm text-slate-300 leading-relaxed">{trend}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-400">
                                        No trends available.
                                    </div>
                                )}
                            </div>
                            
                            {/* Financial Summary inserted here for layout density */}
                            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Financial Overview</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">{isPlanning ? 'Est. Revenue' : 'Revenue'}</span>
                                    <span className="font-bold text-white">{sym}{data?.finance?.monthly_revenue?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">{isPlanning ? 'Est. Burn' : 'Expenses'}</span>
                                    <span className="font-bold text-white">{sym}{data?.finance?.monthly_expenses?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">{isPlanning ? 'Initial Capital' : 'Cash Reserve'}</span>
                                    <span className="font-bold text-accent">{sym}{data?.finance?.cash_on_hand?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            ) : (
                <div className="glass-panel p-12 text-center border-dashed border-2 border-white/10">
                    <div className="text-5xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Insights Yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">Click the generate button above to analyze your business profile and financials using AI.</p>
                </div>
            )}

            <DetailModal 
                isOpen={modalConfig.isOpen} 
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                topic={modalConfig.topic}
                initialContent={modalConfig.content}
                financeData={data?.finance}
                currencySym={sym}
            />
        </div>
    );
};

export default Dashboard;
