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
            navigate('/business');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to sign up');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-8 md:p-12 min-h-screen bg-background">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md glass-panel p-8 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Create an Account</h2>
                    <p className="text-slate-400">Start your AI-powered journey today</p>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label-text">Full Name</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label-text">Email Address</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label-text">Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-4">Sign Up</button>
                </form>
                
                <p className="text-center mt-8 text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-accent hover:text-white hover:underline font-medium transition-colors">Log in here</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
