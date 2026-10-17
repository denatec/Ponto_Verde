"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Clock3, FileText, HeartPulse, MapPin, Printer, QrCode, ShieldCheck, UserRound } from "lucide-react";
import estilos from "./page.module.css";

type Utente = {
  nomeCompleto?: string;
  dataNascimento?: string;
  telefone?: string;
  bi?: string;
  provincia?: string;
  municipio?: string;
};

type Comprovativo = { referencia: string; sessaoEm: string; emitidoEm: string };

// Dados fictícios para demonstrar a última etapa quando ainda não existe uma sessão preenchida.
const utenteExemplo: Utente = {
  nomeCompleto: "Maria Manuel (exemplo)",
  dataNascimento: "1998-04-16",
  telefone: "+244 923 000 000",
  bi: "000000000LA000 (exemplo)",
  provincia: "Luanda",
  municipio: "Talatona",
};

// Cria uma referência demonstrativa para o comprovativo local.
function criarReferencia() {
  const agora = new Date();
  const data = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, "0")}${String(agora.getDate()).padStart(2, "0")}`;
  return `PV-${data}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// Apresenta data e hora no formato habitual em português.
function formatarDataHora(valor?: string) {
  if (!valor) return "A preparar…";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Não disponível";
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(data);
}

// Formata a data de nascimento sem alterar o valor guardado.
function formatarData(valor?: string) {
  if (!valor) return "Não indicada";
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return valor;
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(data);
}

export default function PaginaComprovativo() {
  const [utente, setUtente] = useState<Utente>(utenteExemplo);
  const [comprovativo, setComprovativo] = useState<Comprovativo | null>(null);
  const [qr, setQr] = useState("");
  const [estadoQr, setEstadoQr] = useState("A preparar o código QR…");
  const [dadosDeExemplo, setDadosDeExemplo] = useState(true);

  // Recupera os dados existentes, mas mantém um exemplo visível se não houver dados de sessão.
  useEffect(() => {
    const agora = new Date().toISOString();
    try {
      const dadosGuardados = sessionStorage.getItem("pontoVerde.identificacao");
      if (dadosGuardados) {
        const dados = JSON.parse(dadosGuardados) as Utente;
        if (dados.nomeCompleto?.trim()) {
          setUtente(dados);
          setDadosDeExemplo(false);
        }
      }
      const comprovativoGuardado = sessionStorage.getItem("pontoVerde.comprovativo");
      if (comprovativoGuardado) {
        setComprovativo(JSON.parse(comprovativoGuardado) as Comprovativo);
      } else {
        const novo = { referencia: criarReferencia(), sessaoEm: agora, emitidoEm: agora };
        sessionStorage.setItem("pontoVerde.comprovativo", JSON.stringify(novo));
        setComprovativo(novo);
      }
    } catch {
      setComprovativo({ referencia: criarReferencia(), sessaoEm: agora, emitidoEm: agora });
    }
  }, []);

  // O QR inclui apenas a referência e dados de emissão, nunca dados pessoais.
  useEffect(() => {
    if (!comprovativo) return;
    let cancelado = false;
    const conteudoQr = JSON.stringify({
      sistema: "Ponto Verde",
      referencia: comprovativo.referencia,
      emitidoEm: comprovativo.emitidoEm,
      finalidade: "Apresentar referência à equipa de atendimento",
    });
    QRCode.toDataURL(conteudoQr, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#073b66", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelado) {
          setQr(url);
          setEstadoQr("QR pronto para apresentar ou imprimir.");
        }
      })
      .catch(() => {
        if (!cancelado) setEstadoQr("QR indisponível. Apresente o número de referência.");
      });
    return () => { cancelado = true; };
  }, [comprovativo]);

  const local = [utente.municipio, utente.provincia].filter(Boolean).join(", ") || "A confirmar pela unidade de atendimento";

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecalho}>
        <a className={estilos.marca} href="/quiosque/comprovativo" aria-label="Ponto Verde">
          <span className={estilos.logo}><HeartPulse size={25} /></span>
          <span><strong>Ponto <i>Verde</i></strong><small>SAÚDE MAIS PRÓXIMA</small></span>
        </a>
        <span className={estilos.estado}><CheckCircle2 size={17} /> Última etapa · Revisão</span>
      </header>

      <section className={estilos.conteudo}>
        <div className={estilos.introducao}>
          <span className={estilos.etiqueta}>ETAPA FINAL · 04 / 04</span>
          <h1>Revisão e comprovativo</h1>
          <p>Reveja as informações apresentadas e consulte o comprovativo de atendimento nesta mesma página. Não é necessário preencher outro formulário aqui.</p>
        </div>

        {dadosDeExemplo && (
          <div className={estilos.avisoDemonstracao} role="note">
            <strong>Modo de demonstração:</strong> os dados do paciente apresentados são fictícios. Quando existirem dados guardados na sessão, serão apresentados no lugar deste exemplo.
          </div>
        )}

        <div className={estilos.sucesso}>
          <span className={estilos.iconeSucesso}><CheckCircle2 size={27} /></span>
          <div><h2>Revisão pronta</h2><p>Confirme os dados e guarde a referência para facilitar o contacto com a equipa de atendimento.</p></div>
        </div>

        <section className={estilos.cartao}>
          <div className={estilos.cabecalhoCartao}>
            <h2><UserRound size={20} /> Rever informações do paciente</h2>
            <span className={estilos.etiquetaSecao}>DADOS DA SESSÃO</span>
          </div>
          <div className={estilos.grelhaDados}>
            <div className={estilos.dadoPrincipal}><span>Nome completo</span><strong>{utente.nomeCompleto || "Não disponível"}</strong></div>
            <div className={estilos.dado}><span>Identificação (BI)</span><strong>{utente.bi || "Não indicado"}</strong></div>
            <div className={estilos.dado}><span>Data de nascimento</span><strong>{formatarData(utente.dataNascimento)}</strong></div>
            <div className={estilos.dado}><span>Telefone de contacto</span><strong>{utente.telefone || "Não indicado"}</strong></div>
            <div className={estilos.dado}><span><MapPin size={14} /> Localidade</span><strong>{local}</strong></div>
            <div className={estilos.dado}><span><Clock3 size={14} /> Data e hora da sessão</span><strong>{formatarDataHora(comprovativo?.sessaoEm)}</strong></div>
          </div>
        </section>

        <section className={`${estilos.cartao} ${estilos.cartaoComprovativo}`}>
          <div className={estilos.cabecalhoCartao}>
            <h2><FileText size={20} /> Comprovativo do atendimento</h2>
            <span className={estilos.etiquetaAzul}>DOCUMENTO DE APOIO</span>
          </div>
          <div className={estilos.referencia}>
            <span>NÚMERO DE REFERÊNCIA</span>
            <strong>{comprovativo?.referencia || "A gerar…"}</strong>
            <small>Apresente esta referência à receção da unidade de saúde.</small>
          </div>
          <div className={estilos.grelhaDados}>
            <div className={estilos.dado}><span><Clock3 size={14} /> Data e hora de emissão</span><strong>{formatarDataHora(comprovativo?.emitidoEm)}</strong></div>
            <div className={estilos.dado}><span><MapPin size={14} /> Localidade indicada</span><strong>{local}</strong></div>
          </div>
          <div className={estilos.encaminhamento}>
            <h3><ShieldCheck size={18} /> Informação essencial sobre o encaminhamento</h3>
            <p>Dirija-se à receção da unidade de saúde para confirmar o atendimento e apresentar este comprovativo. A equipa de saúde fará a avaliação adequada e indicará os próximos passos.</p>
            <p className={estilos.notaClinica}>Este documento é demonstrativo, não constitui diagnóstico nem confirma uma marcação oficial. O encaminhamento deve ser confirmado pela unidade de atendimento.</p>
          </div>
          <div className={estilos.areaQr}>
            <div>
              <h3><QrCode size={19} /> Código QR de referência</h3>
              <p>O QR contém apenas a referência e a informação básica de emissão, sem nome, BI, telefone ou outros dados pessoais.</p>
              <span className={estilos.estadoQr}>{estadoQr}</span>
            </div>
            <div className={estilos.quadroQr}>
              {qr ? <img src={qr} alt={`Código QR da referência ${comprovativo?.referencia || ""}`} /> : <div className={estilos.qrPendente}><QrCode size={38} /><span>QR a preparar</span></div>}
              <strong>{comprovativo?.referencia || "Referência"}</strong>
            </div>
          </div>
        </section>

        <div className={estilos.acoes}>
          <p><ShieldCheck size={17} /> Pode imprimir em papel ou escolher guardar como PDF na janela de impressão.</p>
          <button type="button" onClick={() => window.print()} className={estilos.botaoImprimir}><Printer size={18} /> Imprimir comprovativo</button>
        </div>
        <p className={estilos.notaFinal}>Ponto Verde · Protótipo local. A referência é gerada neste dispositivo e ainda não está ligada a um sistema clínico oficial.</p>
      </section>

      <footer className={estilos.rodape}><strong>Ponto Verde</strong><span>Revisão e comprovativo de atendimento</span></footer>
    </main>
  );
}
