import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

const FinanceInput = () => {
    const [formData, setFormData] = useState({
        monthly_revenue: '',
        monthly_expenses: '',
        cash_on_hand: '',
        income_amount: '',
        income_frequency: 'monthly'
    });
    const [error, setError] = useState('');
    const [business, setBusiness] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await api.get('/business');
                setBusiness(res.data);
            } catch (err) {
                navigate('/business'); // Redirect if no business profile
            }
        };
        fetchBusiness();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Auto-calculate monthly revenue based on income frequency
        let calculatedMonthly = 0;
        const amount = parseFloat(formData.income_amount) || 0;
        if (formData.income_frequency === 'daily') calculatedMonthly = amount * 30;
        else if (formData.income_frequency === 'yearly') calculatedMonthly = amount / 12;
        else calculatedMonthly = amount;

        const dataToSubmit = {
            ...formData,
            monthly_revenue: calculatedMonthly
        };

        try {
            await api.post('/finance', dataToSubmit);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save finance data');
        }
    };

    if (!business) return null;

    const sym = currencySymbols[business.currency] || '$';
    const isPlanning = business.status === 'planning';

    return (
        <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-panel w-full max-w-xl p-8">
                <div className="mb-8 border-b border-white/10 pb-6 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {isPlanning ? 'Launch Financials' : 'Financial Snapshot'}
                    </h1>
                    <p className="text-slate-400 font-medium">Let's look at the numbers to tailor your AI insights.</p>
                </div>

                {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 border border-red-500/30 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Advanced Income Section */}
                    <div className="bg-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">💰 Income Tracking</h3>
                        <p className="text-xs text-slate-400 mb-4">We will use this to calculate your monthly revenue and generate specific marketing strategies.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-text">Income Amount ({sym})</label>
                                <input 
                                    type="number" className="input-field" placeholder="0" required min="0"
                                    value={formData.income_amount} onChange={(e) => setFormData({...formData, income_amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label-text">Frequency</label>
                                <select 
                                    className="input-field bg-slate-900" required
                                    value={formData.income_frequency} onChange={(e) => setFormData({...formData, income_frequency: e.target.value})}
                                >
                                    <option value="daily">Per Day</option>
                                    <option value="monthly">Per Month</option>
                                    <option value="yearly">Per Year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-text">{isPlanning ? `Estimated Monthly Expenses (${sym})` : `Average Monthly Expenses (${sym})`}</label>
                            <input 
                                type="number" className="input-field" placeholder="0" required min="0"
                                value={formData.monthly_expenses} onChange={(e) => setFormData({...formData, monthly_expenses: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="label-text">{isPlanning ? `Initial Capital Available (${sym})` : `Current Cash on Hand (${sym})`}</label>
                            <input 
                                type="number" className="input-field" placeholder="0" required min="0"
                                value={formData.cash_on_hand} onChange={(e) => setFormData({...formData, cash_on_hand: e.target.value})}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 mt-8 text-lg">Generate AI Insights 🚀</button>
                </form>
            </div>
        </div>
    );
};

export default FinanceInput;
