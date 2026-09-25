import type { StressResult } from '../../stress-test/scoring';
import { escapeHtml } from '../escape-html';

export interface StressTestLeadEmailData {
  submissionId: string;
  nombreEmprendimiento: string;
  sector: string;
  antiguedad: string;
  tamanoEquipo: string;
  nombreContacto: string;
  email: string;
  telefono: string | null;
  norteLabel: string;
  result: StressResult;
  /** Enlace permanente al informe completo que vio el participante. */
  reportUrl?: string;
}

const NAVY = '#0F1E3C';
const GOLD = '#C8922A';
const OFFWHITE = '#F7F5F0';

function bandColor(score: number): string {
  if (score >= 21) return '#10B981';
  if (score >= 16) return '#84CC16';
  if (score >= 11) return '#F59E0B';
  return '#F43F5E';
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B7280;width:150px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${NAVY};font-weight:bold;">${value}</td>
    </tr>`;
}

/** Fecha y hora en zona horaria de Buenos Aires. */
function formatFecha(date: Date): string {
  return date.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/** Aviso interno a X-Ray por cada Stress Test completado (nuevo lead). */
export function renderStressTestLeadEmail(d: StressTestLeadEmailData): string {
  const r = d.result;

  // El pilar con menor puntaje: es el gancho para la conversación comercial.
  const masFlojo = r.pilares.reduce((min, p) => (p.score < min.score ? p : min));

  const pilares = r.pilares
    .map(
      (p) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${NAVY};">${escapeHtml(p.name)}</td>
        <td align="right" style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:${bandColor(p.score)};">${p.score}/25</td>
        <td align="right" style="padding:6px 0 6px 12px;border-bottom:1px solid #E5E7EB;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B7280;">${escapeHtml(p.bandTitle)}</td>
      </tr>`,
    )
    .join('');

  const telefonoHtml = d.telefono
    ? `<a href="tel:${escapeHtml(d.telefono)}" style="color:${NAVY};">${escapeHtml(d.telefono)}</a> &nbsp;<a href="https://wa.me/${escapeHtml(d.telefono.replace(/[^0-9]/g, ''))}" style="color:${GOLD};font-weight:normal;font-size:12px;">(WhatsApp)</a>`
    : '<span style="color:#9CA3AF;font-weight:normal;">no dej&oacute; tel&eacute;fono</span>';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nuevo lead &mdash; Stress Test</title>
</head>
<body style="margin:0;padding:0;background-color:${OFFWHITE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${OFFWHITE};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:10px;">

        <tr>
          <td style="background-color:${NAVY};border-radius:10px 10px 0 0;padding:22px 28px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};">Nuevo lead &middot; Stress Test</p>
            <p style="margin:0;font-size:19px;font-weight:bold;color:#FFFFFF;">${escapeHtml(d.nombreEmprendimiento)}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 28px 8px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${OFFWHITE};border-radius:6px;">
              <tr>
                <td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="margin:0 0 4px 0;font-size:26px;font-weight:bold;color:${GOLD};">${r.total}<span style="font-size:14px;color:#9CA3AF;font-weight:normal;"> / ${r.maxTotal}</span></p>
                  <p style="margin:0 0 4px 0;font-size:15px;font-weight:bold;color:${NAVY};">${escapeHtml(r.global.title)}</p>
                  <p style="margin:0;font-size:12px;font-weight:bold;color:${GOLD};">${escapeHtml(r.global.perfil)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 28px 4px 28px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;color:${NAVY};text-transform:uppercase;letter-spacing:1px;">Contacto</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${row('Nombre', escapeHtml(d.nombreContacto))}
              ${row('Email', `<a href="mailto:${escapeHtml(d.email)}" style="color:${NAVY};">${escapeHtml(d.email)}</a>`)}
              ${row('Teléfono', telefonoHtml)}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 28px 4px 28px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;color:${NAVY};text-transform:uppercase;letter-spacing:1px;">Emprendimiento</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${row('Sector', escapeHtml(d.sector))}
              ${row('Antigüedad', escapeHtml(d.antiguedad))}
              ${row('Equipo', escapeHtml(d.tamanoEquipo))}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 28px 4px 28px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 10px 0;font-size:13px;font-weight:bold;color:${NAVY};text-transform:uppercase;letter-spacing:1px;">Puntajes por pilar</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${pilares}</table>
            <p style="margin:12px 0 0 0;font-size:13px;line-height:20px;color:#374151;">Punto m&aacute;s d&eacute;bil: <strong style="color:${bandColor(masFlojo.score)};">${escapeHtml(masFlojo.name)}</strong> (${masFlojo.score}/25 &middot; ${escapeHtml(masFlojo.bandTitle)}).</p>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 28px 24px 28px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;color:${NAVY};text-transform:uppercase;letter-spacing:1px;">Norte de liderazgo</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid ${GOLD};background-color:${OFFWHITE};border-radius:4px;">
              <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#374151;">${escapeHtml(d.norteLabel)}</td></tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #E5E7EB;padding:16px 28px 22px 28px;font-family:Arial,Helvetica,sans-serif;">
            ${
              d.reportUrl
                ? `<p style="margin:0 0 10px 0;font-size:13px;"><a href="${d.reportUrl}" style="color:${NAVY};font-weight:bold;">Ver el informe completo &rarr;</a></p>`
                : ''
            }
            <p style="margin:0;font-size:11px;color:#9CA3AF;">${escapeHtml(formatFecha(new Date()))} &nbsp;&middot;&nbsp; ID ${escapeHtml(d.submissionId)}</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
