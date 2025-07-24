"use client"

import { useEffect } from 'react'

interface PastelBackgroundProviderProps {
  children: React.ReactNode
}

export function PastelBackgroundProvider({ children }: PastelBackgroundProviderProps) {
  useEffect(() => {
    const pastelPool = ['#E3F2FD','#F0FFF0','#F5F3FF','#FFF1E6','#F5FFFA','#FFF5F7','#FAFAFA','#FFF5EE','#F0F8FF','#FDEFF2','#FDFDFC'];
    const randomPastel = pastelPool[Math.floor(Math.random() * pastelPool.length)];
    
    // Apply the random pastel background
    document.body.style.backgroundColor = randomPastel;
    
    // Cleanup function to reset background when component unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return <>{children}</>;
} 