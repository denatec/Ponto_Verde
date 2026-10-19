
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function TelaEsperaImpactante() {
 const router = useRouter();
  const [fase, setFase] = useState<number>(1);

  useEffect(() => {
    let temporizadores: ReturnType<typeof setTimeout>[] = [];

    const iniciarAnimacao = () => {
      // Reinicia a animação na primeira fase
      setFase(1);

      // Avança pelas fases da animação
      temporizadores = [
        setTimeout(() => setFase(2), 1000),
        setTimeout(() => setFase(3), 2000),
        setTimeout(() => setFase(4), 3000),
        setTimeout(() => setFase(5), 4000),
        setTimeout(() => setFase(6), 5000),
      ];
    };

    // Executa a animação imediatamente
    iniciarAnimacao();

    // Repete a sequência a cada 3 minutos
    const intervalo = setInterval(() => {
      iniciarAnimacao();
    }, 180000);

    return () => {
      clearInterval(intervalo);
      temporizadores.forEach(clearTimeout);
    };
  }, []);

  const handleAoTocar = () => {
     router.push('/Assistente');
  };

  return (
    <div
      onClick={handleAoTocar}
      className="relative flex h-screen w-full cursor-pointer select-none items-center justify-center overflow-hidden bg-[#001715]"
      style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#002723] via-[#001715] to-[#000a09]" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {fase === 1 && (
            <motion.div
              key="ponto"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute h-4 w-4 rounded-full bg-[#00E600] shadow-[0_0_35px_#00E600,0_0_70px_#00E600]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(fase === 2 || fase === 3) && (
            <motion.div
              key="circulo"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: fase === 3 ? 1.4 : 0.8,
                opacity: fase === 3 ? 1 : 0.8,
              }}
              exit={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute h-[28rem] w-[28rem] rounded-full border-[5px] border-[#00E600] bg-emerald-950/20 shadow-[0_0_120px_#00E600,inset_0_0_60px_#00E600]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {fase === 4 && (
            <motion.div
              key="brilho"
              initial={{ scale: 0.5, opacity: 0.2 }}
              animate={{ scale: 2.2, opacity: [0.2, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute h-[600px] w-[600px] rounded-full bg-[#00E600] shadow-[0_0_200px_#00E600] blur-[100px]"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: fase >= 4 ? 0.85 : 0.2, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 overflow-hidden"
        >
          <div className="absolute -bottom-32 -left-32 h-[300px] w-[600px] rotate-12 rounded-full border-t-2 border-[#00E600]/40 blur-md" />
          <div className="absolute -bottom-32 -right-32 h-[300px] w-[600px] -rotate-12 rounded-full border-t-2 border-[#00E600]/40 blur-md" />
          <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-emerald-500/20 via-emerald-900/10 to-transparent blur-3xl" />
        </motion.div>
      </div>

      <AnimatePresence>
        {fase >= 5 && (
          <motion.div
            key="marca"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-10 flex flex-col items-center px-4 text-center"
          >
            <div className="relative inline-block">
              <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] md:text-8xl">
                ponto<span className="text-[#00E600]">verde</span>
              </h1>

              <div className="-mt-1 flex w-full justify-end pr-1 md:-mt-2">
                <p className="text-sm font-semibold italic tracking-wider text-[#00E600] drop-shadow-md md:text-lg">
                  saúde para todos
                </p>
              </div>
            </div>

            {fase === 6 && (
              <motion.div
                key="carregamento"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="mt-14 flex flex-col items-center gap-3"
              >
                <div className="flex gap-2.5">
                  <span className="h-3 w-3 animate-bounce rounded-full bg-[#00E600] shadow-[0_0_12px_#00E600] [animation-delay:-0.3s]" />
                  <span className="h-3 w-3 animate-bounce rounded-full bg-[#00E600] shadow-[0_0_12px_#00E600] [animation-delay:-0.15s]" />
                  <span className="h-3 w-3 animate-bounce rounded-full bg-[#00E600] shadow-[0_0_12px_#00E600]" />
                </div>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-emerald-100/70 md:text-sm">
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
