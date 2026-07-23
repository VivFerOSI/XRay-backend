import { ScoringService, ScoringQuestionInput } from './scoring.service';

/**
 * Puntajes de ejemplo iguales a los que genera el seed: una opción alineada al
 * nivel L vale max(0, 10 - |L - rolDeclarado| * 2.5).
 */
function scoreFor(optLevel: number, roleLevel: number): number {
  return Math.max(0, 10 - Math.abs(optLevel - roleLevel) * 2.5);
}

/** Construye una pregunta con 5 opciones (niveles 1..5) para un rol declarado. */
function question(
  questionId: number,
  categoryId: number,
  chosenLevel: number,
  declaredLevel: number,
): ScoringQuestionInput {
  return {
    questionId,
    categoryId,
    chosenOptionId: chosenLevel, // usamos el nivel como id de opción, 1..5
    options: [1, 2, 3, 4, 5].map((level) => ({
      optionId: level,
      scoreForDeclaredRole: scoreFor(level, declaredLevel),
      alignedRoleLevel: level,
    })),
  };
}

describe('ScoringService', () => {
  const service = new ScoringService();

  it('da alineación 100% y "aligned" cuando siempre se elige la opción del rol declarado', () => {
    const declared = 3; // Jefe
    const questions = [1, 2, 3].map((id) => question(id, 1, declared, declared));

    const r = service.compute(declared, questions);

    expect(r.alignmentPct).toBe(100);
    expect(r.band).toBe('green');
    expect(r.deviation).toBe('aligned');
    expect(r.totalScore).toBe(r.maxScore);
  });

  it('detecta desvío hacia superior cuando se eligen opciones de roles más altos', () => {
    const declared = 2; // Supervisor
    // Elige siempre nivel 5 (Director).
    const questions = [1, 2, 3].map((id) => question(id, 1, 5, declared));

    const r = service.compute(declared, questions);

    expect(r.deviation).toBe('superior');
    expect(r.alignmentPct).toBeLessThan(100);
  });

  it('detecta desvío hacia inferior cuando se eligen opciones de roles más bajos', () => {
    const declared = 4; // Gerente
    // Elige siempre nivel 1 (Empleado).
    const questions = [1, 2, 3].map((id) => question(id, 1, 1, declared));

    const r = service.compute(declared, questions);

    expect(r.deviation).toBe('inferior');
    expect(r.band).toBe('red'); // muy desalineado
  });

  it('agrega el desglose por categoría', () => {
    const declared = 3;
    const questions = [
      question(1, 10, declared, declared),
      question(2, 20, 1, declared),
    ];

    const r = service.compute(declared, questions);

    expect(r.categories).toHaveLength(2);
    const cat10 = r.categories.find((c) => c.categoryId === 10)!;
    const cat20 = r.categories.find((c) => c.categoryId === 20)!;
    expect(cat10.alignmentPct).toBe(100);
    expect(cat20.alignmentPct).toBeLessThan(100);
  });

  it('ignora opciones inexistentes sin romper', () => {
    const declared = 3;
    const q: ScoringQuestionInput = {
      questionId: 1,
      categoryId: 1,
      chosenOptionId: 999, // no existe
      options: [
        { optionId: 1, scoreForDeclaredRole: 10, alignedRoleLevel: 3 },
      ],
    };

    const r = service.compute(declared, [q]);
    expect(r.answers).toHaveLength(0);
    expect(r.totalScore).toBe(0);
  });
});
