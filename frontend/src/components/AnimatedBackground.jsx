import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
            {/* Dark base to ensure contrast */}
            <div className="absolute inset-0 bg-black/40 z-0"></div>
            
            {/* Orb 1: Primary Cyan */}
            <motion.div 
                animate={{ 
                    x: [0, 100, -100, 0], 
                    y: [0, -100, 100, 0],
                    scale: [1, 1.2, 0.8, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[100px] z-0"
            />

            {/* Orb 2: Secondary Purple */}
            <motion.div 
                animate={{ 
                    x: [0, -150, 50, 0], 
                    y: [0, 150, -50, 0],
                    scale: [1, 0.9, 1.3, 1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/20 rounded-full blur-[120px] z-0"
            />

            {/* Orb 3: Accent Pink */}
            <motion.div 
                animate={{ 
                    x: [0, 50, -150, 0], 
                    y: [0, -50, 150, 0],
                    scale: [0.8, 1.1, 0.9, 0.8]
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 5 }}
                className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[90px] z-0"
            />
        </div>
    );
};

export default AnimatedBackground;
