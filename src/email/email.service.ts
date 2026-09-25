import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { escapeHtml } from './escape-html';
import {
  renderStressTestResultEmail,
  StressTestResultEmailData,
} from './templates/stress-test-result.template';
import {
  renderStressTestLeadEmail,
  StressTestLeadEmailData,
} from './templates/stress-test-lead.template';
import {
  renderStressTestLeadText,
  renderStressTestResultText,
} from './templates/stress-test.text';

export interface SendResultEmailParams {
  to: string;
  fullName: string;
  roleName: string;
  alignmentPct: number;
  deviationLabel: string;
  categories: { name: string; alignmentPct: number }[];
}

/** Endpoint transaccional de Brevo. */
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Envío de emails vía Brevo (ex-Sendinblue), usando su API REST con el `fetch`
 * nativo de Node: la SDK oficial no aporta nada para un solo endpoint.
 *
 * Si no hay BREVO_API_KEY configurada el servicio no falla: registra una
 * advertencia y sigue (útil en desarrollo).
 *
 * El remitente debe estar verificado en Brevo (*Senders*); ver GCP_DEPLOY.md.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey?: string;
  private readonly from: { email: string; name: string };
  /** Casilla interna que recibe el aviso de cada lead nuevo. */
  private readonly leadsTo: string;
  /** Base pública del frontend, para los enlaces de los correos. */
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('BREVO_API_KEY');
    this.from = {
      email: this.config.get<string>('MAIL_FROM', 'servicios1@x-ray.ar'),
      name: this.config.get<string>('MAIL_FROM_NAME', 'X-Ray'),
    };
    this.leadsTo = this.config.get<string>(
      'LEADS_NOTIFICATION_EMAIL',
      'servicios1@x-ray.ar',
    );
    this.publicUrl = this.config
      .get<string>('PUBLIC_APP_URL', 'https://x-ray.ar')
      .replace(/\/+$/, '');
  }

  /** Enlace permanente al informe de un envío. */
  private reportUrl(submissionId: string): string {
    return `${this.publicUrl}/autoevaluacion/resultado/${submissionId}`;
  }

  /**
   * Envío genérico. Nunca propaga el error: los datos ya quedaron guardados
   * en la base y un fallo de correo no debe romper la respuesta al usuario.
   */
  private async send(msg: {
    to: string;
    subject: string;
    html: string;
    /** Alternativa en texto plano: baja el puntaje de spam del mensaje. */
    text?: string;
    replyTo?: string;
    attachments?: { name: string; content: Buffer }[];
  }): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(
        `BREVO_API_KEY ausente: se omite el email "${msg.subject}" a ${msg.to}`,
      );
      return false;
    }

    try {
      const res = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: this.from,
          to: [{ email: msg.to }],
          ...(msg.replyTo ? { replyTo: { email: msg.replyTo } } : {}),
          subject: msg.subject,
          htmlContent: msg.html,
          ...(msg.text ? { textContent: msg.text } : {}),
          // Brevo espera los adjuntos en base64.
          ...(msg.attachments?.length
            ? {
                attachment: msg.attachments.map((a) => ({
                  name: a.name,
                  content: a.content.toString('base64'),
                })),
              }
            : {}),
        }),
      });

      if (!res.ok) {
        // El cuerpo del error de Brevo trae el motivo real (remitente sin
        // verificar, key inválida, cuota agotada...).
        const detail = await res.text().catch(() => '');
        this.logger.error(
          `Brevo respondió ${res.status} al enviar a ${msg.to}: ${detail}`,
        );
        return false;
      }

      this.logger.log(`Email enviado a ${msg.to}: "${msg.subject}"`);
      return true;
    } catch (err) {
      this.logger.error(
        `Fallo al enviar email a ${msg.to}: ${(err as Error).message}`,
      );
      return false;
    }
  }

  // ── Stress Test (Fase 2) ──

  /** Devolución del Stress Test para quien lo completó. */
  async sendStressTestResult(
    data: StressTestResultEmailData & {
      submissionId?: string;
      pdf?: Buffer;
      pdfName?: string;
    },
  ): Promise<boolean> {
    const withUrl = {
      ...data,
      reportUrl: data.submissionId
        ? this.reportUrl(data.submissionId)
        : data.reportUrl,
    };
    return this.send({
      to: data.to,
      subject: `Tu diagnóstico X-Ray — ${data.nombreEmprendimiento}`,
      html: renderStressTestResultEmail(withUrl),
      text: renderStressTestResultText(withUrl),
      attachments: data.pdf
        ? [{ name: data.pdfName ?? 'informe-x-ray.pdf', content: data.pdf }]
        : undefined,
    });
  }

  /** Aviso interno a X-Ray por cada Stress Test completado. */
  async sendStressTestLead(
    data: StressTestLeadEmailData & { pdf?: Buffer; pdfName?: string },
  ): Promise<boolean> {
    const withUrl = { ...data, reportUrl: this.reportUrl(data.submissionId) };
    return this.send({
      to: this.leadsTo,
      replyTo: data.email,
      subject: `Nuevo lead Stress Test — ${data.nombreEmprendimiento} (${data.result.total}/${data.result.maxTotal})`,
      html: renderStressTestLeadEmail(withUrl),
      text: renderStressTestLeadText(withUrl),
      attachments: data.pdf
        ? [{ name: data.pdfName ?? 'informe-x-ray.pdf', content: data.pdf }]
        : undefined,
    });
  }

  // ── Autoevaluación de competencias (modelo anterior) ──

  async sendResultEmail(params: SendResultEmailParams): Promise<boolean> {
    return this.send({
      to: params.to,
      subject: 'Tus resultados — Autoevaluación de Competencias',
      html: this.renderResultHtml(params),
    });
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
