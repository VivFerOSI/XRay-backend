import type { Assessment, Band, GlobalLevel } from './types';
import { maxTotal } from './types';

export interface PilarResult {
  key: string;
  name: string;
  score: number;
  bandTitle: string;
  /** Devolución como párrafo (cuestionarios que usan `text`). */
  bandText: string;
  /** Devolución como lista (cuestionarios que usan `bullets`). */
  bandBullets?: string[];
}

export interface StressResult {
  /** Cuestionario al que pertenece el resultado. */
  assessmentKey: string;
  assessmentTitle: string;
  /** Nombre corto, para el mensaje de WhatsApp y los asuntos de correo. */
  assessmentShortName: string;
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
  /** Cierre según el norte elegido (y el nivel, si el cuestionario lo cruza). */
  norteClosing: string;
  /** Partes del cruce norte × nivel, cuando el cuestionario lo define. */
  cruce?: { lectura: string; diagnostico: string; primerPaso: string };
  /** Párrafos introductorios de la devolución. */
  lecturaGeneral?: string[];
}

function findBand(bands: Band[], score: number): Band {
  return (
    bands.find((b) => score >= b.min && score <= b.max) ?? bands[bands.length - 1]
  );
}

/**
 * Calcula el resultado de un cuestionario a partir de las respuestas
 * (mapa questionId → valor 1–5) y el "norte" elegido.
 */
export function computeResult(
  assessment: Assessment,
  answers: Record<number, number>,
  norteKey: string,
): StressResult {
  const pilares: PilarResult[] = assessment.pilares.map((p) => {
    const score = p.questions.reduce((sum, q) => {
      const v = answers[q.id] ?? 0;
      if (!v) return sum;
      // Afirmaciones inversas: 5→1, 4→2, 3→3, 2→4, 1→5.
      return sum + (q.reverse ? 6 - v : v);
    }, 0);
    const band = findBand(p.bands, score);
    return {
      key: p.key,
      name: p.name,
      score,
      bandTitle: band.title,
      bandText: band.text ?? '',
      ...(band.bullets ? { bandBullets: band.bullets } : {}),
    };
  });

  const total = pilares.reduce((sum, pr) => sum + pr.score, 0);

  const gb =
    assessment.globalBands.find((b) => total >= b.min && total <= b.max) ??
    assessment.globalBands[assessment.globalBands.length - 1];

  // El cierre sale del cruce norte × nivel si el cuestionario lo define;
  // si no, del texto fijo de la opción de norte.
  const cruce = assessment.cruces?.find(
    (c) => c.norteKey === norteKey && c.level === gb.level,
  );
  const norte = assessment.norteOptions.find((o) => o.key === norteKey);

  return {
    assessmentKey: assessment.key,
    assessmentTitle: assessment.title,
    assessmentShortName: assessment.shortName,
    pilares,
    total,
    maxTotal: maxTotal(assessment),
    global: {
      level: gb.level,
      title: gb.title,
      perfil: gb.perfil,
      text: gb.text,
      closing: gb.closing,
    },
    norteClosing: cruce?.diagnostico ?? norte?.closing ?? '',
    ...(cruce
      ? {
          cruce: {
            lectura: cruce.lectura,
            diagnostico: cruce.diagnostico,
            primerPaso: cruce.primerPaso,
          },
        }
      : {}),
    ...(assessment.lecturaGeneral
      ? { lecturaGeneral: assessment.lecturaGeneral }
      : {}),
  };
}
