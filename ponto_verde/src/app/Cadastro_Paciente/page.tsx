"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  HeartPulse,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import AssistenteVirtual from "@/../components/avatar_componente";

type DadosIdentificacao = {
  nomeCompleto: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  telefoneAlternativo: string;
  email: string;
  bi: string;
  provincia: string;
  municipio: string;
  peso: string;
  tensaoArterial: string;
  temperatura: string;
};

// Municípios disponíveis por província.
const municipiosPorProvincia: Record<string, string[]> = {
  Bengo: [
    "Ambriz", "Bula Atumba", "Dande", "Dembos",
    "Nambuangongo", "Pango Aluquém",
  ],
  Benguela: [
    "Baía Farta", "Balombo", "Benguela", "Bocoio",
    "Caimbambo", "Catabola", "Catumbela", "Chongorói",
    "Cubal", "Ganda", "Lobito",
  ],
  Bié: [
    "Andulo", "Camacupa", "Catabola", "Chinguar",
    "Chitembo", "Cuemba", "Cunhinga", "Cuito", "Nharea",
  ],
  Cabinda: ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
  Cuando: [
    "Calai", "Cuangar", "Cuchi", "Dirico",
    "Mavinga", "Menongue", "Nancova", "Rivungo",
  ],
  "Cuanza Norte": [
    "Ambaca", "Banga", "Bolongongo", "Cambambe",
    "Cazengo", "Golungo Alto", "Gonguembo", "Lucala",
    "Quiculungo", "Samba Cajú",
  ],
  "Cuanza Sul": [
    "Amboim", "Cassongue", "Cela", "Conda", "Ebo",
    "Libolo", "Mussende", "Porto Amboim", "Quibala",
    "Quilenda", "Seles", "Sumbe", "Waku Kungo",
  ],
  Cubango: [
    "Calai", "Cuangar", "Dirico", "Mavinga",
    "Menongue", "Nancova", "Rivungo",
  ],
  Cunene: [
    "Cahama", "Cuanhama", "Curoca", "Cuvelai",
    "Namacunde", "Ombadja",
  ],
  Huambo: [
    "Bailundo", "Caála", "Catchiungo", "Ecunha",
    "Huambo", "Londuimbali", "Longonjo", "Mungo",
    "Tchicala-Tcholoanga", "Tchindjenje", "Ucuma",
  ],
  Huíla: [
    "Caconda", "Cacula", "Caluquembe", "Chibia",
    "Chicomba", "Chipindo", "Cuvango", "Humpata",
    "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo",
  ],
  "Icolo e Bengo": [
    "Bom Jesus", "Cabiri", "Cabolombo", "Catete", "Sequele",
  ],
  Luanda: [
    "Belas", "Cacuaco", "Cazenga", "Ingombota",
    "Kilamba Kiaxi", "Maianga", "Mulenvos", "Mussulo",
    "Rangel", "Samba", "Sambizanga", "Talatona", "Viana",
  ],
  "Lunda Norte": [
    "Cambulo", "Capenda-Camulemba", "Caungula", "Chitato",
    "Cuango", "Cuílo", "Lubalo", "Lucapa", "Xá-Muteba",
  ],
  "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  Malanje: [
    "Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala",
    "Caombo", "Cuaba Nzogo", "Cunda-Dia-Baze", "Luquembo",
    "Malanje", "Marimba", "Massango", "Mucari", "Quela",
    "Quirima",
  ],
  Moxico: [
    "Alto Zambeze", "Bundas", "Camanongue",
    "Léua", "Luacano", "Luau", "Moxico",
  ],
  "Moxico Leste": ["Cazombo", "Lóvua", "Luau", "Luacano"],
  Namibe: ["Bibala", "Camucuio", "Moçâmedes", "Tômbwa", "Virei"],
  Uíge: [
    "Alto Cauale", "Ambuíla", "Bembe", "Buengas", "Bungo",
    "Damba", "Macocola", "Milunga", "Mucaba", "Negage",
    "Puri", "Quimbele", "Quitexe", "Sanza Pombo",
    "Songo", "Uíge", "Zombo",
  ],
  Zaire: [
    "Cuimba", "M'banza Kongo", "Noqui",
    "N'zeto", "Soyo", "Tomboco",
  ],
};

const provincias = Object.keys(municipiosPorProvincia).sort((a, b) =>
  a.localeCompare(b, "pt"),
);

const dadosIniciais: DadosIdentificacao = {
  nomeCompleto: "",
  dataNascimento: "",
  sexo: "",
  telefone: "",
  telefoneAlternativo: "",
  email: "",
  bi: "",
  provincia: "",
  municipio: "",
  peso: "",
  tensaoArterial: "",
  temperatura: "",
};

const grupoClass = "flex min-w-0 flex-col gap-2";

const etiquetaClass =
  "text-base font-bold leading-6 text-slate-900 sm:text-lg";

const campoClass = [
  "min-h-14 w-full rounded-xl border-2 border-slate-400",
  "bg-white px-4 py-3 text-base font-medium text-slate-950",
  "placeholder:text-slate-500 placeholder:font-normal",
  "shadow-sm transition-colors",
  "hover:border-emerald-600",
  "focus:border-emerald-700 focus:outline-none",
  "focus:ring-4 focus:ring-emerald-500/25",
  "disabled:cursor-not-allowed disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");

export default function Cadastro_Paciente() {
  const router = useRouter();

  const [dados, setDados] = useState<DadosIdentificacao>(dadosIniciais);
  const [dataMaxima, setDataMaxima] = useState("");
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [confirmouDados, setConfirmouDados] = useState(false);
  const [erro, setErro] = useState("");
  const [aProcessar, setAProcessar] = useState(false);

  // Impede a seleção de uma data de nascimento futura.
  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    setDataMaxima(`${ano}-${mes}-${dia}`);
  }, []);

  function atualizarCampo(
    campo: keyof DadosIdentificacao,
    valor: string,
  ) {
    setDados((anterior) => {
      if (campo === "provincia") {
        return {
          ...anterior,
          provincia: valor,
          municipio: "",
        };
      }

      return {
        ...anterior,
        [campo]: valor,
      };
    });

    setErro("");
  }

  function submeterFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    if (
      !dados.nomeCompleto.trim() ||
      !dados.dataNascimento ||
      !dados.sexo ||
      !dados.telefone.trim() ||
      !dados.provincia ||
      !dados.municipio
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    const nascimento = new Date(`${dados.dataNascimento}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(nascimento.getTime()) ||
      nascimento > hoje
    ) {
      setErro("Introduza uma data de nascimento válida.");
      return;
    }

    if (
      !municipiosPorProvincia[dados.provincia]?.includes(
        dados.municipio,
      )
    ) {
      setErro(
        "Selecione um município pertencente à província escolhida.",
      );
      return;
    }

    if (!aceitouPrivacidade || !confirmouDados) {
      setErro(
        "Confirme a informação de privacidade e a veracidade dos dados.",
      );
      return;
    }

    if (
      dados.peso &&
      (!Number.isFinite(Number(dados.peso)) ||
        Number(dados.peso) < 1 ||
        Number(dados.peso) > 500)
    ) {
      setErro("Introduza um peso válido entre 1 e 500 kg.");
      return;
    }

    if (
      dados.temperatura &&
      (!Number.isFinite(Number(dados.temperatura)) ||
        Number(dados.temperatura) < 25 ||
        Number(dados.temperatura) > 45)
    ) {
      setErro("Introduza uma temperatura válida entre 25 °C e 45 °C.");
      return;
    }

    try {
      setAProcessar(true);

      sessionStorage.setItem(
        "pontoVerde.identificacao",
        JSON.stringify(dados),
      );

      router.push("/quiosque/sintomas");
    } catch {
      setErro(
        "Não foi possível preparar a próxima etapa. Tente novamente.",
      );
      setAProcessar(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <AssistenteVirtual
        mensagens={[
          "Vamos começar com a triagem!!",
          "Não se preocupe, todos os dados aqui fornecidos estarão seguros."
        ]}
        textoBotao="Começar"
        destinoBotao="/Cadastro_Paciente"
        compacto
        posicao="superior-esquerda"
      />

      {/* Cabeçalho */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <a
          className="flex items-center gap-3 text-inherit no-underline"
          href="/quiosque/pre-consulta"
          aria-label="Ponto Verde - voltar à pré-consulta"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <HeartPulse size={25} aria-hidden="true" />
          </span>

          <span className="flex flex-col">
            <strong className="text-xl font-bold tracking-tight">
              Ponto <span className="text-emerald-600">Verde</span>
            </strong>
            <small className="text-[10px] font-semibold tracking-[0.16em] text-slate-500">
              SAÚDE MAIS PRÓXIMA
            </small>
          </span>
        </a>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-sm font-medium text-emerald-800">
          <Accessibility size={18} aria-hidden="true" />
          <span>Acessibilidade</span>
        </div>
      </header>

     <section className="ml-4 mr-4 flex-1 pb-6 pt-6 sm:ml-6 sm:mr-8 sm:pt-10 lg:ml-8 lg:mr-12">
        {/* Introdução */}
        <div className="mb-7 text-center sm:mb-9">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-emerald-700">
            PRÉ-CONSULTA DIGITAL
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Identificação do utente
          </h1>
        </div>

        {/* Progresso */}
        <section
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          aria-label="Progresso da pré-consulta"
        >
          <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
            <span>
              ETAPA 01 <span className="text-slate-400">/ 04</span>
            </span>
            <strong>Identificação</strong>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={25}
            aria-label="25% concluído"
          >
            <span className="block h-full w-1/4 rounded-full bg-emerald-500" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4 sm:text-sm">
            <span className="font-bold text-emerald-700">
              01 Identificação
            </span>
            <span>02 Sintomas</span>
            <span>03 Acessibilidade</span>
            <span>04 Rever</span>
          </div>
        </section>

        {/* Formulário */}
        <form
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          onSubmit={submeterFormulario}
          noValidate
        >
          {/* Dados pessoais */}
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <UserRound
                  size={21}
                  className="text-emerald-600"
                  aria-hidden="true"
                />
                Dados pessoais
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Os campos assinalados com * são obrigatórios.
              </p>
            </div>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <UserRound size={23} aria-hidden="true" />
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <div className={`${grupoClass} sm:col-span-2`}>
              <label className={etiquetaClass} htmlFor="nomeCompleto">
                Nome completo <b className="text-rose-600">*</b>
              </label>
              <input
                className={campoClass}
                id="nomeCompleto"
                name="nomeCompleto"
                autoComplete="name"
                value={dados.nomeCompleto}
                onChange={(e) =>
                  atualizarCampo("nomeCompleto", e.target.value)
                }
                placeholder="Introduza o nome completo"
                required
              />
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="dataNascimento">
                Data de nascimento <b className="text-rose-600">*</b>
              </label>
              <input
                className={campoClass}
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                autoComplete="bday"
                max={dataMaxima || undefined}
                value={dados.dataNascimento}
                onChange={(e) =>
                  atualizarCampo("dataNascimento", e.target.value)
                }
                required
              />
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="sexo">
                Sexo <b className="text-rose-600">*</b>
              </label>
              <select
                className={campoClass}
                id="sexo"
                name="sexo"
                value={dados.sexo}
                onChange={(e) => atualizarCampo("sexo", e.target.value)}
                required
              >
                <option value="">Selecione uma opção</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="nao-informado">
                  Prefiro não informar
                </option>
              </select>
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="telefone">
                Telefone de contacto <b className="text-rose-600">*</b>
              </label>
              <input
                className={campoClass}
                id="telefone"
                name="telefone"
                type="tel"
                autoComplete="tel"
                placeholder="+244 9XX XXX XXX"
                value={dados.telefone}
                onChange={(e) =>
                  atualizarCampo("telefone", e.target.value)
                }
                required
              />
            </div>

            <div className={grupoClass}>
              <label
                className={etiquetaClass}
                htmlFor="telefoneAlternativo"
              >
                Telefone alternativo
              </label>
              <input
                className={campoClass}
                id="telefoneAlternativo"
                name="telefoneAlternativo"
                type="tel"
                autoComplete="tel"
                placeholder="+244 9XX XXX XXX"
                value={dados.telefoneAlternativo}
                onChange={(e) =>
                  atualizarCampo("telefoneAlternativo", e.target.value)
                }
              />
              <small className="text-xs leading-5 text-slate-500">
                Número adicional para contacto, se necessário.
              </small>
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="email">
                Correio eletrónico
              </label>
              <input
                className={campoClass}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="exemplo@email.com"
                value={dados.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
              />
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="bi">
                Bilhete de Identidade
              </label>
              <input
                className={campoClass}
                id="bi"
                name="bi"
                autoComplete="off"
                placeholder="Número do BI (opcional)"
                value={dados.bi}
                onChange={(e) => atualizarCampo("bi", e.target.value)}
              />
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="provincia">
                Província <b className="text-rose-600">*</b>
              </label>
              <select
                className={campoClass}
                id="provincia"
                name="provincia"
                value={dados.provincia}
                onChange={(e) =>
                  atualizarCampo("provincia", e.target.value)
                }
                required
              >
                <option value="">Selecione a província</option>
                {provincias.map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="municipio">
                Município <b className="text-rose-600">*</b>
              </label>
              <select
                className={campoClass}
                id="municipio"
                name="municipio"
                value={dados.municipio}
                onChange={(e) =>
                  atualizarCampo("municipio", e.target.value)
                }
                disabled={!dados.provincia}
                required
              >
                <option value="">
                  {dados.provincia
                    ? "Selecione o município"
                    : "Escolha primeiro a província"}
                </option>

                {(municipiosPorProvincia[dados.provincia] ?? []).map(
                  (municipio) => (
                    <option key={municipio} value={municipio}>
                      {municipio}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* Informação de saúde */}
          <div className="mb-6 mt-9 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <HeartPulse
                  size={21}
                  className="text-emerald-600"
                  aria-hidden="true"
                />
                Informação de saúde
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Estes dados são opcionais nesta etapa.
              </p>
            </div>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <HeartPulse size={23} aria-hidden="true" />
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="peso">
                Peso (kg)
              </label>
              <input
                className={campoClass}
                id="peso"
                name="peso"
                type="number"
                min="1"
                max="500"
                step="0.1"
                inputMode="decimal"
                placeholder="Ex.: 65"
                value={dados.peso}
                onChange={(e) => atualizarCampo("peso", e.target.value)}
              />
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="tensaoArterial">
                Tensão arterial
              </label>
              <input
                className={campoClass}
                id="tensaoArterial"
                name="tensaoArterial"
                placeholder="Ex.: 120/80"
                value={dados.tensaoArterial}
                onChange={(e) =>
                  atualizarCampo("tensaoArterial", e.target.value)
                }
              />
            </div>

            <div className={grupoClass}>
              <label className={etiquetaClass} htmlFor="temperatura">
                Temperatura (°C)
              </label>
              <input
                className={campoClass}
                id="temperatura"
                name="temperatura"
                type="number"
                min="25"
                max="45"
                step="0.1"
                inputMode="decimal"
                placeholder="Ex.: 36.5"
                value={dados.temperatura}
                onChange={(e) =>
                  atualizarCampo("temperatura", e.target.value)
                }
              />
            </div>
          </div>

          {/* Aviso de saúde */}
          <div className="my-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm leading-6">
              A informação de saúde é facultativa nesta etapa e não
              substitui a avaliação de um profissional de saúde.
            </p>
          </div>

          {/* Consentimentos */}
          <div className="my-6 space-y-4 rounded-2xl bg-slate-50 p-4 sm:p-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
              <input
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                type="checkbox"
                checked={aceitouPrivacidade}
                onChange={(e) =>
                  setAceitouPrivacidade(e.target.checked)
                }
                required
              />
              <span>
                Li a informação de privacidade e compreendo a finalidade
                da recolha dos meus dados.{" "}
                <b className="text-rose-600">*</b>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
              <input
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                type="checkbox"
                checked={confirmouDados}
                onChange={(e) => setConfirmouDados(e.target.checked)}
                required
              />
              <span>
                Confirmo que os dados introduzidos são verdadeiros.{" "}
                <b className="text-rose-600">*</b>
              </span>
            </label>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div
              className="my-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-700"
              role="alert"
              aria-live="assertive"
            >
              {erro}
            </div>
          )}

          {/* Ações */}
          <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-500">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              Preencha apenas os dados necessários para continuar.
            </p>

            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              type="submit"
              disabled={aProcessar}
            >
              {aProcessar ? "A preparar..." : "Continuar para sintomas"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-slate-500">
          O Ponto Verde não realiza diagnósticos automáticos. A
          informação recolhida destina-se a apoiar o processo de
          atendimento.
        </p>
      </section>

      {/* Rodapé */}
      <footer className="mt-auto flex flex-col items-center justify-center gap-1 border-t border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 sm:flex-row sm:gap-3">
        <strong className="text-emerald-700">Ponto Verde</strong>
        <span>Pré-consulta digital</span>
      </footer>
    </main>
  );
}
