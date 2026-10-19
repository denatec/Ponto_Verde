'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Sintoma {
  id: string;
  nome: string;
  icone: string;
}

const LISTA_SINTOMAS: Sintoma[] = [
  { id: 'febre', nome: 'Febre / Calafrios', icone: '🌡️' },
  { id: 'tosse', nome: 'Tosse Persistente', icone: '😮‍💨' },
  { id: 'dor-cabeca', nome: 'Dor de Cabeça', icone: '🧠' },
  { id: 'garganta', nome: 'Dor na Garganta', icone: '🗣️' },
  { id: 'falta-ar', nome: 'Dificuldade Respiratória', icone: '🫁' },
  { id: 'fadiga', nome: 'Cansaço Extremo', icone: '⚡' },
  { id: 'nauseas', nome: 'Náuseas / Enjoos', icone: '🤢' },
  { id: 'dor-peito', nome: 'Dor no Peito', icone: '🫀' },
  { id: 'tonturas', nome: 'Tonturas / Desmaio', icone: '💫' },
  { id: 'dor-muscular', nome: 'Dores Musculares', icone: '🦴' },
  { id: 'pressao-alta', nome: 'Pressão Alta', icone: '📈' },
  { id: 'pressao-baixa', nome: 'Pressão Baixa', icone: '📉' },
  { id: 'diarreia', nome: 'Problemas Intestinais', icone: '🌀' },
  { id: 'alergia', nome: 'Reação Alérgica', icone: '🤧' },
  { id: 'dor-costas', nome: 'Dor nas Costas', icone: '🧍' },
  { id: 'visao-turva', nome: 'Visão Turva', icone: '👁️' },
  { id: 'ouvidos', nome: 'Dor de Ouvidos', icone: '👂' },
  { id: 'ansiedade', nome: 'Ansiedade / Palpitações', icone: '💓' },
];

export default function Page() {
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [outrosSintomas, setOutrosSintomas] = useState<string>('');
  
  const [gravando, setGravando] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleSintoma = (id: string) => {
    setSintomasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setGravando(true);
    } catch (err) {
      alert("Não foi possível aceder ao microfone. Verifique as permissões do browser.");
      console.error(err);
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && gravando) {
      mediaRecorderRef.current.stop();
      setGravando(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const apagarGravacao = () => {
    setAudioUrl(null);
  };

  const handleContinuar = () => {
    if (sintomasSelecionados.length === 0 && !outrosSintomas.trim() && !audioUrl) {
      alert("Por favor, selecione sintomas, escreva ou grave um áudio com o que está a sentir.");
      return;
    }
    alert("Dados e áudio registados com sucesso! A avançar no atendimento...");
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-6 md:p-10 select-none overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,500;0,700;0,900;1,600&display=swap');
        
        .fonte-geral {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/40 pointer-events-none fixed" />

      <header className="fonte-geral relative z-10 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpeg" 
            alt="Ponto Verde" 
            className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm"
          />
          <span className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight">
            Saúde para todos
          </span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 px-4 py-2 rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs md:text-sm font-bold tracking-wide text-emerald-950">
            Triagem: Sintomas e Voz
          </span>
        </div>
      </header>

      <main className="fonte-geral relative z-10 my-4 max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-5">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2">
            O que estás a sentir neste momento?
          </h1>
          <p className="text-slate-600 text-xs md:text-sm font-medium">
            Selecione os sintomas abaixo, escreva ou grave uma mensagem de voz com os detalhes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 my-3">
          {LISTA_SINTOMAS.map((sintoma) => {
            const selecionado = sintomasSelecionados.includes(sintoma.id);
            return (
              <motion.button
                key={sintoma.id}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleSintoma(sintoma.id)}
                className={`p-3.5 md:p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer h-32 md:h-36 ${
                  selecionado
                    ? 'bg-emerald-600 border-2 border-emerald-700 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500'
                    : 'bg-white border-2 border-emerald-800/40 text-slate-900 hover:border-emerald-600 hover:bg-emerald-50/60 shadow-sm'
                }`}
              >
                <span className="text-3xl md:text-4xl">{sintoma.icone}</span>
                <span className="text-xs md:text-sm font-bold leading-tight">
                  {sintoma.nome}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white border-2 border-emerald-800/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Observações por escrito:
            </label>
            <input
              type="text"
              value={outrosSintomas}
              onChange={(e) => setOutrosSintomas(e.target.value)}
              placeholder="Descreva brevemente caso necessário..."
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 text-slate-900 px-4 py-2.5 rounded-xl outline-none text-sm placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="bg-white border-2 border-emerald-800/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between items-center text-center">
            <label className="block text-xs font-bold text-slate-800 mb-1 self-start">
              Ou grave o seu relato por voz:
            </label>

            <div className="flex items-center gap-3 w-full justify-center my-auto">
              {!gravando && !audioUrl && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={iniciarGravacao}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-full text-xs md:text-sm shadow-md transition-all"
                >
                  <span>🎤</span> Iniciar Gravação
                </motion.button>
              )}

              {gravando && (
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-red-600 tracking-wider">A GRAVAR VOZ...</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={pararGravacao}
                    className="bg-red-600 text-white font-bold px-4 py-2 rounded-full text-xs shadow-md"
                  >
                    Parar
                  </motion.button>
                </div>
              )}

              {audioUrl && (
                <div className="flex items-center gap-3 w-full justify-between bg-emerald-50 p-2 rounded-xl border-2 border-emerald-300">
                  <audio controls src={audioUrl} className="h-8 w-48 md:w-56" />
                  <button
                    onClick={apagarGravacao}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1"
                  >
                    Apagar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="fonte-geral relative z-10 flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 rounded-full border-2 border-slate-300 text-slate-800 font-bold text-xs md:text-sm hover:bg-slate-100 transition-all"
        >
          ← Voltar
        </button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinuar}
          className={`px-8 py-3 rounded-full font-bold text-xs md:text-sm tracking-wider uppercase transition-all shadow-md ${
            sintomasSelecionados.length > 0 || outrosSintomas.trim() || audioUrl
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
          }`}
        >
          Continuar atendimento... ({sintomasSelecionados.length}) →
        </motion.button>
      </footer>
    </div>
  );
}