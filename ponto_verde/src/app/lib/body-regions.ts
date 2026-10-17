export type BodyRegion = {
  id: string;
  label: string;
  side: "left" | "right" | "center";
  view: "front" | "back" | "both";
};

export const BODY_REGIONS: BodyRegion[] = [
  { id: "head", label: "Cabeça", side: "center", view: "both" },
  { id: "neck", label: "Pescoço", side: "center", view: "both" },

  { id: "chest_left", label: "Peito esquerdo", side: "left", view: "front" },
  { id: "chest_right", label: "Peito direito", side: "right", view: "front" },

  { id: "abdomen_upper", label: "Abdómen superior", side: "center", view: "front" },
  { id: "abdomen_lower", label: "Abdómen inferior", side: "center", view: "front" },

  { id: "back_upper", label: "Costas superiores", side: "center", view: "back" },
  { id: "back_lower", label: "Costas inferiores", side: "center", view: "back" },

  { id: "shoulder_left", label: "Ombro esquerdo", side: "left", view: "both" },
  { id: "shoulder_right", label: "Ombro direito", side: "right", view: "both" },

  { id: "elbow_left", label: "Cotovelo esquerdo", side: "left", view: "both" },
  { id: "elbow_right", label: "Cotovelo direito", side: "right", view: "both" },

  { id: "hand_left", label: "Mão esquerda", side: "left", view: "both" },
  { id: "hand_right", label: "Mão direita", side: "right", view: "both" },

  { id: "knee_left", label: "Joelho esquerdo", side: "left", view: "both" },
  { id: "knee_right", label: "Joelho direito", side: "right", view: "both" },

  { id: "foot_left", label: "Pé esquerdo", side: "left", view: "both" },
  { id: "foot_right", label: "Pé direito", side: "right", view: "both" },
];