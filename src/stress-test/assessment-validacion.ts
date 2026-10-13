import { BadRequestException } from '@nestjs/common';
import type { Assessment } from './types';

/**
 * Valida y normaliza una definición antes de guardarla.
 *
 * El panel permite agregar, borrar y reordenar preguntas, así que la
 * definición que llega puede tener ids repetidos, huecos o fuera de orden. Acá
 * se renumera de corrido (1..N en el orden de los pilares) y se comprueba que
 * siga siendo un cuestionario coherente: los puntajes, las bandas y los
 * informes ya guardados dependen de eso.
 *
 * **Las respuestas guardadas se referencian por id de pregunta.** Renumerar
 * cambia el significado de los envíos anteriores, por eso se avisa al editar
 * la cantidad de preguntas y no se permite dejar un pilar vacío.
 */
export function validarYNormalizar(def: Assessment): Assessment {
  if (!def?.pilares?.length) {
    throw new BadRequestException('El cuestionario necesita al menos un pilar.');
  }
  if (!def.title?.trim()) {
    throw new BadRequestException('El cuestionario necesita un título.');
  }

  const normalizado: Assessment = structuredClone(def);
  let siguienteId = 1;

  for (const pilar of normalizado.pilares) {
    if (!pilar.name?.trim()) {
      throw new BadRequestException('Todos los pilares necesitan un nombre.');
    }
    if (!pilar.questions?.length) {
      throw new BadRequestException(
        `El pilar "${pilar.name}" se quedó sin afirmaciones.`,
      );
    }
    for (const q of pilar.questions) {
      if (!q.text?.trim()) {
        throw new BadRequestException(
          `Hay una afirmación vacía en "${pilar.name}".`,
        );
      }
      // Renumeración de corrido: el orden lo dan los pilares y su lista.
      q.id = siguienteId++;
    }

    // Las bandas cubren de 1×preguntas a 5×preguntas: si cambió la cantidad,
    // hay que reajustar los cortes o el puntaje cae fuera de toda banda.
    const min = pilar.questions.length;
    const max = pilar.questions.length * 5;
    const cubiertos = new Set<number>();
    for (const b of pilar.bands ?? []) {
      for (let v = b.min; v <= b.max; v++) cubiertos.add(v);
    }
    const huecos: number[] = [];
    for (let v = min; v <= max; v++) if (!cubiertos.has(v)) huecos.push(v);
    if (huecos.length > 0) {
      throw new BadRequestException(
        `En "${pilar.name}" las bandas no cubren los puntajes ${huecos[0]} a ` +
          `${huecos[huecos.length - 1]}. Con ${pilar.questions.length} ` +
          `afirmaciones el rango va de ${min} a ${max}.`,
      );
    }
  }

  const total = siguienteId - 1;
  const maxGlobal = total * 5;
  const cubiertosGlobal = new Set<number>();
  for (const g of normalizado.globalBands ?? []) {
    for (let v = g.min; v <= g.max; v++) cubiertosGlobal.add(v);
  }
  const huecosGlobal: number[] = [];
  for (let v = total; v <= maxGlobal; v++) {
    if (!cubiertosGlobal.has(v)) huecosGlobal.push(v);
  }
  if (huecosGlobal.length > 0) {
    throw new BadRequestException(
      `Los niveles de resultado general no cubren los puntajes ` +
        `${huecosGlobal[0]} a ${huecosGlobal[huecosGlobal.length - 1]}. ` +
        `Con ${total} afirmaciones el rango va de ${total} a ${maxGlobal}.`,
    );
  }

  return normalizado;
}
