import { escapeHtml } from '../escape-html';
import type { Comparativo360 } from '../../evaluacion360/comparativo';

const NAVY = '#0F1E3C';
const GOLD = '#C8922A';
const OFFWHITE = '#F7F5F0';

function marco(contenido: string, titulo: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(titulo)}</title></head>
<body style="margin:0;padding:0;background-color:${OFFWHITE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${OFFWHITE};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      <tr><td style="background-color:${NAVY};border-radius:10px 10px 0 0;padding:26px 32px;font-family:Arial,Helvetica,sans-serif;">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#FFFFFF;letter-spacing:1px;">X<span style="color:${GOLD};">-</span>RAY</p>
      </td></tr>
      ${contenido}
      <tr><td style="background-color:${NAVY};border-radius:0 0 10px 10px;padding:20px 32px;font-family:Arial,Helvetica,sans-serif;">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);">
          <a href="https://x-ray.ar" style="color:${GOLD};text-decoration:none;">x-ray.ar</a> &nbsp;&middot;&nbsp;
          <a href="mailto:servicios1@x-ray.ar" style="color:${GOLD};text-decoration:none;">servicios1@x-ray.ar</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function boton(url: string, texto: string): string {
  return `<tr><td align="center" style="background-color:#FFFFFF;padding:10px 32px 30px 32px;">
    <a href="${url}" style="display:inline-block;background-color:${GOLD};color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:24px;">${escapeHtml(texto)}</a>
  </td></tr>`;
}

const fecha = (d: Date) =>
  new Date(d).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

export interface InvitacionData {
  nombreEvaluador: string;
  nombreEvaluado: string;
  titulo: string;
  url: string;
  venceEl: Date;
}

export function renderInvitacion360(d: InvitacionData): string {
  return marco(
    `<tr><td style="background-color:#FFFFFF;padding:30px 32px 10px 32px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 14px 0;font-size:16px;color:${NAVY};">Hola ${escapeHtml(d.nombreEvaluador)},</p>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:22px;color:#4B5563;">
        <strong style="color:${NAVY};">${escapeHtml(d.nombreEvaluado)}</strong> está haciendo un diagnóstico
        de su liderazgo y te eligió para aportar tu mirada.
      </p>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:22px;color:#4B5563;">
        Son 25 afirmaciones sobre su manera de trabajar y toma unos 10 minutos.
        <strong style="color:${NAVY};">Tus respuestas son anónimas</strong>: se promedian con las de las otras
        personas invitadas, así que nadie va a saber qué respondiste vos.
      </p>
      <p style="margin:0;font-size:14px;line-height:22px;color:#4B5563;">
        Tenés tiempo hasta el <strong style="color:${NAVY};">${fecha(d.venceEl)}</strong>.
      </p>
    </td></tr>
    ${boton(d.url, 'Responder la evaluación')}`,
    'Te invitaron a una evaluación',
  );
}

export function renderRecordatorio360(d: InvitacionData): string {
  return marco(
    `<tr><td style="background-color:#FFFFFF;padding:30px 32px 10px 32px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 14px 0;font-size:16px;color:${NAVY};">Hola ${escapeHtml(d.nombreEvaluador)},</p>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:22px;color:#4B5563;">
        Te escribimos para recordarte la evaluación de
        <strong style="color:${NAVY};">${escapeHtml(d.nombreEvaluado)}</strong>. Son 10 minutos y tus
        respuestas son anónimas.
      </p>
      <p style="margin:0;font-size:14px;line-height:22px;color:#4B5563;">
        El plazo vence el <strong style="color:${NAVY};">${fecha(d.venceEl)}</strong>. Si no llegás,
        el informe se arma igual con lo que haya.
      </p>
    </td></tr>
    ${boton(d.url, 'Responder ahora')}`,
    'Recordatorio de evaluación',
  );
}

export interface Comparativo360EmailData {
  nombreContacto: string;
  comparativo: Comparativo360;
  reportUrl: string;
}

/** Barra doble: la mirada propia y la de los demás, una sobre otra. */
function barraDoble(auto: number, terceros: number, max: number): string {
  const pa = Math.round((auto / max) * 100);
  const pt = Math.round((terceros / max) * 100);
  const fila = (pct: number, color: string, etiqueta: string) => `
    <tr>
      <td width="58" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9CA3AF;padding:1px 6px 1px 0;">${etiqueta}</td>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E5E7EB;border-radius:4px;table-layout:fixed;">
          <tr>
            <td width="${pct}%" height="8" style="background-color:${color};border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
            ${pct >= 100 ? '' : `<td width="${100 - pct}%" height="8" style="font-size:0;line-height:0;">&nbsp;</td>`}
          </tr>
        </table>
      </td>
    </tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${fila(pa, NAVY, 'Vos')}
    ${fila(pt, GOLD, 'Tu equipo')}
  </table>`;
}

export function renderComparativo360(d: Comparativo360EmailData): string {
  const c = d.comparativo;

  const filas = c.pilares
    .map((p) => {
      const signo = p.gap > 0 ? '+' : '';
      const colorGap =
        p.lectura === 'alineado' ? '#6B7280' : p.lectura === 'sobreestima' ? '#F59E0B' : '#10B981';
      return `<tr><td style="padding:0 0 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${NAVY};padding-bottom:5px;">${escapeHtml(p.name)}</td>
            <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${colorGap};padding-bottom:5px;white-space:nowrap;">
              ${p.auto} vs ${p.terceros} &nbsp;(${signo}${p.gap})
            </td>
          </tr>
        </table>
        ${barraDoble(p.auto, p.terceros, p.maxPilar)}
      </td></tr>`;
    })
    .join('');

  const lectura =
    c.lecturaGeneral === 'alineado'
      ? 'Tu mirada y la de tu equipo coinciden bastante. Es una buena señal: significa que lo que ves de vos mismo se parece a lo que proyectás.'
      : c.lecturaGeneral === 'sobreestima'
        ? 'Tu equipo te puntuó por debajo de cómo te ves vos. No significa que estés equivocado, pero sí que hay aspectos de tu gestión que no se perciben como vos los vivís.'
        : 'Tu equipo te puntuó por encima de tu propia mirada. Sos más duro con vos mismo de lo que son los demás: puede haber fortalezas que no te estás reconociendo.';

  const destacado = (titulo: string, p: NonNullable<Comparativo360['puntoCiego']>, color: string) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid ${color};background-color:${OFFWHITE};border-radius:4px;margin-bottom:10px;">
      <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;">
        <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${color};font-weight:bold;">${escapeHtml(titulo)}</p>
        <p style="margin:0;font-size:13px;line-height:20px;color:#374151;">
          <strong style="color:${NAVY};">${escapeHtml(p.name)}</strong> &mdash;
          vos ${p.auto}, tu equipo ${p.terceros} sobre ${p.maxPilar}.
        </p>
      </td></tr>
    </table>`;

  return marco(
    `<tr><td style="background-color:#FFFFFF;padding:30px 32px 6px 32px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 14px 0;font-size:16px;color:${NAVY};">Hola ${escapeHtml(d.nombreContacto)},</p>
      <p style="margin:0;font-size:14px;line-height:22px;color:#4B5563;">
        Ya está tu informe comparativo. Respondieron
        <strong style="color:${NAVY};">${c.evaluadores} ${c.evaluadores === 1 ? 'persona' : 'personas'}</strong>
        de las que invitaste.
      </p>
    </td></tr>

    <tr><td style="background-color:#FFFFFF;padding:20px 32px 6px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${GOLD};border-radius:8px;">
        <tr><td style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">Tu mirada</p>
                <p style="margin:2px 0 0 0;font-size:26px;font-weight:bold;color:${NAVY};">${c.auto.total}</p>
              </td>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9CA3AF;">de ${c.maxTotal}</td>
              <td align="right" style="font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">Tu equipo</p>
                <p style="margin:2px 0 0 0;font-size:26px;font-weight:bold;color:${GOLD};">${c.totalTerceros}</p>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0 0;font-size:13px;line-height:20px;color:#4B5563;">${escapeHtml(lectura)}</p>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="background-color:#FFFFFF;padding:24px 32px 6px 32px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:${NAVY};">Pilar por pilar</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${filas}</table>
    </td></tr>

    ${
      c.puntoCiego || c.fortalezaOculta
        ? `<tr><td style="background-color:#FFFFFF;padding:10px 32px 6px 32px;">
            ${c.puntoCiego ? destacado('Dónde más se diferencian', c.puntoCiego, '#F59E0B') : ''}
            ${c.fortalezaOculta ? destacado('Te valoran más de lo que creés', c.fortalezaOculta, '#10B981') : ''}
          </td></tr>`
        : ''
    }

    ${boton(d.reportUrl, 'Ver mi informe completo')}`,
    'Tu informe comparativo',
  );
}

export function renderSin360(nombre: string): string {
  return marco(
    `<tr><td style="background-color:#FFFFFF;padding:30px 32px 30px 32px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 14px 0;font-size:16px;color:${NAVY};">Hola ${escapeHtml(nombre)},</p>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:22px;color:#4B5563;">
        Venció el plazo de tu evaluación 360° y ninguna de las personas que invitaste llegó a responder.
      </p>
      <p style="margin:0;font-size:14px;line-height:22px;color:#4B5563;">
        Si querés volver a intentarlo, escribinos y lo coordinamos.
      </p>
    </td></tr>`,
    'Tu evaluación 360°',
  );
}
