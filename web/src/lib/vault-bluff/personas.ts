import type { PersonaId } from "./types";

export const PERSONAS: Record<
  PersonaId,
  { name: string; description: string; style: string }
> = {
  ANALYST: {
    name: "Analyst",
    description: "Deliberate answers and evidence-weighted choices.",
    style: "Measured",
  },
  SHOWBOAT: {
    name: "Showboat",
    description: "Fast, confident recommendations with more bluffs.",
    style: "Bold",
  },
  NERVOUS: {
    name: "Nervous",
    description: "Variable timing and cautious confidence.",
    style: "Uncertain",
  },
  WILDCARD: {
    name: "Wildcard",
    description: "Exploratory choices and reverse psychology.",
    style: "Unpredictable",
  },
};
