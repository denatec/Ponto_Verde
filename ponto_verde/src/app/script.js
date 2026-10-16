const IMAGENS = {
  fechada: "Fechada.png",
  leve: "levemente aberta.png",
  media: "Aberta.png",
  bocaO: "Fazendo O.png"
};

const TEXTO_DA_ASSISTENTE = "Olá! Sou a assistente virtual do Ponto Verde. Posso ajudar-te com informações e orientações de saúde. Como posso ajudar?";

const avatar = document.getElementById("avatar");
const botaoFalar = document.getElementById("falar");
const botaoParar = document.getElementById("parar");
const estado = document.getElementById("estado");

const sequenciaBoca = [
  IMAGENS.leve, IMAGENS.media, IMAGENS.leve, IMAGENS.bocaO,
  IMAGENS.media, IMAGENS.leve, IMAGENS.fechada, IMAGENS.leve,
  IMAGENS.media, IMAGENS.bocaO
];

let intervaloBoca = null;
let aFalar = false;

function mostrarBocaFechada() {
  avatar.src = IMAGENS.fechada;
}

function pararAnimacao() {
  if (intervaloBoca !== null) {
    clearInterval(intervaloBoca);
    intervaloBoca = null;
  }
  aFalar = false;
  mostrarBocaFechada();
  botaoFalar.disabled = false;
  botaoParar.disabled = true;
  estado.textContent = "A assistente está em repouso.";
}

function iniciarAnimacao() {
  let indice = 0;
  avatar.src = sequenciaBoca[0];
  intervaloBoca = setInterval(() => {
    if (!aFalar) return;
    avatar.src = sequenciaBoca[indice % sequenciaBoca.length];
    indice++;
  }, 160);
}

function falar() {
  if (!("speechSynthesis" in window)) {
    estado.textContent = "Este navegador não suporta síntese de voz. Experimenta Chrome ou Edge atualizados.";
    return;
  }

  window.speechSynthesis.cancel();
  if (intervaloBoca !== null) clearInterval(intervaloBoca);

  const fala = new SpeechSynthesisUtterance(TEXTO_DA_ASSISTENTE);
  fala.lang = "pt-PT";
  fala.rate = 1;

  const vozes = window.speechSynthesis.getVoices();
  const vozPortuguesa = vozes.find(voz => /^pt([-_]|$)/i.test(voz.lang));
  if (vozPortuguesa) fala.voice = vozPortuguesa;

  aFalar = true;
  botaoFalar.disabled = true;
  botaoParar.disabled = false;
  estado.textContent = "A assistente está a falar…";
  iniciarAnimacao();

  fala.onend = pararAnimacao;
  fala.onerror = pararAnimacao;
  window.speechSynthesis.speak(fala);
}

botaoFalar.addEventListener("click", falar);
botaoParar.addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  pararAnimacao();
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
