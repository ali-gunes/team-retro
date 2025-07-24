"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // If switching to light mode, apply a new random pastel background
    if (newTheme === "light") {
      const pastelPool = ['#E3F2FD','#F0FFF0','#F5F3FF','#FFF1E6','#F5FFFA','#FFF5F7','#FAFAFA','#FFF5EE','#F0F8FF','#FDEFF2','#FDFDFC'];
      const randomPastel = pastelPool[Math.floor(Math.random() * pastelPool.length)];
      document.body.style.backgroundColor = randomPastel;
    } else {
      // Reset background for dark mode
      document.body.style.backgroundColor = '';
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 