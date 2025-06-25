import React from 'react';

const MediCoreLogo = ({ size = 48 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <rect x="0" y="0" width="120" height="48" rx="16" fill="#fff" />
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="Inter, Arial, sans-serif"
      fontWeight="bold"
      fontSize="24"
      fill="#222"
    >
      MediCore
    </text>
    <rect x="20" y="40" width="80" height="4" rx="2" fill="#2563eb" />
  </svg>
);

export default MediCoreLogo; 