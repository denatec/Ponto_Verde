'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelaEsperaImpactante() {
  const [fase, setFase] = useState<number>(1);

  useEffect(() => {
    const t1 = setTimeout(() => setFase(2), 1000); 
    const t2 = setTimeout(() => setFase(3), 2000); 
    const t3 = setTimeout(() => setFase(4), 3000); 
    const t4 = setTimeout(() => setFase(5), 4000); 
    const t5 = setTimeout(() => setFase(6), 5000); 

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleAoTocar = () => {
    alert("Bem-vindo ao Ponto Verde! A iniciar a experiência...");
  };

  return (
    <div 
      onClick={handleAoTocar}
      className="relative w-full h-screen bg-[#001715] flex items-center justify-center cursor-pointer overflow-hidden select-none"
      style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#002723] via-[#001715] to-[#000a09]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        
        {/* Fase 1: Ponto Inicial Central */}
        <AnimatePresence>
          {fase === 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-4 h-4 rounded-full bg-[#00E600] shadow-[0_0_35px_#00E600,0_0_70px_#00E600]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(fase === 2 || fase === 3) && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ 
                scale: fase === 3 ? 1.4 : 0.8, 
                opacity: fase === 3 ? 1 : 0.8 
              }}
              exit={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute w-[28rem] h-[28rem] rounded-full border-[5px] border-[#00E600] bg-emerald-950/20 shadow-[0_0_120px_#00E600,inset_0_0_60px_#00E600]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {fase === 4 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.2 }}
              animate={{ scale: 2.2, opacity: [0.2, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute w-[600px] h-[600px] rounded-full bg-[#00E600] blur-[100px] shadow-[0_0_200px_#00E600]"
            />
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: fase >= 4 ? 0.85 : 0.2, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none overflow-hidden"
        >
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[300px] rounded-full border-t-2 border-[#00E600]/40 blur-md transform rotate-12" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[300px] rounded-full border-t-2 border-[#00E600]/40 blur-md transform -rotate-12" />
          <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-emerald-500/20 via-emerald-900/10 to-transparent blur-3xl" />
        </motion.div>
      </div>

      <AnimatePresence>
        {fase >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-10 flex flex-col items-center text-center px-4"
          >
            <div className="inline-block relative">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
                ponto<span className="text-[#00E600]">verde</span>
              </h1>
              
              <div className="w-full flex justify-end -mt-1 md:-mt-2 pr-1">
                <p className="text-[#00E600] text-sm md:text-lg font-semibold italic tracking-wider drop-shadow-md">
                  saúde para todos
                </p>
              </div>
            </div>

            {fase === 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mt-14 flex flex-col items-center gap-3"
              >
                <div className="flex gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#00E600] animate-bounce [animation-delay:-0.3s] shadow-[0_0_12px_#00E600]" />
                  <span className="w-3 h-3 rounded-full bg-[#00E600] animate-bounce [animation-delay:-0.15s] shadow-[0_0_12px_#00E600]" />
                  <span className="w-3 h-3 rounded-full bg-[#00E600] animate-bounce shadow-[0_0_12px_#00E600]" />
                </div>

                <p className="text-emerald-100/70 text-xs md:text-sm tracking-[0.25em] font-medium uppercase mt-1">
                  A preparar a sua experiência...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}