"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const IMAGENS = {
  fechada: "/avatar/Fechada.png",
  leve: "/avatar/levemente%20aberta.png",
  media: "/avatar/Aberta.png",
  bocaO: "/avatar/Fazendo%20O.png",
};

const PARTES_TEXTO = [
  "Olá! Sou a assistente virtual do Ponto Verde.",
  "Posso ajudar-te com informações e orientações de saúde.",
  "Para continuar, clica neste botão e iremos começar com a nossa triagem rápida.",
  "Mas se não conseguir ver, diga Triagem para passar a proxima fase.",
  "Se precisares de ajuda urgente, usa o botão SOS ou diz: SOS, para ativar um alarme e chamar a ajuda.",
];

const SEQUENCIA_BOCA = [
  IMAGENS.leve,
  IMAGENS.media,
  IMAGENS.leve,
  IMAGENS.bocaO,
  IMAGENS.media,
  IMAGENS.leve,
  IMAGENS.fechada,
  IMAGENS.leve,
  IMAGENS.media,
  IMAGENS.bocaO,
];

export default function AssistenteVirtual() {
  const [aFalar, setAFalar] = useState(false);
  const [estado, setEstado] = useState("A preparar a assistente...");
  const [texto, setTexto] = useState("");
  const [indiceBoca, setIndiceBoca] = useState(0);

  const montadoRef = useRef(false);
  const falaRef = useRef<SpeechSynthesisUtterance | null>(null);
  const temporizadorTextoRef = useRef<number | null>(null);

  const limparTextoProgressivo = useCallback(() => {
    if (temporizadorTextoRef.current !== null) {
      window.clearInterval(temporizadorTextoRef.current);
      temporizadorTextoRef.current = null;
    }
  }, []);

  const iniciarEscrita = useCallback(
    (mensagem: string, duracao: number) => {
      limparTextoProgressivo();
      setTexto("");

      let indice = 0;
      const intervalo = Math.max(
        25,
        Math.min(90, duracao / Math.max(mensagem.length, 1)),
      );

      temporizadorTextoRef.current = window.setInterval(() => {
        indice += 1;
        setTexto(mensagem.slice(0, indice));

        if (indice >= mensagem.length) {
          limparTextoProgressivo();
        }
      }, intervalo);
    },
    [limparTextoProgressivo],
  );

  const iniciarFala = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setEstado("Este navegador não suporta síntese de voz.");
      setTexto(PARTES_TEXTO.join("\n\n"));
      return;
    }

    window.speechSynthesis.cancel();
    limparTextoProgressivo();

    let parteAtual = 0;
    let textoAcumulado = "";

    const vozes = window.speechSynthesis.getVoices();

    const voz =
      vozes.find((v) => /^pt-PT$/i.test(v.lang)) ||
      vozes.find((v) => /^pt([-_])/i.test(v.lang));

    const falarParte = (indice: number) => {
      if (!montadoRef.current) return;

      if (indice >= PARTES_TEXTO.length) {
        setAFalar(false);
        setIndiceBoca(0);
        setEstado("Estou pronta para te ajudar.");
        falaRef.current = null;
        return;
      }

      parteAtual = indice;

      const mensagem = PARTES_TEXTO[indice];
      const fala = new SpeechSynthesisUtterance(mensagem);

      fala.lang = "pt-PT";
      fala.rate = 0.8;
      fala.pitch = 1;

      if (voz) fala.voice = voz;

      falaRef.current = fala;

      setAFalar(true);
      setIndiceBoca(0);
      setEstado(`A falar: parte ${indice + 1} de 3`);

      // Mostra a parte atual à medida que a voz avança.
      fala.onboundary = (evento) => {
        if (!montadoRef.current || parteAtual !== indice) return;

        if (typeof evento.charIndex !== "number") return;

        const inicio = evento.charIndex;
        const restante = mensagem.slice(inicio);
        const palavra = restante.match(/^\S+/)?.[0] ?? "";

        const fim = inicio + palavra.length;
        const textoParcial = mensagem.slice(0, fim);

        if (/\bbotão\b/i.test(textoParcial)) {
          setMostrarBotao(true);
        }

        setTexto([textoAcumulado, textoParcial].filter(Boolean).join("\n\n"));
      };

      fala.onend = () => {
        if (!montadoRef.current || parteAtual !== indice) return;

        if (indice >= 2) {
          setMostrarBotao(true);
        }
        // Mantém apenas o bloco que acabou de ser pronunciado.
        setTexto(mensagem);

        // Dá uma pequena pausa e substitui pelo próximo bloco.
        window.setTimeout(() => {
          if (!montadoRef.current || parteAtual !== indice) return;

          if (indice + 1 < PARTES_TEXTO.length) {
            setTexto("");
            falarParte(indice + 1);
          } else {
            setAFalar(false);
            setIndiceBoca(0);
            setEstado("Estou pronta para te ajudar.");
            falaRef.current = null;
          }
        }, 500);
      };

      fala.onerror = (evento) => {
        if (!montadoRef.current) return;

        if (evento.error !== "canceled" && evento.error !== "interrupted") {
          setAFalar(false);
          setEstado("Não foi possível reproduzir a voz.");
        }
      };

      window.speechSynthesis.speak(fala);
    };

    textoAcumulado = "";
    setTexto("");
    falarParte(0);
  }, [limparTextoProgressivo]);

  // Fala automaticamente ao entrar na página.
  useEffect(() => {
    montadoRef.current = true;

    const temporizador = window.setTimeout(() => {
      if (montadoRef.current) {
        iniciarFala();
      }
    }, 1000);

    return () => {
      montadoRef.current = false;
      window.clearTimeout(temporizador);
      limparTextoProgressivo();
      window.speechSynthesis?.cancel();
    };
  }, [iniciarFala, limparTextoProgressivo]);

  // Movimento da boca durante a fala.
  useEffect(() => {
    if (!aFalar) {
      setIndiceBoca(0);
      return;
    }

    const intervalo = window.setInterval(() => {
      setIndiceBoca((anterior) => (anterior + 1) % SEQUENCIA_BOCA.length);
    }, 160);

    return () => window.clearInterval(intervalo);
  }, [aFalar]);

  const imagemAtual = aFalar ? SEQUENCIA_BOCA[indiceBoca] : IMAGENS.fechada;
  const [mostrarBotao, setMostrarBotao] = useState(false);
  const router = useRouter();

  return (
    <main className="relative grid min-h-screen w-full place-items-center overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-green-100 px-4 py-8 font-sans text-[#012D2E]">
      {/* Fundo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#f0fff4_0%,_#ffffff_70%)]"
      />

      <section
        aria-label="Assistente virtual Ponto Verde"
        className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-5 rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-2xl shadow-emerald-900/10 sm:p-8"
      >
        {/* Balão acima do avatar */}
        <div
          className="relative w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm"
          aria-live="polite"
          aria-atomic="false"
        >
          <p className="mb-4 text-lg font-extrabold uppercase tracking-widest text-emerald-700 sm:text-xl lg:text-2xl">
            Ponto Verde diz:
          </p>

          <p className="min-h-[8rem] whitespace-pre-wrap text-center text-2xl font-medium leading-relaxed text-[#012D2E] sm:text-3xl lg:text-4xl">
            {texto}
            {aFalar && (
              <span
                aria-hidden="true"
                className="ml-2 inline-block h-8 w-1 animate-pulse bg-green-600 align-middle"
              />
            )}
          </p>

          {/* Ponta do balão voltada para o avatar */}
          <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-emerald-200 bg-emerald-50" />
        </div>

        {/* Avatar e botão lateral */}
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          {/* Avatar */}
          <div className="flex min-h-[400px] min-w-0 flex-1 items-center justify-center sm:min-h-[500px] lg:min-h-[650px]">
            <img
              src={imagemAtual}
              alt={
                aFalar
                  ? "Assistente virtual a falar"
                  : "Assistente virtual em repouso"
              }
              draggable={false}
              className="block max-h-[65vh] w-full max-w-[500px] select-none object-contain sm:max-w-[600px] lg:max-w-[700px]"
            />
          </div>

          {/* Botão verde: aparece quando a frase menciona "botão" */}
          {mostrarBotao && (
            <button
              type="button"
               onClick={() => router.push("/Cadastro_Paciente")}
              className="shrink-0 rounded-2xl bg-green-600 px-30 py-18 text-xl font-bold text-white shadow-lg transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 sm:self-center"
            >
              Triagem rápida
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
