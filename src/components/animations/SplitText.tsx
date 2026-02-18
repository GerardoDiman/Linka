import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    animationDelay?: number;
    display?: "inline-flex" | "inline-block" | "flex" | "block";
}

export const SplitText = ({
    text,
    className = "",
    delay = 0,
    animationDelay = 0.05,
    display = "inline-flex"
}: SplitTextProps) => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });

    useEffect(() => {
        // Reset and re-animate when text changes
        controls.set("hidden");
        if (isInView) {
            const timer = setTimeout(() => {
                controls.start("visible");
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [controls, isInView, text]);

    const words = text.split(" ");

    const containerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: delay,
                staggerChildren: animationDelay,
            },
        },
    };

    const itemVars = {
        hidden: {
            opacity: 0,
            y: "110%",
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
        },
    };
    return (
        <motion.span
            ref={ref}
            variants={containerVars}
            initial="hidden"
            animate={controls}
            className={`${display} flex-wrap gap-x-[0.2em] overflow-hidden ${className}`}
        >
            {words.map((word, wordIdx) => (
                <span key={wordIdx} className="inline-block whitespace-nowrap overflow-hidden py-[0.1em] -my-[0.1em]">
                    {word.split("").map((char, charIdx) => (
                        <motion.span
                            key={charIdx}
                            variants={itemVars}
                            className="inline-block origin-bottom"
                            style={{ display: "inline-block", verticalAlign: "bottom" }}
                        >
                            {char}
                        </motion.span>
                    ))}
                    {/* Add a space after each word except the last one */}
                    {wordIdx < words.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                    )}
                </span>
            ))}
        </motion.span>
    );
};
