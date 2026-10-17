"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Clock3, FileText, HeartPulse, MapPin, Printer, QrCode, ShieldCheck, UserRound } from "lucide-react";
import estilos from "./page.module.css";

type Utente = { nomeCompleto?: string; dataNascimento?: string; telefone?: string; bi?: string; provincia?: string; municipio?: string };
type Comprovativo = { referencia: string; sessaoEm: string; emitidoEm: string };

function referenciaNova() {
  const d = new Date();
  const data = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `PV-${data}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}
function dataHora(valor?: string) {
  if (!valor) return "A preparar…";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Não disponível" : new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(data);
}

export default function PaginaComprovativo() {
  const [utente, setUtente] = useState<Utente>({});
  const [comprovativo, setComprovativo] = useState<Comprovativo | null>(null);
  const [qr, setQr] = useState("");
  const [estadoQr, setEstadoQr] = useState("A preparar o código QR…");
  const [dadosDemonstracao, setDadosDemonstracao] = useState(false);

  useEffect(() => {
    const agora = new Date().toISOString();
    try {
      const dados = sessionStorage.getItem("pontoVerde.identificacao");
      if (dados) {
        setUtente(JSON.parse(dados) as Utente);
      } else {
        // Dados fictícios apenas para demonstrar o aspeto da última etapa.
        setUtente({
          nomeCompleto: "Maria da Silva (exemplo)",
          dataNascimento: "1998-04-16",
          telefone: "+244 923 000 000",
          bi: "000000000LA000 (exemplo)",
          provincia: "Luanda",
          municipio: "Talatona",
        });
        setDadosDemonstracao(true);
      }
      const existente = sessionStorage.getItem("pontoVerde.comprovativo");
      if (existente) setComprovativo(JSON.parse(existente) as Comprovativo);
      else {
        const novo = { referencia: referenciaNova(), sessaoEm: agora, emitidoEm: agora };
        sessionStorage.setItem("pontoVerde.comprovativo", JSON.stringify(novo));
        setComprovativo(novo);
      }
    } catch {
      setComprovativo({ referencia: referenciaNova(), sessaoEm: agora, emitidoEm: agora });
    }
  }, []);

  useEffect(() => {
    if (!comprovativo) return;
    let cancelado = false;
    const conteudo = JSON.stringify({ sistema: "Ponto Verde", referencia: comprovativo.referencia, emitidoEm: comprovativo.emitidoEm, finalidade: "Apresentar referência à equipa de atendimento" });
    QRCode.toDataURL(conteudo, { width: 220, margin: 2, errorCorrectionLevel: "M", color: { dark: "#073b66", light: "#ffffff" } })
      .then((url) => { if (!cancelado) { setQr(url); setEstadoQr("QR pronto para apresentar ou imprimir."); } })
      .catch(() => { if (!cancelado) setEstadoQr("QR indisponível neste dispositivo. Apresente o número de referência."); });
    return () => { cancelado = true; };
  }, [comprovativo]);

  const local = [utente.municipio, utente.provincia].filter(Boolean).join(", ") || "A confirmar pela unidade de atendimento";

  return <main className={estilos.pagina}>
    <header className={estilos.cabecalho}>
      <a className={estilos.marca} href="/quiosque/pre-consulta" aria-label="Ponto Verde"><span className={estilos.logo}><HeartPulse size={25}/></span><span><strong>Ponto <i>Verde</i></strong><small>SAÚDE MAIS PRÓXIMA</small></span></a>
      <span className={estilos.estado}><CheckCircle2 size={17}/> Pré-consulta concluída</span>
    </header>
    <section className={estilos.conteudo}>
      <div className={estilos.introducao}><span className={estilos.etiqueta}>ÚLTIMA ETAPA · 04 / 04</span><h1>Rever informações e comprovativo</h1><p>Confirme os dados apresentados e, se estiverem corretos, imprima o comprovativo de atendimento.</p></div>
      {dadosDemonstracao && <div className={estilos.avisoDemonstracao} role="note"><strong>Exemplo de demonstração:</strong> os dados do paciente apresentados nesta página são fictícios. Quando a pré-consulta estiver preenchida, serão mostrados os dados dessa sessão.</div>}
      <div className={estilos.sucesso}><span className={estilos.iconeSucesso}><CheckCircle2 size={27}/></span><div><h2>Comprovativo preparado</h2><p>Guarde o número de referência para facilitar a confirmação do atendimento.</p></div></div>

      <section className={estilos.cartao}>
        <div className={estilos.cabecalhoCartao}><h2><UserRound size={20}/> Dados do paciente</h2><span className={estilos.etiquetaSecao}>IDENTIFICAÇÃO</span></div>
        <div className={estilos.grelhaDados}>
          <div className={estilos.dadoPrincipal}><span>Nome completo</span><strong>{utente.nomeCompleto || "Nome não disponível nesta sessão"}</strong></div>
          <div className={estilos.dado}><span>Identificação do paciente (BI)</span><strong>{utente.bi || "Não indicado"}</strong></div>
          <div className={estilos.dado}><span>Data de nascimento</span><strong>{utente.dataNascimento || "Não indicada"}</strong></div>
          <div className={estilos.dado}><span>Telefone de contacto</span><strong>{utente.telefone || "Não indicado"}</strong></div>
          <div className={estilos.dado}><span>Localidade</span><strong>{local}</strong></div>
          <div className={estilos.dado}><span><Clock3 size={14}/> Data e hora da sessão</span><strong>{dataHora(comprovativo?.sessaoEm)}</strong></div>
        </div>
      </section>

      <section className={`${estilos.cartao} ${estilos.cartaoComprovativo}`}>
        <div className={estilos.cabecalhoCartao}><h2><FileText size={20}/> Comprovativo e encaminhamento</h2><span className={estilos.etiquetaAzul}>DOCUMENTO DE APOIO</span></div>
        <div className={estilos.referencia}><span>NÚMERO DE REFERÊNCIA DO ATENDIMENTO</span><strong>{comprovativo?.referencia || "A gerar…"}</strong><small>Apresente este código à receção ou ao profissional responsável.</small></div>
        <div className={estilos.grelhaDados}><div className={estilos.dado}><span><Clock3 size={14}/> Data e hora de emissão</span><strong>{dataHora(comprovativo?.emitidoEm)}</strong></div><div className={estilos.dado}><span><MapPin size={14}/> Local de atendimento</span><strong>{local}</strong></div></div>
        <div className={estilos.encaminhamento}><h3><ShieldCheck size={18}/> Informação essencial sobre o encaminhamento</h3><p>Dirija-se à receção da unidade de saúde para confirmar o atendimento e apresentar este comprovativo. A equipa de saúde fará a avaliação adequada e indicará os próximos passos.</p><p className={estilos.notaClinica}>Este comprovativo não é um diagnóstico, não garante uma marcação e não substitui a avaliação de um profissional de saúde. O encaminhamento definitivo deve ser confirmado pela unidade de atendimento.</p></div>
        <div className={estilos.areaQr}><div><h3><QrCode size={19}/> Código QR de referência</h3><p>Se houver equipamento de leitura disponível, apresente o QR para facilitar a consulta da referência. O QR contém apenas a referência e os dados básicos de emissão, não os dados pessoais do paciente.</p><span className={estilos.estadoQr}>{estadoQr}</span></div><div className={estilos.quadroQr}>{qr ? <img src={qr} alt={`Código QR da referência ${comprovativo?.referencia || ""}`}/> : <div className={estilos.qrPendente}><QrCode size={38}/><span>QR a preparar</span></div>}<strong>{comprovativo?.referencia || "Referência"}</strong></div></div>
      </section>
      <div className={estilos.acoes}><p><ShieldCheck size={17}/> Guarde a referência para facilitar o atendimento.</p><button type="button" onClick={() => window.print()} className={estilos.botaoImprimir}><Printer size={18}/> Imprimir comprovativo</button></div>
      <p className={estilos.notaFinal}>Ponto Verde · Protótipo local. A referência é gerada neste dispositivo e ainda não está ligada a um sistema clínico oficial.</p>
    </section>
    <footer className={estilos.rodape}><strong>Ponto Verde</strong><span>Documento de apoio ao atendimento</span></footer>
  </main>;
}
