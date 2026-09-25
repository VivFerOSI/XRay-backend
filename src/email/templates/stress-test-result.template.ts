import type { StressResult } from '../../stress-test/scoring';
import { escapeHtml } from '../escape-html';

export interface StressTestResultEmailData {
  /** Email de quien completó el test. */
  to: string;
  nombreContacto: string;
  nombreEmprendimiento: string;
  result: StressResult;
  /** Enlace permanente al informe completo (con radar y descarga en PDF). */
  reportUrl?: string;
}

const NAVY = '#0F1E3C';
const GOLD = '#C8922A';
const OFFWHITE = '#F7F5F0';
const WHATSAPP = 'https://wa.me/5491176766932';

/**
 * Color del semáforo por puntaje de pilar (5-25). Mismos cortes que
 * `bandColor` en el frontend, para que el mail y la pantalla coincidan.
 */
function bandColor(score: number): string {
  if (score >= 21) return '#10B981';
  if (score >= 16) return '#84CC16';
  if (score >= 11) return '#F59E0B';
  return '#F43F5E';
}

/**
 * Barra de progreso con tablas anidadas: los clientes de correo (Outlook)
 * no renderizan divs con ancho porcentual de forma confiable.
 */
function bar(score: number): string {
  const pct = Math.round((score / 25) * 100);
  const color = bandColor(score);
  const filled = `<td width="${pct}%" height="10" style="background-color:${color};border-radius:5px;font-size:0;line-height:0;">&nbsp;</td>`;
  const rest =
    pct >= 100
      ? ''
      : `<td width="${100 - pct}%" height="10" style="font-size:0;line-height:0;">&nbsp;</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E5E7EB;border-radius:5px;table-layout:fixed;"><tr>${filled}${rest}</tr></table>`;
}

/** Mail de devolución que recibe quien completó el Stress Test. */
export function renderStressTestResultEmail(
  d: StressTestResultEmailData,
): string {
  const r = d.result;

  const ctaText = `Hola, hice el Stress Test y mi resultado fue "${r.global.title}". Quiero conversar los próximos pasos.`;
  const ctaHref = `${WHATSAPP}?text=${encodeURIComponent(ctaText)}`;

  const semaforo = r.pilares
    .map(
      (p) => `
      <tr>
        <td style="padding:0 0 14px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${NAVY};padding-bottom:5px;">${escapeHtml(p.name)}</td>
              <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:${bandColor(p.score)};padding-bottom:5px;">${p.score}/25 &middot; ${escapeHtml(p.bandTitle)}</td>
            </tr>
          </table>
          ${bar(p.score)}
        </td>
      </tr>`,
    )
    .join('');

  const lectura = r.pilares
    .map(
      (p) => `
      <tr>
        <td style="padding:0 0 18px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;border-left:3px solid ${bandColor(p.score)};border-radius:4px;">
            <tr>
              <td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 6px 0;font-size:14px;font-weight:bold;color:${NAVY};">${escapeHtml(p.name)} &mdash; <span style="color:${bandColor(p.score)};">${escapeHtml(p.bandTitle)}</span></p>
                <p style="margin:0;font-size:13px;line-height:20px;color:#4B5563;">${escapeHtml(p.bandText)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tu diagn&oacute;stico X-Ray</title>
</head>
<body style="margin:0;padding:0;background-color:${OFFWHITE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${OFFWHITE};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

        <tr>
          <td style="background-color:${NAVY};border-radius:10px 10px 0 0;padding:28px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#FFFFFF;letter-spacing:1px;">X<span style="color:${GOLD};">-</span>RAY</p>
            <p style="margin:6px 0 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};">Stress Test de Robustez y Crecimiento</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#FFFFFF;padding:30px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 12px 0;font-size:16px;color:${NAVY};">Hola ${escapeHtml(d.nombreContacto)},</p>
            <p style="margin:0;font-size:14px;line-height:22px;color:#4B5563;">Este es el diagn&oacute;stico de <strong style="color:${NAVY};">${escapeHtml(d.nombreEmprendimiento)}</strong> seg&uacute;n tus respuestas al Stress Test.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#FFFFFF;padding:20px 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${GOLD};border-radius:8px;">
              <tr>
                <td style="padding:22px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="margin:0 0 4px 0;font-size:34px;font-weight:bold;color:${GOLD};">${r.total}<span style="font-size:16px;color:#9CA3AF;font-weight:normal;"> / ${r.maxTotal}</span></p>
                  <p style="margin:0 0 8px 0;font-size:17px;font-weight:bold;color:${NAVY};">${escapeHtml(r.global.title)}</p>
                  <p style="margin:0 0 10px 0;font-size:13px;font-weight:bold;color:${GOLD};">${escapeHtml(r.global.perfil)}</p>
                  <p style="margin:0;font-size:13px;line-height:20px;color:#4B5563;">${escapeHtml(r.global.text)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#FFFFFF;padding:26px 32px 6px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:${NAVY};">Sem&aacute;foro de pilares</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${semaforo}</table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#FFFFFF;padding:16px 32px 6px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 16px 0;font-size:16px;font-weight:bold;color:${NAVY};">Lectura por pilar</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${OFFWHITE};border-radius:6px;">
              <tr><td style="padding:16px 16px 0 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lectura}</table>
              </td></tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#FFFFFF;padding:24px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid ${GOLD};background-color:${OFFWHITE};border-radius:4px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 12px 0;font-size:13px;line-height:21px;color:#374151;">${escapeHtml(r.global.closing)}</p>
                  <p style="margin:0;font-size:13px;line-height:21px;color:#374151;">${escapeHtml(r.norteClosing)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="background-color:#FFFFFF;padding:24px 32px 32px 32px;">
            <a href="${ctaHref}" style="display:inline-block;background-color:${GOLD};color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:24px;">Agendar una conversaci&oacute;n</a>
            ${
              d.reportUrl
                ? `<p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                     <a href="${d.reportUrl}" style="color:${NAVY};">Ver mi informe completo</a>
                     <span style="color:#9CA3AF;"> &mdash; con el gr&aacute;fico por pilar y la descarga en PDF</span>
                   </p>`
                : ''
            }
          </td>
        </tr>

        <tr>
          <td style="background-color:${NAVY};border-radius:0 0 10px 10px;padding:22px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 5px 0;font-size:12px;color:rgba(255,255,255,0.75);">X-Ray &middot; Consultor&iacute;a organizacional</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);">
              <a href="https://x-ray.ar" style="color:${GOLD};text-decoration:none;">x-ray.ar</a> &nbsp;&middot;&nbsp;
              <a href="mailto:servicios1@x-ray.ar" style="color:${GOLD};text-decoration:none;">servicios1@x-ray.ar</a>
            </p>
            <p style="margin:12px 0 0 0;font-size:11px;line-height:16px;color:rgba(255,255,255,0.4);">Recib&iacute;s este mail porque completaste el Stress Test en x-ray.ar. Pod&eacute;s responder directamente si quer&eacute;s conversarlo.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
