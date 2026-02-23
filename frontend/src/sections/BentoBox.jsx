import React from 'react';
import { motion } from 'motion/react';
import { Mic, Captions, CheckSquare, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const features = [
    {
        title: "Crystal Clear Transcripts",
        description: "Industry-leading Whisper AI captures every word with near-perfect accuracy, even in noisy environments.",
        icon: <Captions className="w-5 h-5 text-indigo-500" />,
        className: "md:col-span-2",
    },
    {
        title: "Instant Audio Capture",
        description: "Record directly in browser or upload files.",
        icon: <Mic className="w-5 h-5 text-indigo-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Auto-Extracted Action Items",
        description: "Gemini AI instantly identifies deliverables and assigns them to a clear checklist.",
        icon: <CheckSquare className="w-5 h-5 text-indigo-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Enterprise Privacy",
        description: "Audio is processed securely and immediately deleted from our servers. Your data remains yours.",
        icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
        className: "md:col-span-2",
    }
];

const BentoBox = () => {
    return (
        <section id="how-it-works" className="py-24 px-6 bg-black text-zinc-100 relative">
            <div className="max-w-5xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Focus on the conversation.
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        TalkNote's intelligent pipeline turns raw audio into structured knowledge instantly.
                    </p>
                </motion.div>

                {/* Staggered Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: {},
                        show: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                            }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl bg-surface border border-[#1c1c1c] p-8 hover:border-[#2e2e2e] transition-colors duration-300",
                                feature.className
                            )}
                        >
                            {/* Hover lift handled by group hover if we wanted it, but keeping it subtle */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111111] border border-[#1c1c1c] mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-500 leading-relaxed text-sm">
                                {feature.description}
                            </p>

                            {/* Subtle hover glow tied to Indigo */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};

export default BentoBox;
