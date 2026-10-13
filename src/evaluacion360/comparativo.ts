import type { Assessment } from '../stress-test/types';
import { maxTotal } from '../stress-test/types';
import { computeResult, type StressResult } from '../stress-test/scoring';

export interface PilarComparado {
  key: string;
  name: string;
  /** Puntaje que se dio la propia persona. */
  auto: number;
  /** Promedio de los evaluadores, con un decimal. */
  terceros: number;
  /** auto − terceros. Positivo = se ve mejor de lo que la ven. */
  gap: number;
  maxPilar: number;
  /** Cómo leer el gap de este pilar. */
  lectura: 'alineado' | 'sobreestima' | 'subestima';
  /** Banda en la que cae el promedio de los evaluadores. */
  bandaTerceros: string;
}

export interface Comparativo360 {
  evaluadores: number;
  auto: StressResult;
  totalTerceros: number;
  maxTotal: number;
  gapTotal: number;
  lecturaGeneral: 'alineado' | 'sobreestima' | 'subestima';
  pilares: PilarComparado[];
  /** Pilar donde más se sobreestima: el punto ciego principal. */
  puntoCiego: PilarComparado | null;
  /** Pilar donde más lo valoran por encima de su propia mirada. */
  fortalezaOculta: PilarComparado | null;
}

/**
 * Un gap menor a este valor se considera coincidencia.
 *
 * En una escala de 5 puntos por afirmación, diferencias de hasta 2 puntos
 * sobre 25 entran dentro de lo que dos personas responden distinto sin que
 * signifique una diferencia real de percepción.
 */
const UMBRAL_ALINEADO = 2;

function leer(gap: number): 'alineado' | 'sobreestima' | 'subestima' {
  if (Math.abs(gap) <= UMBRAL_ALINEADO) return 'alineado';
  return gap > 0 ? 'sobreestima' : 'subestima';
}

/**
 * Compara la autoevaluación con el promedio de los evaluadores.
 *
 * Se promedian los puntajes **por pilar** y no las respuestas pregunta por
 * pregunta: el informe se lee por pilar, y promediar respuestas individuales
 * daría una precisión que los datos no tienen (son tres personas).
 */
export function compararCon360(
  assessment: Assessment,
  answersAuto: Record<number, number>,
  norteKey: string,
  respuestasTerceros: Record<number, number>[],
): Comparativo360 {
  const auto = computeResult(assessment, answersAuto, norteKey);

  // Cada evaluador produce su propio resultado; después se promedia por pilar.
  const resultadosTerceros = respuestasTerceros.map((r) =>
    computeResult(assessment, r, norteKey),
  );

  const pilares: PilarComparado[] = auto.pilares.map((p, i) => {
    const maxPilar = Math.round(auto.maxTotal / auto.pilares.length);
    const puntajes = resultadosTerceros.map((r) => r.pilares[i].score);
    const promedio =
      puntajes.length > 0
        ? Math.round((puntajes.reduce((a, b) => a + b, 0) / puntajes.length) * 10) / 10
        : 0;
    const gap = Math.round((p.score - promedio) * 10) / 10;

    const pilarDef = assessment.pilares[i];
    const banda =
      pilarDef.bands.find((b) => promedio >= b.min && promedio <= b.max) ??
      pilarDef.bands[pilarDef.bands.length - 1];

    return {
      key: p.key,
      name: p.name,
      auto: p.score,
      terceros: promedio,
      gap,
      maxPilar,
      lectura: leer(gap),
      bandaTerceros: banda?.title ?? '',
    };
  });

  const totalTerceros =
    Math.round(pilares.reduce((s, p) => s + p.terceros, 0) * 10) / 10;
  const gapTotal = Math.round((auto.total - totalTerceros) * 10) / 10;

  // El punto ciego y la fortaleza oculta sólo tienen sentido si la diferencia
  // supera el umbral; si todo está alineado no hay nada que señalar.
  const sobre = pilares.filter((p) => p.lectura === 'sobreestima');
  const sub = pilares.filter((p) => p.lectura === 'subestima');

  return {
    evaluadores: respuestasTerceros.length,
    auto,
    totalTerceros,
    maxTotal: maxTotal(assessment),
    gapTotal,
    // El umbral general se escala con la cantidad de pilares.
    lecturaGeneral: leer(gapTotal / Math.max(1, pilares.length)),
    pilares,
    puntoCiego:
      sobre.length > 0
        ? sobre.reduce((a, b) => (b.gap > a.gap ? b : a))
        : null,
    fortalezaOculta:
      sub.length > 0 ? sub.reduce((a, b) => (b.gap < a.gap ? b : a)) : null,
  };
}
