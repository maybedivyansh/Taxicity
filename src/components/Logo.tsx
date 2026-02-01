import React from 'react';

interface Props {
    className?: string;
    size?: number;
}

export const Logo: React.FC<Props> = ({ className = "", size = 32 }) => {
    return (
        <img
            src="/logo.png"
            alt="Taxicity Logo"
            className={`${className} object-contain`}
            style={{ width: size, height: size }}
        />
    );
};
