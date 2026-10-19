
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// =====================================================
// TIPOS DO RECONHECIMENTO DE VOZ
// =====================================================

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

// =====================================================
// COMPONENTE SOS
// =====================================================

export default function SOS() {
  const [ativo, setAtivo] = useState(false);
  const [vozDisponivel, setVozDisponivel] = useState(true);

  const audioRef = useRef<AudioContext | null>(null);
  const osciladorRef = useRef<OscillatorNode | null>(null);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const reconhecimentoRef =
    useRef<SpeechRecognitionLike | null>(null);

  const reinicioRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const ativoRef = useRef(false);
  const montadoRef = useRef(false);
  const escutaIniciadaRef = useRef(false);

  // =====================================================
  // PARAR O ALARME
  // =====================================================

  const pararAlarme = useCallback(() => {
    ativoRef.current = false;
    setAtivo(false);

    if (intervaloRef.current !== null) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }

    if (osciladorRef.current) {
      try {
        osciladorRef.current.stop();
      } catch {
        // O oscilador pode já estar parado.
      }

      osciladorRef.current.disconnect();
      osciladorRef.current = null;
    }

    if (audioRef.current) {
      const contexto = audioRef.current;
      audioRef.current = null;

      void contexto.close().catch(() => {
        // O contexto pode já estar fechado.
      });
    }
  }, []);

  // =====================================================
  // INICIAR O ALARME
  // =====================================================

  const iniciarAlarme = useCallback(() => {
    if (ativoRef.current) return;

    // Ativar imediatamente para evitar ativações repetidas.
    ativoRef.current = true;
    setAtivo(true);

    // Interromper a escuta enquanto o alarme estiver ativo.
    if (reinicioRef.current !== null) {
      clearTimeout(reinicioRef.current);
      reinicioRef.current = null;
    }

    try {
      const AudioContextAPI =
        window.AudioContext;

      if (!AudioContextAPI) {
        throw new Error("AudioContext não suportado.");
      }

      const contexto = new AudioContextAPI();
      const oscilador = contexto.createOscillator();
      const volume = contexto.createGain();

      oscilador.type = "sawtooth";
      oscilador.frequency.value = 880;
      volume.gain.value = 0.12;

      oscilador.connect(volume);
      volume.connect(contexto.destination);

      audioRef.current = contexto;
      osciladorRef.current = oscilador;

      let agudo = false;

      oscilador.start();

      intervaloRef.current = setInterval(() => {
        if (contexto.state === "closed") return;

        agudo = !agudo;

        oscilador.frequency.setTargetAtTime(
          agudo ? 1050 : 680,
          contexto.currentTime,
          0.08
        );
      }, 450);
    } catch (erro) {
      console.error(
        "Não foi possível iniciar o alarme:",
        erro
      );
    }
  }, []);

  // =====================================================
  // BOTÃO SOS
  // =====================================================

  const abrirSOS = useCallback(() => {
    iniciarAlarme();
  }, [iniciarAlarme]);

  // =====================================================
  // RECONHECIMENTO DE VOZ
  // =====================================================

  useEffect(() => {
    montadoRef.current = true;

    const navegador = window as SpeechRecognitionWindow;

    const SpeechRecognitionAPI =
      navegador.SpeechRecognition ??
      navegador.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVozDisponivel(false);

      console.warn(
        "Este navegador não suporta reconhecimento de voz."
      );

      return () => {
        montadoRef.current = false;
      };
    }

    const reconhecimento = new SpeechRecognitionAPI();

    reconhecimento.lang = "pt-PT";
    reconhecimento.continuous = true;
    reconhecimento.interimResults = false;

    reconhecimentoRef.current = reconhecimento;

    // Iniciar a escuta de forma controlada.
    const iniciarEscuta = () => {
      if (!montadoRef.current) return;
      if (ativoRef.current) return;
      if (escutaIniciadaRef.current) return;

      try {
        escutaIniciadaRef.current = true;
        reconhecimento.start();
      } catch (erro) {
        escutaIniciadaRef.current = false;

        console.warn(
          "Não foi possível iniciar o reconhecimento de voz:",
          erro
        );
      }
    };

    reconhecimento.onresult = (evento) => {
      for (
        let i = 0;
        i < evento.results.length;
        i++
      ) {
        const resultado = evento.results[i];

        if (!resultado) continue;

        const texto = resultado[0]?.transcript ?? "";

        const frase = texto
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();

        // Reconhecer SOS isoladamente ou em frases
        // como "preciso de ajuda, SOS".
        if (/\bsos+\b/i.test(frase)) {
          iniciarAlarme();
          reconhecimento.stop();
          return;
        }
      }
    };

    reconhecimento.onend = () => {
      escutaIniciadaRef.current = false;

      if (!montadoRef.current || ativoRef.current) {
        return;
      }

      // Tentar retomar a escuta automaticamente.
      reinicioRef.current = setTimeout(() => {
        reinicioRef.current = null;
        iniciarEscuta();
      }, 1000);
    };

    reconhecimento.onerror = (evento) => {
      escutaIniciadaRef.current = false;

      console.warn(
        "Erro no reconhecimento de voz:",
        evento
      );

      // Erros de permissão ou microfone podem impedir
      // a escuta; o botão manual continua disponível.
    };

    iniciarEscuta();

    return () => {
      montadoRef.current = false;
      escutaIniciadaRef.current = false;

      reconhecimento.onresult = null;
      reconhecimento.onend = null;
      reconhecimento.onerror = null;

      try {
        reconhecimento.stop();
      } catch {
        // A escuta pode já estar parada.
      }

      reconhecimentoRef.current = null;

      if (reinicioRef.current !== null) {
        clearTimeout(reinicioRef.current);
        reinicioRef.current = null;
      }
    };
  }, [iniciarAlarme]);

  // =====================================================
  // CONTROLAR O RECONHECIMENTO ENQUANTO O ALARME TOCA
  // =====================================================

  useEffect(() => {
    const reconhecimento = reconhecimentoRef.current;

    if (ativo) {
      if (reinicioRef.current !== null) {
        clearTimeout(reinicioRef.current);
        reinicioRef.current = null;
      }

      return;
    }

    if (!reconhecimento || !montadoRef.current) {
      return;
    }

    if (escutaIniciadaRef.current) {
      return;
    }

    // O evento onend também tenta reiniciar a escuta.
    // Não iniciar aqui para evitar duas chamadas start().
  }, [ativo]);

  // =====================================================
  // LIMPEZA DO ALARME AO SAIR DA PÁGINA
  // =====================================================

  useEffect(() => {
    return () => {
      ativoRef.current = false;

      if (intervaloRef.current !== null) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }

      if (osciladorRef.current) {
        try {
          osciladorRef.current.stop();
        } catch {
          // Já parado.
        }

        osciladorRef.current.disconnect();
        osciladorRef.current = null;
      }

      if (audioRef.current) {
        const contexto = audioRef.current;
        audioRef.current = null;

        void contexto.close().catch(() => {});
      }

      if (reinicioRef.current !== null) {
        clearTimeout(reinicioRef.current);
        reinicioRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // TECLA ESCAPE
  // =====================================================

  useEffect(() => {
    if (!ativo) return;

    function aoPremirTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        pararAlarme();
      }
    }

    window.addEventListener("keydown", aoPremirTecla);

    return () => {
      window.removeEventListener(
        "keydown",
        aoPremirTecla
      );
    };
  }, [ativo, pararAlarme]);

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <>
      {/* Botão SOS flutuante */}

      <button
        type="button"
        onClick={abrirSOS}
        aria-label="Ativar alerta de emergência"
        className="fixed bottom-6 right-6 z-50 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.8)] transition hover:scale-110 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 sm:bottom-8 sm:right-8 sm:h-24 sm:w-24"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="relative z-10 h-8 w-8"
          aria-hidden="true"
        >
          <path d="M12 3 22 20H2L12 3Z" />
          <path d="M12 9v5m0 3h.01" />
        </svg>

        <span className="relative z-10 text-lg font-black tracking-wider">
          SOS
        </span>
      </button>

      {/* Ecrã de emergência */}

      {ativo && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="sos-titulo"
          className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center overflow-auto bg-red-600 px-5 py-10 text-center text-white animate-[sosFlash_1s_ease-in-out_infinite]"
        >
          <style>{`
            @keyframes sosFlash {
              0%, 100% { background-color: #dc0000; }
              50% { background-color: #ff2424; }
            }

            @keyframes sireneGirar {
              0%, 100% {
                transform: scale(1) rotate(-4deg);
                filter: drop-shadow(0 0 15px white);
              }
              50% {
                transform: scale(1.12) rotate(4deg);
                filter: drop-shadow(0 0 45px white);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .sos-sirene {
                animation: none !important;
              }
            }
          `}</style>

          <div className="flex w-full max-w-2xl flex-col items-center">
            {/* Sirene animada */}

            <div
              className="sos-sirene mb-8"
              style={{
                animation: "sireneGirar 0.5s ease-in-out infinite",
              }}
            >
              <svg
                viewBox="0 0 160 160"
                className="h-36 w-36 sm:h-52 sm:w-52"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M80 10v14M25 35l11 11M135 35l-11 11M12 85h18M130 85h18"
                  stroke="white"
                  strokeWidth="9"
                  strokeLinecap="round"
                />

                <path
                  d="M48 105V69a32 32 0 0 1 64 0v36l12 14H36l12-14Z"
                  fill="#fff"
                  stroke="#8b0000"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />

                <path
                  d="M25 119h110"
                  stroke="#8b0000"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                <path
                  d="M68 135h24"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1
              id="sos-titulo"
              className="text-5xl font-black uppercase tracking-widest sm:text-7xl"
            >
              ALERTA SOS
            </h1>

            <p className="mt-5 text-xl font-bold uppercase sm:text-3xl">
              Atenção! Emergência!
            </p>

            <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed sm:text-xl">
              Foi ativado um alerta de emergência.
              Passageiros, mantenham a calma e prestem
              atenção às instruções da equipa responsável.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-xl border-2 border-white/60 bg-black/15 px-5 py-3">
              <span className="h-4 w-4 animate-pulse rounded-full bg-white" />

              <span className="font-black uppercase tracking-wider">
                Alarme ativo
              </span>
            </div>

            <button
              type="button"
              onClick={pararAlarme}
              autoFocus
              className="mt-10 min-h-14 rounded-xl border-2 border-white bg-white px-10 py-4 text-lg font-black text-red-700 shadow-xl transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              PARAR ALARME
            </button>

            <p className="mt-5 text-sm text-white/90">
              Prima Escape no teclado para fechar o alerta.
            </p>
          </div>
        </div>
      )}

      {/* Aviso de compatibilidade */}

      {!vozDisponivel && (
        <span className="sr-only" role="status">
          Reconhecimento de voz indisponível. Utilize o botão SOS.
        </span>
      )}
    </>
  );
}
