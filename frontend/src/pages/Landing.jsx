import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero_new.png';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${heroImg})` }}
            >
                {/* Removed the dark overlay to make the image fully clear */}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center mt-[40vh]">
                <button 
                    onClick={() => navigate('/login')}
                    className="btn-primary text-2xl px-12 py-5 rounded-full shadow-[0_10px_40px_rgba(6,182,212,0.6)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(139,92,246,0.8)] transition-all duration-300 font-black tracking-wide bg-black/50 backdrop-blur-sm border-2 border-primary/50 text-white"
                >
                    Welcome to Trio AI
                </button>
            </div>
        </div>
    );
};

export default Landing;
