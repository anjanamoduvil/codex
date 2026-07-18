import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 z-0 overflow-hidden bg-background">
                <img 
                    src={heroImg} 
                    alt="Welcome to Trio" 
                    className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center mt-auto mb-16 md:mb-24">
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-primary hover:bg-secondary text-white text-xl px-12 py-5 rounded-xl shadow-2xl hover:scale-105 transition-transform font-bold tracking-wide"
                >
                    Welcome to Trio AI
                </button>
            </div>
        </div>
    );
};

export default Landing;
