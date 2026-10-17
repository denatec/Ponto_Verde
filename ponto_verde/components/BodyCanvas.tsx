"use client";

import dynamic from "next/dynamic";

const BodyViewer = dynamic(
  () => import("./BodyViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[65vh] items-center justify-center">
        A carregar o modelo anatómico…
      </div>
    ),
  }
);

export default BodyViewer;