import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export interface SendResultEmailParams {
  to: string;
  fullName: string;
  roleName: string;
  alignmentPct: number;
  deviationLabel: string;
  categories: { name: string; alignmentPct: number }[];
}

/**
 * Envío de emails vía SendGrid. Si no hay SENDGRID_API_KEY configurada, el
 * servicio no falla: registra una advertencia y sigue (útil en desarrollo).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly enabled: boolean;
  private readonly from: { email: string; name: string };

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    this.enabled = !!apiKey;
    if (this.enabled) {
      sgMail.setApiKey(apiKey as string);
    }
    this.from = {
      email: this.config.get<string>('MAIL_FROM', 'no-reply@x-ray.com.ar'),
      name: this.config.get<string>('MAIL_FROM_NAME', 'X-Ray Autoevaluacion'),
    };
  }

  async sendResultEmail(params: SendResultEmailParams): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn(
        `SENDGRID_API_KEY ausente: se omite el email de resultados a ${params.to}`,
      );
      return false;
    }

    try {
      await sgMail.send({
        to: params.to,
        from: this.from,
        subject: 'Tus resultados — Autoevaluación de Competencias',
        html: this.renderResultHtml(params),
      });
      return true;
    } catch (err) {
      // No propagamos el error: el resultado ya quedó guardado en la DB.
      this.logger.error(
        `Fallo al enviar email a ${params.to}: ${(err as Error).message}`,
      );
      return false;
    }
  }

  private renderResultHtml(p: SendResultEmailParams): string {
    const rows = p.categories
      .map(
        (c) =>
          `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(
            c.name,
          )}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${c.alignmentPct.toFixed(
            0,
          )}%</td></tr>`,
      )
      .join('');

    return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h2 style="color:#0f172a">Hola ${escapeHtml(p.fullName)},</h2>
      <p>Estos son los resultados de tu autoevaluación de competencias para el rol
        <strong>${escapeHtml(p.roleName)}</strong>.</p>
      <p style="font-size:20px"><strong>Alineación general: ${p.alignmentPct.toFixed(
        0,
      )}%</strong></p>
      <p>${escapeHtml(p.deviationLabel)}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0f172a">Categoría</th>
            <th style="text-align:right;padding:6px 12px;border-bottom:2px solid #0f172a">Alineación</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#64748b;font-size:12px;margin-top:24px">Este es un email automático. No respondas a esta casilla.</p>
    </div>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
