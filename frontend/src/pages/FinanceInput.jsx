import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

const FinanceInput = () => {
    const [formData, setFormData] = useState({
        monthly_revenue: '',
        monthly_expenses: '',
        cash_on_hand: ''
    });
    const [bizContext, setBizContext] = useState({ status: 'started', currency: 'USD' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const savedCtx = sessionStorage.getItem('bizContext');
        if (savedCtx) setBizContext(JSON.parse(savedCtx));
    }, []);

    const isPlanning = bizContext.status === 'planning';
    const sym = currencySymbols[bizContext.currency] || '$';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/finance', {
                monthly_revenue: formData.monthly_revenue ? parseFloat(formData.monthly_revenue) : 0,
                monthly_expenses: formData.monthly_expenses ? parseFloat(formData.monthly_expenses) : 0,
                cash_on_hand: formData.cash_on_hand ? parseFloat(formData.cash_on_hand) : 0
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save financial data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-background min-h-screen">
            <div className="glass-panel w-full max-w-xl p-8">
                <div className="mb-8 border-b border-white/10 pb-6 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isPlanning ? 'Launch Financials' : 'Financial Snapshot'}
                    </h1>
                    <p className="text-slate-400">
                        {isPlanning ? 'Enter your estimated costs and initial capital to calculate runway.' : 'Enter your current numbers to calculate runway and financial health.'}
                    </p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label-text">{isPlanning ? 'Estimated Monthly Revenue (Optional)' : 'Monthly Revenue'} ({sym})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{sym}</span>
                            <input 
                                type="number" name="monthly_revenue" className="input-field pl-8" 
                                placeholder="0" min="0" step="0.01"
                                value={formData.monthly_revenue} onChange={handleChange} 
                                required={!isPlanning}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label-text">{isPlanning ? 'Estimated Monthly Burn / Expenses' : 'Monthly Expenses'} ({sym})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{sym}</span>
                            <input 
                                type="number" name="monthly_expenses" className="input-field pl-8" 
                                placeholder="0" min="0" step="0.01"
                                value={formData.monthly_expenses} onChange={handleChange} 
                                required={!isPlanning}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label-text">{isPlanning ? 'Initial Capital Available' : 'Current Cash on Hand'} ({sym})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{sym}</span>
                            <input 
                                type="number" name="cash_on_hand" className="input-field pl-8" 
                                placeholder="50000" min="0" step="0.01"
                                value={formData.cash_on_hand} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button type="button" onClick={() => navigate('/business')} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                            Back
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Generate Dashboard'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FinanceInput;
