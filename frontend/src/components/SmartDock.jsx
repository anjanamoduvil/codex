import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, LogOut, FileText, Sparkles } from 'lucide-react';

const SmartDock = ({ onGenerate, aiLoading }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleExport = () => {
        window.print();
    };

    const dockItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }), color: 'text-white' },
        { icon: <FileText size={20} />, label: 'Export PDF', onClick: handleExport, color: 'text-slate-400 hover:text-white' },
        { 
            icon: aiLoading ? <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"/> : <Sparkles size={20} />, 
            label: 'Generate', 
            onClick: onGenerate, 
            color: 'text-primary' 
        },
        { icon: <LogOut size={20} />, label: 'Logout', onClick: handleLogout, color: 'text-red-400 hover:text-red-300' }
    ];

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 print:hidden"
        >
            <div className="glass-panel flex items-center gap-2 p-2 px-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl bg-black/40 backdrop-blur-2xl">
                {dockItems.map((item, idx) => (
                    <div key={idx} className="relative group">
                        <motion.button
                            whileHover={{ scale: 1.2, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.onClick}
                            disabled={aiLoading && item.label === 'Generate'}
                            className={`p-3 rounded-xl transition-colors flex items-center justify-center ${item.color} ${item.label === 'Generate' ? 'bg-primary/10 hover:bg-primary/20 shadow-lg shadow-primary/10' : 'hover:bg-white/10'}`}
                        >
                            {item.icon}
                        </motion.button>
                        
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-slate-800 text-white text-xs font-bold py-1 px-3 rounded shadow-lg whitespace-nowrap border border-white/10">
                                {item.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default SmartDock;
