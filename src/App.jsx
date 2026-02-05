import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import confetti from "canvas-confetti";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
    const container = useRef();
    const [count, setCount] = useState(0);
    const [cakeDone, setCakeDone] = useState(false);
    
    // Constants
    const totalSlices = 9;
    const clicksPerSlice = 5;
    const maxClicks = totalSlices * clicksPerSlice;
    const slicesEaten = Math.floor(count / clicksPerSlice);
    const currentAge = slicesEaten * 5;

    const allTexts = {
        1: "I know I am a bit late...",
        2: "But I had a quiz, so dont blame me!! (please 🥲)",
        3: "Well now that I am at it, i have a few things to sayy..",
        4: "Thanks for being there with me mumma, whatever trivial things I attribute as my achievements is all thanks to you!!",
        5: "I love you a wholeee tonnnnn!!!!!",
        6: "Now setting aside all the sappy talks, let's get to the main event shall we?",
        7: "I could not eat ur birthday cake this time around, but who says we can't share one?",
        8: "Yummy, wasn't it?? 😋",
        9: "wrapping it upp..",
        10: "HAPPY BIRTHDAY MUMMAAA!!! 🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉",
    };

    // 1. Smooth Scroll (Lenis) Initialization
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.5,
            lerp: 0.07, // Balanced resistance
            smoothWheel: true,
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    // 2. GSAP Scroll Animations Logic
    useGSAP(() => {
        // Delay ensures React has finished mounting the cakeDone sections
        const timer = setTimeout(() => {
            const textElements = gsap.utils.toArray(".birthday-text");
            
            textElements.forEach((text, i) => {
                gsap.fromTo(text, 
                    { 
                        opacity: 0, 
                        x: i % 2 === 0 ? -60 : 60, // Fly in from sides
                        y: 50, 
                        filter: "blur(15px)", 
                        scale: 0.9 
                    }, 
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        filter: "blur(0px)",
                        scale: 1,
                        scrollTrigger: {
                            trigger: text,
                            start: "top 90%",
                            end: "top 45%",
                            scrub: 2, // Smooth follow
                        }
                    }
                );
            });
            ScrollTrigger.refresh();
        }, 100);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, { scope: container, dependencies: [cakeDone] });

    // 3. Interaction Handlers
    const handleCakeClick = () => {
        if (count < maxClicks) {
            setCount(prev => prev + 1);
            
            // Check if slice is finished
            if ((count + 1) % clicksPerSlice === 0) {
                const sliceIdx = Math.floor(count / clicksPerSlice);
                const isMumma = sliceIdx % 2 === 0;

                gsap.to(`.cake-slice-${sliceIdx}`, {
                    scale: 0,
                    opacity: 0,
                    rotation: isMumma ? -30 : 30,
                    duration: 0.5,
                    ease: "power2.in"
                });

                confetti({
                    particleCount: 25,
                    spread: 50,
                    origin: { y: 0.7 },
                    colors: isMumma ? ['#fbbf24', '#ffffff'] : ['#f59e0b', '#4a154b']
                });
            } else {
                gsap.fromTo(".cake-container", { scale: 1 }, { scale: 1.03, duration: 0.1, yoyo: true, repeat: 1 });
            }
        }
    };

    const handleCenterClick = (e) => {
        e.stopPropagation(); 
        if (currentAge === 45) {
            if (!cakeDone) setCakeDone(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#f59e0b', '#ff69b4']
            });
        }
    };

    const getSliceMessage = () => {
        if (currentAge === 45) return "HAPPY BIRTHDAY! TAP THE 45!";
        const currentSlice = Math.floor(count / clicksPerSlice);
        return currentSlice % 2 === 0 ? "Share with Mumma! 🍰" : "Ishu's turn! 🧁";
    };

    return (
        <div ref={container} className="flex flex-col overflow-x-hidden min-h-screen items-center bg-[#fffcf5] text-amber-950 font-serif">
            
            {/* 1. Hero */}
            <section className="h-dvh flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Hi Mumma!</h1>
                <p className="opacity-60 italic text-lg animate-pulse">Please scroll down slowly...</p>
            </section>

            {/* 2. Intro Texts (1-7) */}
            {Object.entries(allTexts).slice(0, 7).map(([key, value]) => (
                <section key={key} className="h-dvh flex items-center justify-center px-6 max-w-4xl">
                    <p className="birthday-text text-2xl md:text-5xl text-center leading-relaxed font-medium">
                        {value}
                    </p>
                </section>
            ))}

            {/* 3. Interactive Cake Section */}
            <section className="min-h-dvh w-full flex flex-col items-center justify-center py-20 bg-amber-100/30">
                <div 
                    onClick={handleCakeClick}
                    className="cake-container cursor-pointer select-none mb-10 relative w-[320px] h-80 md:w-125 md:h-125"
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                        {/* Cake Base */}
                        <circle cx="100" cy="100" r="85" fill="#fffbeb" stroke="#d97706" strokeWidth="2"/>
                        
                        {/* 9 Slices */}
                        {[...Array(totalSlices)].map((_, i) => {
                            const angle = (360 / totalSlices) * i;
                            const nextAngle = (360 / totalSlices) * (i + 1);
                            const startRad = (angle - 90) * (Math.PI / 180);
                            const endRad = (nextAngle - 90) * (Math.PI / 180);
                            const x1 = 100 + 80 * Math.cos(startRad);
                            const y1 = 100 + 80 * Math.sin(startRad);
                            const x2 = 100 + 80 * Math.cos(endRad);
                            const y2 = 100 + 80 * Math.sin(endRad);
                            const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2} Z`;
                            
                            return (
                                <path
                                    key={i}
                                    className={`cake-slice-${i} transition-opacity duration-300`}
                                    d={pathData}
                                    fill={i % 2 === 0 ? "#fde68a" : "#fcd34d"}
                                    stroke="#d97706"
                                    strokeWidth="1"
                                    opacity={i < slicesEaten ? 0 : 1}
                                />
                            );
                        })}

                        {/* Interactive Center */}
                        <g onClick={handleCenterClick} className="cursor-pointer">
                            <circle cx="100" cy="100" r="25" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                            <text 
                                x="100" y="107" 
                                textAnchor="middle" 
                                className="fill-amber-900 font-bold text-[18px] pointer-events-none"
                            >
                                {currentAge}
                            </text>
                        </g>

                        {/* Candle */}
                        {currentAge < 45 && (
                            <g>
                                <rect x="97" y="30" width="6" height="25" fill="#ef4444" rx="2" />
                                <circle cx="100" cy="22" r="5" fill="#fbbf24">
                                    <animate attributeName="r" values="5;6;5" dur="0.6s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        )}
                    </svg>
                </div>

                <div className="text-center px-4">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-amber-900 mb-2">
                        {currentAge < 45 ? `Age Goal: 45` : "Tap the center!"}
                    </h2>
                    <p className="text-lg font-medium text-amber-700 h-8">
                        {getSliceMessage()}
                    </p>
                </div>
            </section>

            {/* 4. Final Texts */}
            {cakeDone && Object.entries(allTexts).slice(7).map(([key, value]) => (
                <section key={key} className="h-dvh flex items-center justify-center px-6 max-w-4xl">
                    <p className="birthday-text text-2xl md:text-5xl text-center leading-relaxed font-semibold">
                        {value}
                    </p>
                </section>
            ))}

            {cakeDone && (
                <footer className="h-[40dvh] flex flex-col items-center justify-center opacity-60">
                    <p className="text-xl">Happy Birthday again, Mumma! ❤️</p>
                    <p className="mt-4 text-sm">Made by ishu</p>
                </footer>
            )}
        </div>
    );
}