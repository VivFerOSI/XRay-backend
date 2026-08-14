import {
  Band,
  GLOBAL_BANDS,
  GlobalLevel,
  NORTE_OPTIONS,
  PILARES,
} from './content';

export interface PilarResult {
  key: string;
  name: string;
  score: number;
  bandTitle: string;
  bandText: string;
}

export interface StressResult {
  pilares: PilarResult[];
  total: number;
  maxTotal: number;
  global: {
    level: GlobalLevel;
    title: string;
    perfil: string;
    text: string;
    closing: string;
  };
  norteClosing: string;
}

function findBand(bands: Band[], score: number): Band {
  return bands.find((b) => score >= b.min && score <= b.max) ?? bands[bands.length - 1];
}

/**
 * Calcula el resultado del Stress Test a partir de las respuestas (mapa
 * questionId → valor 1–5) y el "norte" de liderazgo elegido.
 */
export function computeResult(
  answers: Record<number, number>,
  norteKey: string,
): StressResult {
  const pilares: PilarResult[] = PILARES.map((p) => {
    const score = p.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const band = findBand(p.bands, score);
    return { key: p.key, name: p.name, score, bandTitle: band.title, bandText: band.text };
  });

  const total = pilares.reduce((sum, pr) => sum + pr.score, 0);

  const gb =
    GLOBAL_BANDS.find((b) => total >= b.min && total <= b.max) ??
    GLOBAL_BANDS[GLOBAL_BANDS.length - 1];

  const norte = NORTE_OPTIONS.find((o) => o.key === norteKey);

  return {
    pilares,
    total,
    maxTotal: 125,
    global: {
      level: gb.level,
      title: gb.title,
      perfil: gb.perfil,
      text: gb.text,
      closing: gb.closing,
    },
    norteClosing: norte?.closing ?? '',
  };
}
