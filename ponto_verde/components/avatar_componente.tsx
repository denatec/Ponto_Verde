"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

// =====================================================
// IMAGENS DO AVATAR
// =====================================================

const IMAGENS = {
  fechada: "/avatar/Fechada.png",
  leve: "/avatar/levemente%20aberta.png",
  media: "/avatar/Aberta.png",
  bocaO: "/avatar/Fazendo%20O.png",
};

const SEQUENCIA_BOCA = [
  IMAGENS.fechada,
  IMAGENS.leve,
  IMAGENS.media,
  IMAGENS.leve,
  IMAGENS.bocaO,
  IMAGENS.media,
  IMAGENS.fechada,
];

const MENSAGENS_PADRAO = [
  "Olá! Sou a assistente virtual do Ponto Verde.",
  "Posso ajudar-te com informações e orientações de saúde.",
  "Segue as instruções apresentadas no ecrã para continuares.",
  "Se precisares de ajuda, podes ouvir novamente as minhas orientações.",
  "Se for uma emergência, utiliza a opção SOS.",
];

type AssistenteVirtualProps = {
  mensagens?: string[];
  textoBotao?: string;
  destinoBotao?: string;
  mostrarBotao?: boolean;
  falarAutomaticamente?: boolean;
  className?: string;
  onContinuar?: () => void;
  velocidadeVoz?: number;
};

export default function AssistenteVirtual({
  mensagens = MENSAGENS_PADRAO,
  textoBotao = "Continuar",
  destinoBotao = "/Cadastro_Paciente",
  mostrarBotao: botaoInicial = false,
  falarAutomaticamente = true,
  className = "",
  velocidadeVoz = 0.85,
  onContinuar,
}: AssistenteVirtualProps) {
  const router = useRouter();

  const [texto, setTexto] = useState(mensagens[0] || "");
  const [indiceBoca, setIndiceBoca] = useState(0);
  const [aFalar, setAFalar] = useState(false);
  const [mostrarBotao, setMostrarBotao] = useState(botaoInicial);
  const [vozDisponivel, setVozDisponivel] = useState(false);

  const falaRef = useRef<SpeechSynthesisUtterance | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervaloBocaRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessaoRef = useRef(0);
  const mensagensRef = useRef(mensagens);
  const botaoInicialRef = useRef(botaoInicial);

  useEffect(() => {
    mensagensRef.current = mensagens;
  }, [mensagens]);

  useEffect(() => {
    botaoInicialRef.current = botaoInicial;
    setMostrarBotao(botaoInicial);
  }, [botaoInicial]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      setVozDisponivel(true);
    }
  }, []);

  // =====================================================
  // LIMPAR TEMPORIZADORES
  // =====================================================

  const limparTemporizadores = useCallback(() => {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }

    if (intervaloBocaRef.current) {
      clearInterval(intervaloBocaRef.current);
      intervaloBocaRef.current = null;
    }
  }, []);

  // =====================================================
  // PARAR VOZ
  // =====================================================

  const pararFala = useCallback(() => {
    sessaoRef.current += 1;
    limparTemporizadores();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    falaRef.current = null;
    setAFalar(false);
    setIndiceBoca(0);
  }, [limparTemporizadores]);

  // =====================================================
  // VOZ EM PORTUGUÊS
  // =====================================================

  const obterVozPortuguesa = useCallback(() => {
    if (!("speechSynthesis" in window)) return null;

    const vozes = window.speechSynthesis.getVoices();

    return (
      vozes.find((voz) => voz.lang.toLowerCase() === "pt-pt") ||
      vozes.find((voz) => voz.lang.toLowerCase().startsWith("pt")) ||
      null
    );
  }, []);

  // =====================================================
  // FALAR MENSAGENS
  // =====================================================

  const iniciarFala = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setTexto("O teu navegador não suporta a leitura por voz.");
      return;
    }

    const lista = mensagensRef.current.filter(
      (mensagem) => mensagem.trim().length > 0,
    );

    if (lista.length === 0) return;

    limparTemporizadores();
    window.speechSynthesis.cancel();

    const sessao = ++sessaoRef.current;
    let indice = 0;

    setAFalar(true);
    setMostrarBotao(botaoInicialRef.current);

    const falarSeguinte = () => {
      if (sessaoRef.current !== sessao) return;

      if (indice >= lista.length) {
        setAFalar(false);
        setIndiceBoca(0);
        setMostrarBotao(true);
        return;
      }

      const mensagem = lista[indice];

      setTexto(mensagem);

      if (indice >= 2) {
        setMostrarBotao(true);
      }

      const fala = new SpeechSynthesisUtterance(mensagem);

      fala.lang = "pt-PT";
      fala.rate = velocidadeVoz;
      fala.pitch = 1;
      fala.volume = 1;

      const voz = obterVozPortuguesa();

      if (voz) fala.voice = voz;

      falaRef.current = fala;

      let boca = 0;

      intervaloBocaRef.current = setInterval(() => {
        if (sessaoRef.current !== sessao) return;

        setIndiceBoca(boca % SEQUENCIA_BOCA.length);
        boca++;
      }, 160);

      fala.onend = () => {
        if (sessaoRef.current !== sessao) return;

        if (intervaloBocaRef.current) {
          clearInterval(intervaloBocaRef.current);
          intervaloBocaRef.current = null;
        }

        setIndiceBoca(0);
        indice++;

        temporizadorRef.current = setTimeout(falarSeguinte, 650);
      };

      fala.onerror = () => {
        if (sessaoRef.current !== sessao) return;

        limparTemporizadores();
        setAFalar(false);
        setIndiceBoca(0);
        setMostrarBotao(true);
      };

      window.speechSynthesis.speak(fala);
    };

    falarSeguinte();
  }, [limparTemporizadores, obterVozPortuguesa, velocidadeVoz]);

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  useEffect(() => {
    if (!falarAutomaticamente) {
      setTexto(mensagensRef.current[0] || "");
      return;
    }

    const timer = setTimeout(iniciarFala, 700);

    return () => {
      clearTimeout(timer);
      pararFala();
    };
  }, [falarAutomaticamente, iniciarFala, pararFala]);

  // =====================================================
  // CONTINUAR
  // =====================================================

  const continuar = () => {
    pararFala();

    if (onContinuar) {
      onContinuar();
      return;
    }

    if (destinoBotao) {
      router.push(destinoBotao);
    }
  };

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div
      className={[
        // Fixo no ecrã, mesmo quando a página desliza
        "fixed left-3 top-3 z-[100]",
        "flex w-[min(370px,calc(100vw-24px))]",
        "flex-col items-start",
        "sm:left-6 sm:top-5 sm:w-[390px]",
        className,
      ].join(" ")}
      role="region"
      aria-label="Assistente virtual do Ponto Verde"
    >
      {/* BALÃO DE FALA */}
      <div className="relative z-10 mb-1 w-full rounded-2xl border-2 border-green-200 bg-white px-5 py-4 shadow-xl">
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-green-700 sm:text-base">
          Assistente Ponto Verde
        </p>

        <p
          aria-live="polite"
          className="text-base font-medium leading-relaxed text-gray-800 sm:text-lg"
        >
          {texto || "Olá! Estou aqui para te ajudar."}
        </p>

        {/* Ponta do balão */}
        <div className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 border-b-2 border-r-2 border-green-200 bg-white" />
      </div>

      {/* AVATAR GRANDE, SEM CARTÃO À VOLTA */}
      <div className="relative ml-2 mt-1 flex h-64 w-52 items-end justify-center sm:h-80 sm:w-64">
        <img
          src={SEQUENCIA_BOCA[indiceBoca]}
          alt="Avatar da assistente virtual do Ponto Verde"
          className="h-full w-full object-contain object-bottom drop-shadow-md"
        />
      </div>

      {/* BOTÕES DISCRETOS */}
      <div className="ml-3 mt-1 flex flex-wrap items-center gap-2">
        {vozDisponivel && (
          <>
            <button
              type="button"
              onClick={pararFala}
              disabled={!aFalar}
              aria-label="Parar voz"
              title="Parar voz"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-white text-green-800 shadow-md hover:bg-green-50 disabled:opacity-40"
            >
              <VolumeX size={19} />
            </button>

            <button
              type="button"
              onClick={iniciarFala}
              aria-label="Ouvir novamente"
              title="Ouvir novamente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-white text-green-800 shadow-md hover:bg-green-50"
            >
              {aFalar ? <Volume2 size={19} /> : <RotateCcw size={19} />}
            </button>
          </>
        )}

        {mostrarBotao && (
          <button
            type="button"
            onClick={continuar}
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {textoBotao}
          </button>
        )}
      </div>
    </div>
  );
}
