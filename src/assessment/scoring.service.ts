import { Injectable } from '@nestjs/common';
import { DeviationDirection } from './entities/assessment.entity';

/** Banda de color para los indicadores visuales del resumen. */
export type AlignmentBand = 'green' | 'amber' | 'red';

export interface ScoringOptionInput {
  optionId: number;
  /** Puntaje de esta opción para el rol declarado por el usuario. */
  scoreForDeclaredRole: number;
  /** Nivel del rol al que "pertenece" la conducta de la opción (o null). */
  alignedRoleLevel: number | null;
}

export interface ScoringQuestionInput {
  questionId: number;
  categoryId: number;
  chosenOptionId: number;
  /** Todas las opciones de la pregunta (para calcular el máximo posible). */
  options: ScoringOptionInput[];
}

export interface CategoryBreakdown {
  categoryId: number;
  totalScore: number;
  maxScore: number;
  alignmentPct: number;
  band: AlignmentBand;
}

export interface AnswerScore {
  questionId: number;
  optionId: number;
  scoreAwarded: number;
}

export interface ScoringResult {
  totalScore: number;
  maxScore: number;
  alignmentPct: number;
  band: AlignmentBand;
  deviation: DeviationDirection;
  answers: AnswerScore[];
  categories: CategoryBreakdown[];
}

/**
 * Calcula el resultado de un intento a partir de las opciones elegidas y sus
 * puntajes para el rol declarado. No accede a la base: recibe todo resuelto,
 * de modo que la regla de valoración quede aislada y fácil de testear/ajustar.
 */
@Injectable()
export class ScoringService {
  /** Umbrales de alineación (%) para las bandas de color. Ajustables. */
  private static readonly GREEN_MIN = 80;
  private static readonly AMBER_MIN = 55;

  /**
   * Tolerancia (en niveles de rol) para considerar las respuestas "alineadas"
   * antes de marcar desvío hacia inferior/superior.
   */
  private static readonly DEVIATION_TOLERANCE = 0.5;

  bandFor(pct: number): AlignmentBand {
    if (pct >= ScoringService.GREEN_MIN) return 'green';
    if (pct >= ScoringService.AMBER_MIN) return 'amber';
    return 'red';
  }

  compute(
    declaredRoleLevel: number,
    questions: ScoringQuestionInput[],
  ): ScoringResult {
    const answers: AnswerScore[] = [];
    const catAgg = new Map<number, { total: number; max: number }>();

    let totalScore = 0;
    let maxScore = 0;
    let alignedLevelSum = 0;
    let alignedLevelCount = 0;

    for (const q of questions) {
      const chosen = q.options.find((o) => o.optionId === q.chosenOptionId);
      if (!chosen) continue;

      const questionMax = q.options.reduce(
        (m, o) => Math.max(m, o.scoreForDeclaredRole),
        Number.NEGATIVE_INFINITY,
      );

      totalScore += chosen.scoreForDeclaredRole;
      maxScore += questionMax;

      const agg = catAgg.get(q.categoryId) ?? { total: 0, max: 0 };
      agg.total += chosen.scoreForDeclaredRole;
      agg.max += questionMax;
      catAgg.set(q.categoryId, agg);

      if (chosen.alignedRoleLevel !== null) {
        alignedLevelSum += chosen.alignedRoleLevel;
        alignedLevelCount += 1;
      }

      answers.push({
        questionId: q.questionId,
        optionId: chosen.optionId,
        scoreAwarded: this.round(chosen.scoreForDeclaredRole),
      });
    }

    const alignmentPct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const categories: CategoryBreakdown[] = [...catAgg.entries()].map(
      ([categoryId, { total, max }]) => {
        const pct = max > 0 ? (total / max) * 100 : 0;
        return {
          categoryId,
          totalScore: this.round(total),
          maxScore: this.round(max),
          alignmentPct: this.round(pct),
          band: this.bandFor(pct),
        };
      },
    );

    return {
      totalScore: this.round(totalScore),
      maxScore: this.round(maxScore),
      alignmentPct: this.round(alignmentPct),
      band: this.bandFor(alignmentPct),
      deviation: this.deviationFor(
        declaredRoleLevel,
        alignedLevelSum,
        alignedLevelCount,
      ),
      answers,
      categories,
    };
  }

  private deviationFor(
    declaredLevel: number,
    alignedLevelSum: number,
    alignedLevelCount: number,
  ): DeviationDirection {
    if (alignedLevelCount === 0) return 'aligned';
    const avgAligned = alignedLevelSum / alignedLevelCount;
    const delta = avgAligned - declaredLevel;
    if (Math.abs(delta) <= ScoringService.DEVIATION_TOLERANCE) return 'aligned';
    return delta > 0 ? 'superior' : 'inferior';
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
