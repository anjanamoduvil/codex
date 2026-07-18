import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import DetailModal from '../components/DetailModal';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, topic: '', content: '' });
    
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard');
            if (!res.data.business) {
                navigate('/business'); // Force profile creation
                return;
            }
            if (!res.data.finance) {
                navigate('/finance'); // Force finance entry
                return;
            }
            setData(res.data);
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
            await fetchDashboard(); // Refresh data to show new report
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

    const openModal = (topic, content) => {
        setModalConfig({ isOpen: true, topic, content });
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    const sym = currencySymbols[data?.business?.currency] || '$';
    const isPlanning = data?.business?.status === 'planning';

    return (
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-white">{data?.business?.name || 'Dashboard'}</h1>
                    <p className="text-slate-400">Industry: {data?.business?.industry} <span className="mx-2 text-white/20">|</span> Status: <span className="text-accent">{isPlanning ? 'Planning' : 'Active'}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-300 hidden md:inline">Welcome, {user?.name}</span>
                    <button onClick={handleLogout} className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">Logout</button>
                </div>
            </header>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8">{error}</div>}

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">AI Insights</h2>
                    <p className="text-slate-400 text-sm">Click any card to view detailed projections and chat.</p>
                </div>
                <button 
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            ) : (
                <div className="glass-panel p-12 text-center border-dashed border-2 border-white/10">
                    <div className="text-5xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Insights Yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">Click the generate button above to analyze your business profile and financials using AI.</p>
                </div>
            )}

            {/* Financial Summary Section */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-6">Current Financials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <p className="text-slate-400 text-sm mb-1">{isPlanning ? 'Est. Monthly Revenue' : 'Monthly Revenue'}</p>
                        <p className="text-2xl font-bold text-white">{sym}{data?.finance?.monthly_revenue?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <p className="text-slate-400 text-sm mb-1">{isPlanning ? 'Est. Monthly Burn' : 'Monthly Expenses'}</p>
                        <p className="text-2xl font-bold text-white">{sym}{data?.finance?.monthly_expenses?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <p className="text-slate-400 text-sm mb-1">{isPlanning ? 'Initial Capital' : 'Cash on Hand'}</p>
                        <p className="text-2xl font-bold text-white">{sym}{data?.finance?.cash_on_hand?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>

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
