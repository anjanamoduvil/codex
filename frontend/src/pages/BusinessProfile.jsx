import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const BusinessProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        goal: '',
        status: 'started',
        currency: 'USD'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/business', formData);
            // Pass status and currency to sessionStorage so FinanceInput knows the context
            sessionStorage.setItem('bizContext', JSON.stringify({ status: formData.status, currency: formData.currency }));
            navigate('/finance');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save business profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-background min-h-screen">
            <div className="glass-panel w-full max-w-2xl p-8">
                <div className="mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Business Profile</h1>
                    <p className="text-slate-400">Tell us about your company so our AI can provide tailored insights.</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-text">Business Status</label>
                            <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
                                <option value="started">Already Started</option>
                                <option value="planning">Going to Start (Planning)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Preferred Currency</label>
                            <select name="currency" className="input-field" value={formData.currency} onChange={handleChange}>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-text">Business Name</label>
                            <input type="text" name="name" className="input-field" placeholder="Acme Corp" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="label-text">Industry</label>
                            <input type="text" name="industry" className="input-field" placeholder="E-commerce, SaaS, etc." value={formData.industry} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label-text">Business Description</label>
                        <textarea name="description" className="input-field min-h-[100px] resize-none" placeholder="What does your business do? Who are your customers?" value={formData.description} onChange={handleChange}></textarea>
                    </div>

                    <div>
                        <label className="label-text">Primary Goal</label>
                        <input type="text" name="goal" className="input-field" placeholder="e.g., Increase ARR by 20%, reduce churn, etc." value={formData.goal} onChange={handleChange} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Continue to Financials'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessProfile;
