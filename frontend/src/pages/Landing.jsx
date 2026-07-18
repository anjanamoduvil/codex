import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                    src={heroImg} 
                    alt="Welcome to Trio" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center mt-[10vh]">
                <button 
                    onClick={() => navigate('/login')}
                    className="btn-primary text-xl px-12 py-5 shadow-2xl hover:scale-105 transition-transform"
                >
                    Welcome to Trio AI
                </button>
            </div>
        </div>
    );
};

export default Landing;
