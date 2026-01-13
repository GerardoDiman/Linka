import { motion, useSpring } from 'framer-motion';
import { useRef } from 'react';

interface MagneticProps {
    children: React.ReactElement;
    amount?: number;
}

export const Magnetic = ({ children, amount = 1 }: MagneticProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
    const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { width, height, left, top } = ref.current!.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        x.set(distanceX * 0.4 * amount);
        y.set(distanceY * 0.4 * amount);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
};
