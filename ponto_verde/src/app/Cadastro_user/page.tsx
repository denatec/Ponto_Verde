"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  HeartPulse,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import estilos from "./page.module.css";

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

// Lista de municípios organizada por província.
// Confirma a lista administrativa oficial que pretendes utilizar
// antes de colocar o formulário em produção.
const municipiosPorProvincia: Record<string, string[]> = {
  Bengo: [
    "Ambriz",
    "Bula Atumba",
    "Dande",
    "Dembos",
    "Nambuangongo",
    "Pango Aluquém",
  ],
  Benguela: [
    "Baía Farta",
    "Balombo",
    "Benguela",
    "Bocoio",
    "Caimbambo",
    "Catumbela",
    "Chongorói",
    "Cubal",
    "Ganda",
    "Lobito",
  ],
  Bié: [
    "Andulo",
    "Camacupa",
    "Catabola",
    "Chinguar",
    "Chitembo",
    "Cuemba",
    "Cunhinga",
    "Cuito",
    "Nharea",
  ],
  Cabinda: [
    "Belize",
    "Buco-Zau",
    "Cabinda",
    "Cacongo",
  ],
  Cuando: [
    "Calai",
    "Cuangar",
    "Cuchi",
    "Dirico",
    "Mavinga",
    "Menongue",
    "Nancova",
    "Rivungo",
  ],
  "Cuanza Norte": [
    "Ambaca",
    "Banga",
    "Bolongongo",
    "Cambambe",
    "Cazengo",
    "Golungo Alto",
    "Gonguembo",
    "Lucala",
    "Quiculungo",
    "Samba Cajú",
  ],
  "Cuanza Sul": [
    "Amboim",
    "Cassongue",
    "Cela",
    "Conda",
    "Ebo",
    "Libolo",
    "Mussende",
    "Porto Amboim",
    "Quibala",
    "Quilenda",
    "Seles",
    "Sumbe",
    "Waku Kungo",
  ],
  Cubango: [
    "Calai",
    "Cuangar",
    "Dirico",
    "Mavinga",
    "Menongue",
    "Nancova",
    "Rivungo",
  ],
  Cunene: [
    "Cahama",
    "Cuanhama",
    "Curoca",
    "Cuvelai",
    "Namacunde",
    "Ombadja",
  ],
  Huambo: [
    "Bailundo",
    "Caála",
    "Catchiungo",
    "Ecunha",
    "Huambo",
    "Londuimbali",
    "Longonjo",
    "Mungo",
    "Tchicala-Tcholoanga",
    "Tchindjenje",
    "Ucuma",
  ],
  Huíla: [
    "Caconda",
    "Cacula",
    "Caluquembe",
    "Chibia",
    "Chicomba",
    "Chipindo",
    "Cuvango",
    "Humpata",
    "Jamba",
    "Lubango",
    "Matala",
    "Quilengues",
    "Quipungo",
  ],
  "Icolo e Bengo": [
    "Bom Jesus",
    "Cabiri",
    "Cabolombo",
    "Catete",
    "Sequele",
  ],
  Luanda: [
    "Belas",
    "Cacuaco",
    "Cazenga",
    "Ingombota",
    "Kilamba Kiaxi",
    "Maianga",
    "Mulenvos",
    "Mussulo",
    "Rangel",
    "Samba",
    "Sambizanga",
    "Talatona",
    "Viana",
  ],
  "Lunda Norte": [
    "Cambulo",
    "Capenda-Camulemba",
    "Caungula",
    "Chitato",
    "Cuango",
    "Cuílo",
    "Lubalo",
    "Lucapa",
    "Xá-Muteba",
  ],
  "Lunda Sul": [
    "Cacolo",
    "Dala",
    "Muconda",
    "Saurimo",
  ],
  Malanje: [
    "Cacuso",
    "Calandula",
    "Cambundi-Catembo",
    "Cangandala",
    "Caombo",
    "Cuaba Nzogo",
    "Cunda-Dia-Baze",
    "Luquembo",
    "Malanje",
    "Marimba",
    "Massango",
    "Mucari",
    "Quela",
    "Quirima",
  ],
  Moxico: [
    "Alto Zambeze",
    "Bundas",
    "Camanongue",
    "Léua",
    "Luacano",
    "Luau",
    "Moxico",
  ],
  "Moxico Leste": [
    "Cazombo",
    "Lóvua",
    "Luau",
    "Luacano",
  ],
  Namibe: [
    "Bibala",
    "Camucuio",
    "Moçâmedes",
    "Tômbwa",
    "Virei",
  ],
  Uíge: [
    "Alto Cauale",
    "Ambuíla",
    "Bembe",
    "Buengas",
    "Bungo",
    "Damba",
    "Macocola",
    "Milunga",
    "Mucaba",
    "Negage",
    "Puri",
    "Quimbele",
    "Quitexe",
    "Sanza Pombo",
    "Songo",
    "Uíge",
    "Zombo",
  ],
  Zaire: [
    "Cuimba",
    "M'banza Kongo",
    "Noqui",
    "N'zeto",
    "Soyo",
    "Tomboco",
  ],
};

const provincias = Object.keys(municipiosPorProvincia).sort(
  (a, b) => a.localeCompare(b, "pt"),
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

export default function PaginaIdentificacao() {
  const router = useRouter();

  const [dados, setDados] = useState<DadosIdentificacao>(dadosIniciais);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [confirmouDados, setConfirmouDados] = useState(false);
  const [erro, setErro] = useState("");
  const [aProcessar, setAProcessar] = useState(false);

  function atualizarCampo(
    campo: keyof DadosIdentificacao,
    valor: string,
  ) {
    setDados((anterior) => {
      // Quando a província muda, limpar o município anterior.
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

    if (
      Number.isNaN(nascimento.getTime()) ||
      nascimento > new Date()
    ) {
      setErro("Introduza uma data de nascimento válida.");
      return;
    }

    if (
      !municipiosPorProvincia[dados.provincia]?.includes(dados.municipio)
    ) {
      setErro("Selecione um município pertencente à província escolhida.");
      return;
    }

    if (!aceitouPrivacidade || !confirmouDados) {
      setErro(
        "Confirme a informação de privacidade e a veracidade dos dados.",
      );
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
    <main className={estilos.pagina}>
      <header className={estilos.cabecalho}>
        <a
          className={estilos.marca}
          href="/quiosque/pre-consulta"
          aria-label="Ponto Verde"
        >
          <span className={estilos.logo}>
            <HeartPulse size={25} />
          </span>

          <span>
            <strong>
              Ponto <span>Verde</span>
            </strong>
            <small>SAÚDE MAIS PRÓXIMA</small>
          </span>
        </a>

        <div className={estilos.acessibilidade}>
          <Accessibility size={18} />
          <span>Acessibilidade</span>
        </div>
      </header>

      <section className={estilos.conteudo}>
        <div className={estilos.introducao}>
          <span className={estilos.etiqueta}>
            PRÉ-CONSULTA DIGITAL
          </span>

          <h1>Identificação do utente</h1>

          <p>
            Comece por preencher os seus dados. Esta é a primeira etapa
            do processo de pré-consulta do Ponto Verde.
          </p>
        </div>

        <section
          className={estilos.progresso}
          aria-label="Progresso da pré-consulta"
        >
          <div className={estilos.progressoCabecalho}>
            <span>
              ETAPA 01 <span className={estilos.separadorTexto}>/ 04</span>
            </span>
            <strong>Identificação</strong>
          </div>

          <div className={estilos.trilho}>
            <span />
          </div>

          <div className={estilos.etapas}>
            <span className={estilos.etapaAtiva}>01 Identificação</span>
            <span>02 Sintomas</span>
            <span>03 Acessibilidade</span>
            <span>04 Rever</span>
          </div>
        </section>

        <form
          className={estilos.formulario}
          onSubmit={submeterFormulario}
          noValidate
        >
          <div className={estilos.tituloFormulario}>
            <div>
              <h2>
                <UserRound size={21} /> Dados pessoais
              </h2>
              <p>Os campos assinalados com * são obrigatórios.</p>
            </div>

            <span className={estilos.etiquetaIcone}>
              <UserRound size={23} />
            </span>
          </div>

          <div className={estilos.grelha}>
            <div className={`${estilos.campo} ${estilos.completo}`}>
              <label htmlFor="nomeCompleto">
                Nome completo <b>*</b>
              </label>
              <input
                id="nomeCompleto"
                autoComplete="name"
                value={dados.nomeCompleto}
                onChange={(e) =>
                  atualizarCampo("nomeCompleto", e.target.value)
                }
                placeholder="Introduza o nome completo"
                required
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="dataNascimento">
                Data de nascimento <b>*</b>
              </label>
              <input
                id="dataNascimento"
                type="date"
                autoComplete="bday"
                max={new Date().toISOString().slice(0, 10)}
                value={dados.dataNascimento}
                onChange={(e) =>
                  atualizarCampo("dataNascimento", e.target.value)
                }
                required
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="sexo">
                Sexo <b>*</b>
              </label>
              <select
                id="sexo"
                value={dados.sexo}
                onChange={(e) => atualizarCampo("sexo", e.target.value)}
                required
              >
                <option value="">Selecione uma opção</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="nao-informado">Prefiro não informar</option>
              </select>
            </div>

            <div className={estilos.campo}>
              <label htmlFor="telefone">
                Telefone de contacto <b>*</b>
              </label>
              <input
                id="telefone"
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

            <div className={estilos.campo}>
              <label htmlFor="telefoneAlternativo">
                Telefone alternativo
              </label>
              <input
                id="telefoneAlternativo"
                type="tel"
                autoComplete="tel"
                placeholder="+244 9XX XXX XXX (opcional)"
                value={dados.telefoneAlternativo}
                onChange={(e) =>
                  atualizarCampo("telefoneAlternativo", e.target.value)
                }
              />
              <small>
                Número adicional para contacto, se necessário.
              </small>
            </div>

            <div className={estilos.campo}>
              <label htmlFor="email">Correio eletrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="exemplo@email.com"
                value={dados.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="bi">Bilhete de Identidade</label>
              <input
                id="bi"
                autoComplete="off"
                placeholder="Número do BI (opcional)"
                value={dados.bi}
                onChange={(e) => atualizarCampo("bi", e.target.value)}
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="provincia">
                Província <b>*</b>
              </label>
              <select
                id="provincia"
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

            <div className={estilos.campo}>
              <label htmlFor="municipio">
                Município <b>*</b>
              </label>
              <select
                id="municipio"
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

          <div className={estilos.linha} />

          <div className={estilos.tituloFormulario}>
            <div>
              <h2>
                <HeartPulse size={21} /> Informação de saúde
              </h2>
              <p>Estes dados são opcionais nesta etapa.</p>
            </div>

            <span className={`${estilos.etiquetaIcone} ${estilos.azul}`}>
              <HeartPulse size={23} />
            </span>
          </div>

          <div className={estilos.grelhaTres}>
            <div className={estilos.campo}>
              <label htmlFor="peso">Peso (kg)</label>
              <input
                id="peso"
                type="number"
                min="1"
                max="500"
                step="0.1"
                placeholder="Ex.: 65"
                value={dados.peso}
                onChange={(e) => atualizarCampo("peso", e.target.value)}
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="tensaoArterial">Tensão arterial</label>
              <input
                id="tensaoArterial"
                placeholder="Ex.: 120/80"
                value={dados.tensaoArterial}
                onChange={(e) =>
                  atualizarCampo("tensaoArterial", e.target.value)
                }
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="temperatura">Temperatura (°C)</label>
              <input
                id="temperatura"
                type="number"
                min="25"
                max="45"
                step="0.1"
                placeholder="Ex.: 36.5"
                value={dados.temperatura}
                onChange={(e) =>
                  atualizarCampo("temperatura", e.target.value)
                }
              />
            </div>
          </div>

          <div className={estilos.aviso}>
            <ShieldCheck size={21} />
            <p>
              A informação de saúde é facultativa nesta etapa e não
              substitui a avaliação de um profissional de saúde.
            </p>
          </div>

          <div className={estilos.privacidade}>
            <label className={estilos.confirmacao}>
              <input
                type="checkbox"
                checked={aceitouPrivacidade}
                onChange={(e) =>
                  setAceitouPrivacidade(e.target.checked)
                }
              />
              <span>
                Li a informação de privacidade e compreendo a finalidade
                da recolha dos meus dados. <b>*</b>
              </span>
            </label>

            <label className={estilos.confirmacao}>
              <input
                type="checkbox"
                checked={confirmouDados}
                onChange={(e) => setConfirmouDados(e.target.checked)}
              />
              <span>
                Confirmo que os dados introduzidos são verdadeiros. <b>*</b>
              </span>
            </label>
          </div>

          {erro && (
            <div className={estilos.erro} role="alert">
              {erro}
            </div>
          )}

          <div className={estilos.rodapeFormulario}>
            <p>
              <ShieldCheck size={17} />
              Preencha apenas os dados necessários para continuar.
            </p>

            <button
              className={estilos.botaoContinuar}
              type="submit"
              disabled={aProcessar}
            >
              {aProcessar ? "A preparar..." : "Continuar para sintomas"}
              <span aria-hidden="true"> →</span>
            </button>
          </div>
        </form>

        <p className={estilos.notaFinal}>
          O Ponto Verde não realiza diagnósticos automáticos. A informação
          recolhida destina-se a apoiar o processo de atendimento.
        </p>
      </section>

      <footer className={estilos.rodape}>
        <strong>Ponto Verde</strong>
        <span>Pré-consulta digital</span>
      </footer>
    </main>
  );
}