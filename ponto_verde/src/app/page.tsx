"use client";

import { useState } from "react";

export default function TriagePage() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggleRegion(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  const labels = new Map(
    BODY_REGIONS.map((region) => [region.id, region.label])
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Onde sente dor?
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Toque nas regiões do corpo onde sente dor.
          Pode selecionar várias zonas.
        </p>
      </header>

      <section className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <BodyViewer
            selectedRegions={selected}
            onSelectRegion={toggleRegion}
          />

          <p className="mt-3 text-center text-sm text-slate-500">
            Arraste para rodar. Use dois dedos para ampliar
            ou reduzir. Toque numa região para a selecionar.
          </p>
        </div>

        <aside className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-semibold">
            Regiões selecionadas
          </h2>

          {selected.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Ainda não selecionou nenhuma região.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selected.map((id) => (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3"
                >
                  <span>{labels.get(id) ?? id}</span>

                  <button
                    type="button"
                    onClick={() => toggleRegion(id)}
                    className="min-h-12 min-w-12 rounded-lg text-red-700"
                    aria-label={`Remover ${labels.get(id) ?? id}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => {
              sessionStorage.setItem(
                "triage-pain-regions",
                JSON.stringify(selected)
              );

              window.location.assign("/triagem/intensidade");
            }}
            className="mt-6 min-h-14 w-full rounded-xl bg-blue-700 p-4 text-lg font-semibold text-white disabled:opacity-40"
          >
            Continuar
          </button>

          <button
            type="button"
            onClick={() => setSelected([])}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 p-3"
          >
            Limpar seleções
          </button>
        </aside>
      </section>
    </main>
  );
}