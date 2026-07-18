import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(name, email, password);
            navigate('/business'); // Proceed to business profile setup
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-8 md:p-12 min-h-screen">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md glass-panel p-8"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Create an Account</h2>
                    <p className="text-slate-400 font-medium">Start your AI-powered journey today</p>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 font-medium text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label-text">Full Name</label>
                        <input 
                            type="text" className="input-field" placeholder="John Doe" required
                            value={name} onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label-text">Email</label>
                        <input 
                            type="email" className="input-field" placeholder="you@company.com" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label-text">Password</label>
                        <input 
                            type="password" className="input-field" placeholder="••••••••" required minLength="6"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-4">Sign Up</button>
                </form>
                
                <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                    Already have an account? <Link to="/login" className="text-primary hover:text-secondary hover:underline font-bold transition-colors">Log in here</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
