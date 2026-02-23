import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-black text-zinc-100">
            {/* Background Glows (Subtle, strictly structural) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/2 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto mt-20">
                {/* Micro-badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    TalkNote Beta
                </motion.div>

                {/* Hero Headline (BlurIn Animation) */}
                <motion.h1
                    initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                >
                    Capture the <span className="text-zinc-500">meeting.</span><br />
                    We'll handle the <span className="text-white">task.</span>
                </motion.h1>

                {/* Subheadline (FadeSlideUp Animation) */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                >
                    TalkNote listens, transcribes, and extracts your action items in seconds. Be completely present in your conversations, let AI handle the documentation.
                </motion.p>

                {/* CTAs (FadeSlideUp Animation) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/sign-in" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors duration-200 active:scale-95">
                            Start for Free
                        </button>
                    </Link>
                    <a href="#how-it-works" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent border border-[#1f1f1f] text-zinc-300 font-medium hover:text-white hover:border-border-strong transition-colors duration-200">
                            How it works
                        </button>
                    </a>
                </motion.div>

                {/* Social Proof snippet */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-16 text-xs text-zinc-600 font-medium tracking-wide uppercase"
                >
                    Secured by Clerk & Neon Postgres
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;