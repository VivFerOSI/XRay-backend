import { ValueTransformer } from 'typeorm';

/**
 * El driver de Postgres devuelve las columnas `numeric` como string para no
 * perder precisión. En este dominio los puntajes caben sin problema en un
 * number de JS, así que los convertimos para trabajar cómodo.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};
