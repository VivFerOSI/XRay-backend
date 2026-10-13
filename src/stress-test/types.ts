/**
 * Tipos del motor de autoevaluaciones.
 *
 * Cada cuestionario es un `Assessment`: mismo mecanismo (Likert, pilares,
 * bandas por pilar, bandas globales, "norte"), distinto contenido. Agregar uno
 * nuevo es escribir un archivo en `definitions/` y registrarlo en `registry.ts`.
 */

export interface ScalePoint {
  value: number;
  label: string;
}

export interface Question {
  id: number;
  text: string;
  /**
   * La misma afirmación referida a otra persona, para la evaluación 360°.
   * Si falta, el cuestionario de terceros no se puede abrir: el texto en
   * primera persona ("puedo desconectarme…") no tiene sentido ahí.
   */
  textoTercera?: string;
  /** Si es true, el puntaje se invierte (5→1, 4→2, 3→3, 2→4, 1→5). */
  reverse?: boolean;
}

export interface Band {
  min: number;
  max: number;
  title: string;
  /** Devolución como párrafo. Excluyente con `bullets`. */
  text?: string;
  /** Devolución como lista de afirmaciones. Excluyente con `text`. */
  bullets?: string[];
}

export interface Pilar {
  key: string;
  name: string;
  questions: Question[];
  bands: Band[];
}

export type GlobalLevel = 'alto' | 'medio' | 'bajo' | 'muyBajo';

export interface GlobalBand {
  level: GlobalLevel;
  min: number;
  max: number;
  title: string;
  perfil: string;
  text: string;
  /** Párrafo de "llamada a la acción" según el nivel global. */
  closing: string;
}

export interface NorteOption {
  key: string;
  label: string;
  /**
   * Cierre fijo según el norte elegido. Los cuestionarios que cruzan norte
   * con nivel (ver `cruces`) no lo usan.
   */
  closing?: string;
}

/**
 * Cierre que depende del norte **y** del nivel alcanzado. Lo usa el
 * cuestionario de líderes, cuya devolución final combina ambas cosas.
 */
export interface Cruce {
  norteKey: string;
  level: GlobalLevel;
  /** Título de la lectura, ej. "Tracción y escalado de impacto". */
  lectura: string;
  diagnostico: string;
  primerPaso: string;
}

export interface OrgField {
  key: string;
  label: string;
  placeholder: string;
  /** Si es true, se puede enviar vacío. */
  optional?: boolean;
  /** Si viene, el campo se muestra como desplegable. */
  options?: string[];
}

export interface Assessment {
  /** Identificador en URL y en base de datos. */
  key: string;
  title: string;
  /** Bajada de la pantalla inicial. */
  intro: string;
  /** Encabezado del paso de datos, ej. "Sobre tu emprendimiento". */
  orgFieldsTitle: string;
  orgFields: OrgField[];
  scale: ScalePoint[];
  pilares: Pilar[];
  globalBands: GlobalBand[];
  norteQuestion: string;
  norteOptions: NorteOption[];
  /** Párrafos introductorios de la devolución. Opcional. */
  lecturaGeneral?: string[];
  /** Matriz norte × nivel. Si está, reemplaza al `closing` del norte. */
  cruces?: Cruce[];
  /** Texto del mensaje de WhatsApp y del asunto de los correos. */
  shortName: string;

  // ── Presentación pública ──
  /**
   * Estado con el que se siembra el cuestionario la primera vez. Después manda
   * la columna `activo` de la tabla, que se cambia desde el panel: esto sólo
   * decide si nace publicado o escondido. Un cuestionario inactivo no entra en
   * el listado público y sus rutas responden 404.
   */
  activo?: boolean;
  /**
   * Nombre con el que se ofrece en el sitio, cuando no coincide con el título
   * del test (ej. "Autoevaluación de la Persona Evaluada" para el cuestionario
   * "Stress Test de Robustez y Crecimiento del Líder").
   */
  nombrePublico?: string;
  /** Bajada corta bajo el nombre, ej. "La práctica de quien conduce el proceso". */
  subtitulo?: string;
  /** A quién está dirigido, en una o dos oraciones. */
  orientadoA?: string;
  /** Qué revisa el cuestionario, una idea por ítem. */
  explora?: string[];
  /** Qué se lleva quien lo responde. */
  aporta?: string;
  /**
   * Agrupa cuestionarios que se presentan juntos en el sitio. Los que
   * comparten grupo salen en el mismo bloque de la página de Servicios.
   */
  grupo?: string;

  // ── Evaluación 360° ──
  /**
   * Habilita invitar evaluadores al terminar la autoevaluación. Requiere que
   * todas las preguntas tengan `textoTercera`.
   */
  evaluacion360?: boolean;
  /** Días que tienen los evaluadores para responder. */
  dias360?: number;
  /** Cuántas personas se pueden invitar. */
  maxEvaluadores?: number;
}

/** ¿Está el cuestionario listo para usarse en 360°? */
export function listoPara360(a: Assessment): { ok: boolean; motivo?: string } {
  if (!a.evaluacion360) {
    return { ok: false, motivo: 'La evaluación 360° no está habilitada para este cuestionario.' };
  }
  const sinTexto = allQuestions(a).filter((q) => !q.textoTercera?.trim());
  if (sinTexto.length > 0) {
    return {
      ok: false,
      motivo:
        `Faltan las versiones en tercera persona de ${sinTexto.length} ` +
        `afirmaciones (${sinTexto.slice(0, 3).map((q) => q.id).join(', ')}…).`,
    };
  }
  return { ok: true };
}

/** Todas las preguntas de un cuestionario, en orden. */
export function allQuestions(a: Assessment): Question[] {
  return a.pilares.flatMap((p) => p.questions);
}

/** Puntaje máximo: 5 puntos por pregunta. */
export function maxTotal(a: Assessment): number {
  return allQuestions(a).length * 5;
}
