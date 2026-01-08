import React from 'react';
import logoUrl from '../../assets/linka_logo.svg';

interface LogoProps {
    className?: string;
    size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
    return (
        <img
            src={logoUrl}
            alt="Linka Logo"
            className={className}
            style={{ width: size, height: 'auto' }}
        />
    );
};
