import PDFDocument from 'pdfkit';
import type { StressResult } from '../stress-test/scoring';

export interface StressTestPdfData {
  nombreEmprendimiento: string;
  nombreContacto: string;
  result: StressResult;
  fecha?: Date;
  /** Enlace al informe web, se imprime en el pie. */
  reportUrl?: string;
}

const NAVY = '#0F1E3C';
const GOLD = '#C8922A';
const GREY = '#6B7280';
const TEXT = '#374151';
const LINE = '#E5E7EB';

const PAGE_MARGIN = 48;

/** Mismos cortes de semáforo que el mail y la pantalla. */
function bandColor(score: number): string {
  if (score >= 21) return '#10B981';
  if (score >= 16) return '#84CC16';
  if (score >= 11) return '#F59E0B';
  return '#F43F5E';
}

/**
 * Informe del Stress Test en PDF, adjunto a los correos.
 *
 * Se dibuja con pdfkit en vez de renderizar el HTML con un navegador: meter
 * Chromium en la imagen de Cloud Run la infla y empeora los cold starts, y acá
 * el contenido es simple (texto, barras y un radar de 5 vértices).
 *
 * Usa Helvetica, la fuente que pdfkit trae embebida: las de la marca (Playfair
 * e Inter) vendrían de Google Fonts y habría que versionar los .ttf.
 */
export function buildStressTestPdf(d: StressTestPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: PAGE_MARGIN,
      info: {
        Title: `Stress Test — ${d.nombreEmprendimiento}`,
        Author: 'X-Ray',
        Subject: 'Stress Test de Robustez y Crecimiento',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const r = d.result;
    const width = doc.page.width - PAGE_MARGIN * 2;

    // ── Encabezado ──
    doc.rect(0, 0, doc.page.width, 96).fill(NAVY);
    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('X', PAGE_MARGIN, 30, { continued: true })
      .fillColor(GOLD)
      .text('-', { continued: true })
      .fillColor('#FFFFFF')
      .text('RAY');
    doc
      .fillColor(GOLD)
      .font('Helvetica')
      .fontSize(9)
      .text('STRESS TEST DE ROBUSTEZ Y CRECIMIENTO', PAGE_MARGIN, 60, {
        characterSpacing: 1.5,
      });

    doc.y = 124;

    // ── Datos del informe ──
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(d.nombreEmprendimiento, PAGE_MARGIN, doc.y);
    doc
      .fillColor(GREY)
      .font('Helvetica')
      .fontSize(9)
      .text(
        `${d.nombreContacto} · ${(d.fecha ?? new Date()).toLocaleDateString('es-AR')}`,
        { paragraphGap: 14 },
      );

    // ── Puntaje global ──
    const boxY = doc.y;
    doc.roundedRect(PAGE_MARGIN, boxY, width, 118, 6).lineWidth(1).stroke(GOLD);
    doc
      .fillColor(GOLD)
      .font('Helvetica-Bold')
      .fontSize(30)
      .text(`${r.total}`, PAGE_MARGIN + 18, boxY + 16, { continued: true })
      .fillColor(GREY)
      .font('Helvetica')
      .fontSize(13)
      .text(` / ${r.maxTotal}`);
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(r.global.title, PAGE_MARGIN + 18, boxY + 54, { width: width - 36 });
    doc
      .fillColor(GOLD)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(r.global.perfil, PAGE_MARGIN + 18, doc.y + 2, {
        width: width - 36,
      });
    doc
      .fillColor(TEXT)
      .font('Helvetica')
      .fontSize(9)
      .text(r.global.text, PAGE_MARGIN + 18, doc.y + 4, {
        width: width - 36,
        lineGap: 1.5,
      });

    doc.y = boxY + 136;

    // ── Radar + barras ──
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Semáforo de pilares', PAGE_MARGIN, doc.y, { paragraphGap: 10 });

    const radarTop = doc.y;
    drawRadar(doc, r, PAGE_MARGIN + width / 2, radarTop + 108, 92);
    doc.y = radarTop + 232;

    for (const p of r.pilares) {
      const y = doc.y;
      doc
        .fillColor(NAVY)
        .font('Helvetica')
        .fontSize(9.5)
        .text(p.name, PAGE_MARGIN, y);
      doc
        .fillColor(bandColor(p.score))
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(`${p.score}/25 · ${p.bandTitle}`, PAGE_MARGIN, y, {
          width,
          align: 'right',
        });
      const barY = y + 14;
      doc.roundedRect(PAGE_MARGIN, barY, width, 7, 3.5).fill(LINE);
      doc
        .roundedRect(PAGE_MARGIN, barY, (width * p.score) / 25, 7, 3.5)
        .fill(bandColor(p.score));
      doc.y = barY + 19;
    }

    // ── Lectura por pilar ──
    doc.addPage();
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Lectura por pilar', PAGE_MARGIN, PAGE_MARGIN, { paragraphGap: 12 });

    for (const p of r.pilares) {
      const startY = doc.y;
      doc
        .fillColor(NAVY)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${p.name} — `, PAGE_MARGIN + 12, startY, { continued: true })
        .fillColor(bandColor(p.score))
        .text(p.bandTitle);
      doc
        .fillColor(TEXT)
        .font('Helvetica')
        .fontSize(9)
        .text(p.bandText, PAGE_MARGIN + 12, doc.y + 3, {
          width: width - 12,
          lineGap: 1.5,
        });
      // Barra vertical de color a la izquierda del bloque.
      doc.rect(PAGE_MARGIN, startY, 3, doc.y - startY).fill(bandColor(p.score));
      doc.y += 16;
    }

    // ── Cierre ──
    doc.y += 6;
    const cierreY = doc.y;
    doc
      .fillColor(TEXT)
      .font('Helvetica')
      .fontSize(9.5)
      .text(r.global.closing, PAGE_MARGIN + 14, cierreY, {
        width: width - 14,
        lineGap: 2,
        paragraphGap: 8,
      });
    doc.text(r.norteClosing, { width: width - 14, lineGap: 2 });
    doc.rect(PAGE_MARGIN, cierreY, 3, doc.y - cierreY).fill(GOLD);

    // ── Pie ──
    doc.y += 24;
    doc
      .moveTo(PAGE_MARGIN, doc.y)
      .lineTo(PAGE_MARGIN + width, doc.y)
      .lineWidth(0.5)
      .stroke(LINE);
    doc
      .fillColor(GREY)
      .font('Helvetica')
      .fontSize(8)
      .text('X-Ray · Consultoría organizacional · x-ray.ar', PAGE_MARGIN, doc.y + 10);
    if (d.reportUrl) {
      doc.fillColor(GOLD).text(d.reportUrl, { link: d.reportUrl });
    }

    doc.end();
  });
}

/** Radar de los 5 pilares, equivalente al `PilarRadar` del frontend. */
function drawRadar(
  doc: PDFKit.PDFDocument,
  r: StressResult,
  cx: number,
  cy: number,
  radius: number,
): void {
  const n = r.pilares.length;
  const angle = (i: number) => (-90 + i * (360 / n)) * (Math.PI / 180);
  const point = (i: number, rad: number): [number, number] => [
    cx + rad * Math.cos(angle(i)),
    cy + rad * Math.sin(angle(i)),
  ];

  const polygon = (pts: [number, number][]) => {
    doc.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) doc.lineTo(x, y);
    doc.closePath();
  };

  // Grilla concéntrica.
  for (const ring of [5, 10, 15, 20, 25]) {
    polygon(r.pilares.map((_, i) => point(i, (ring / 25) * radius)));
    doc.lineWidth(0.5).stroke('#D1D5DB');
  }
  // Ejes.
  for (let i = 0; i < n; i++) {
    const [x, y] = point(i, radius);
    doc.moveTo(cx, cy).lineTo(x, y).lineWidth(0.5).stroke('#D1D5DB');
  }
  // Área de datos.
  polygon(r.pilares.map((p, i) => point(i, (p.score / 25) * radius)));
  doc.fillOpacity(0.22).fill(GOLD);
  doc.fillOpacity(1);
  polygon(r.pilares.map((p, i) => point(i, (p.score / 25) * radius)));
  doc.lineWidth(1.5).stroke(GOLD);
  // Vértices.
  for (let i = 0; i < n; i++) {
    const [x, y] = point(i, (r.pilares[i].score / 25) * radius);
    doc.circle(x, y, 2.5).fill(GOLD);
  }
  // Etiquetas: la primera palabra del pilar, como en el radar de la web.
  doc.font('Helvetica').fontSize(7.5).fillColor('#4B5563');
  for (let i = 0; i < n; i++) {
    const [x, y] = point(i, radius + 16);
    const label = r.pilares[i].name.split(' ')[0];
    doc.text(label, x - 34, y - 4, { width: 68, align: 'center' });
  }
}
