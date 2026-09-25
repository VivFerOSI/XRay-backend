import type { StressTestResultEmailData } from './stress-test-result.template';
import type { StressTestLeadEmailData } from './stress-test-lead.template';

/**
 * Versiones en texto plano de los dos correos.
 *
 * Van como `textContent` junto al HTML: un mail sin alternativa de texto suma
 * puntaje de spam, y es justo lo que hay que cuidar mientras el remitente no
 * tenga el dominio autenticado. También es lo que leen los lectores de
 * pantalla y los clientes en modo texto.
 *
 * Se escriben a mano en vez de derivarlas del HTML: convertir markup a texto
 * con expresiones regulares es frágil y termina filtrando etiquetas.
 */

const SEP = '='.repeat(56);

/** Barra de progreso en ASCII, para conservar la lectura de un vistazo. */
function bar(score: number): string {
  const filled = Math.round((score / 25) * 20);
  return '#'.repeat(filled) + '.'.repeat(20 - filled);
}

export function renderStressTestResultText(
  d: StressTestResultEmailData,
): string {
  const r = d.result;
  const lines: string[] = [];

  lines.push('X-RAY | Stress Test de Robustez y Crecimiento');
  lines.push(SEP);
  lines.push('');
  lines.push(`Hola ${d.nombreContacto},`);
  lines.push('');
  lines.push(
    `Este es el diagnóstico de ${d.nombreEmprendimiento} según tus respuestas al Stress Test.`,
  );
  lines.push('');
  lines.push(`PUNTAJE GLOBAL: ${r.total} / ${r.maxTotal}`);
  lines.push(r.global.title);
  lines.push(r.global.perfil);
  lines.push('');
  lines.push(r.global.text);
  lines.push('');
  lines.push(SEP);
  lines.push('SEMÁFORO DE PILARES');
  lines.push('');
  for (const p of r.pilares) {
    lines.push(`${p.name}: ${p.score}/25 · ${p.bandTitle}`);
    lines.push(`  [${bar(p.score)}]`);
  }
  lines.push('');
  lines.push(SEP);
  lines.push('LECTURA POR PILAR');
  for (const p of r.pilares) {
    lines.push('');
    lines.push(`${p.name} — ${p.bandTitle}`);
    lines.push(p.bandText);
  }
  lines.push('');
  lines.push(SEP);
  lines.push('');
  lines.push(r.global.closing);
  lines.push('');
  lines.push(r.norteClosing);
  lines.push('');
  lines.push('Agendar una conversación: https://wa.me/5491176766932');
  if (d.reportUrl) {
    lines.push(
      `Ver tu informe completo (con el gráfico por pilar y la descarga en PDF): ${d.reportUrl}`,
    );
  }
  lines.push('');
  lines.push(SEP);
  lines.push('X-Ray · Consultoría organizacional');
  lines.push('https://x-ray.ar · servicios1@x-ray.ar');
  lines.push('');
  lines.push(
    'Recibís este mail porque completaste el Stress Test en x-ray.ar.',
  );
  lines.push('Podés responder directamente si querés conversarlo.');

  return lines.join('\n');
}

export function renderStressTestLeadText(d: StressTestLeadEmailData): string {
  const r = d.result;
  const masFlojo = r.pilares.reduce((min, p) => (p.score < min.score ? p : min));
  const lines: string[] = [];

  lines.push(`NUEVO LEAD · STRESS TEST — ${d.nombreEmprendimiento}`);
  lines.push(SEP);
  lines.push('');
  lines.push(`PUNTAJE: ${r.total} / ${r.maxTotal}`);
  lines.push(r.global.title);
  lines.push(r.global.perfil);
  lines.push('');
  lines.push('CONTACTO');
  lines.push(`  Nombre:   ${d.nombreContacto}`);
  lines.push(`  Email:    ${d.email}`);
  lines.push(`  Teléfono: ${d.telefono ?? 'no dejó teléfono'}`);
  lines.push('');
  lines.push('EMPRENDIMIENTO');
  lines.push(`  Sector:     ${d.sector}`);
  lines.push(`  Antigüedad: ${d.antiguedad}`);
  lines.push(`  Equipo:     ${d.tamanoEquipo}`);
  lines.push('');
  lines.push('PUNTAJES POR PILAR');
  for (const p of r.pilares) {
    lines.push(`  ${p.name}: ${p.score}/25 · ${p.bandTitle}`);
  }
  lines.push('');
  lines.push(
    `Punto más débil: ${masFlojo.name} (${masFlojo.score}/25 · ${masFlojo.bandTitle}).`,
  );
  lines.push('');
  lines.push('NORTE DE LIDERAZGO');
  lines.push(`  ${d.norteLabel}`);
  lines.push('');
  if (d.reportUrl) {
    lines.push(`Ver el informe completo: ${d.reportUrl}`);
    lines.push('');
  }
  lines.push(`ID ${d.submissionId}`);

  return lines.join('\n');
}
