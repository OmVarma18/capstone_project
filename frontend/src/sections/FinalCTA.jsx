import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const FinalCTA = () => {
    return (
        <section className="py-32 px-6 bg-black text-zinc-100 flex justify-center text-center relative overflow-hidden border-t border-border-subtle">
            {/* Subtle bottom glow */}
            <div className="absolute -bottom-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto relative z-10"
            >
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
                    Ready to reclaim your <br className="hidden md:block" /> meeting time?
                </h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                    Join the professionals using TalkNote to turn their conversations into organized action.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/sign-in" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors duration-200 active:scale-95 shadow-accent">
                            Start for Free
                        </button>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

export default FinalCTA;
