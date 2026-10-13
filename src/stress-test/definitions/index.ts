import type { Assessment } from '../types';
import { EMPRENDIMIENTO } from './emprendimiento';
import { LIDER } from './lider';
import { EVALUADOR } from './evaluador';

/**
 * Definiciones versionadas en el código. Siembran la tabla `assessments` la
 * primera vez y sirven de respaldo si la base no está disponible; a partir de
 * ahí mandan las de la base, que son las que edita el panel.
 *
 * Para sumar un cuestionario: escribir su archivo acá al lado y agregarlo a
 * esta lista. El orden define cuál es el cuestionario por defecto (el primero).
 */
export const SEMILLAS: Assessment[] = [EMPRENDIMIENTO, LIDER, EVALUADOR];

export { EMPRENDIMIENTO, LIDER, EVALUADOR };
