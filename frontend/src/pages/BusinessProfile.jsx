import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';

const BusinessProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        goal: '',
        status: 'planning', // planning or active
        currency: 'USD'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/business');
                if (res.data) setFormData(res.data);
            } catch (err) {
                // No profile yet, that's fine
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/business', formData);
            navigate('/finance'); // Move to step 2
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-panel w-full max-w-2xl p-8"
            >
                <div className="mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Business Profile</h1>
                    <p className="text-slate-400 font-medium">Tell us about your company so our AI can provide tailored insights.</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-text">Business Name</label>
                            <input 
                                type="text" className="input-field" placeholder="Acme Corp" required
                                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="label-text">Industry</label>
                            <input 
                                type="text" className="input-field" placeholder="e.g. Retail, SaaS, Bakery" required
                                value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label-text">What does your business do?</label>
                        <textarea 
                            className="input-field h-24 resize-none" required
                            placeholder="We sell artisanal coffee and pastries..."
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div>
                        <label className="label-text">What is your primary goal right now?</label>
                        <input 
                            type="text" className="input-field" required
                            placeholder="e.g. Get first 100 customers, secure funding"
                            value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-text">Business Status</label>
                            <select 
                                className="input-field bg-slate-900" required
                                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="planning">Just Planning / Going to Start</option>
                                <option value="active">Already Started / Active</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Primary Currency</label>
                            <select 
                                className="input-field bg-slate-900" required
                                value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="btn-primary w-full py-4 text-lg">Next: Financials &rarr;</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BusinessProfile;
