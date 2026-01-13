
interface ShinyTextProps {
    text: string;
    className?: string;
    disabled?: boolean;
    speed?: number;
}

export const ShinyText = ({ text, className = "", disabled = false, speed = 5 }: ShinyTextProps) => {
    return (
        <div
            className={`text-[#b5b5b5a4] bg-clip-text inline-block ${disabled ? "" : "animate-shine"} ${className}`}
            style={{
                backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                animationDuration: `${speed}s`,
            }}
        >
            {text}
        </div>
    );
};
