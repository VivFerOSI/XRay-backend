/**
 * Vuelca las definiciones de los cuestionarios a JSON, para armar desde ahí
 * el Excel que se le manda al cliente.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'z:/KLG/XRay/Development/Xray/XRay-backend/dist';
const { SEMILLAS } = require(path.join(BASE, 'stress-test/definitions'));

const salida = process.argv[2];
fs.writeFileSync(salida, JSON.stringify(SEMILLAS, null, 2), 'utf8');

for (const a of SEMILLAS) {
  const preguntas = a.pilares.reduce((n, p) => n + p.questions.length, 0);
  console.log(
    `${a.key.padEnd(16)} ${String(preguntas).padStart(3)} preguntas | ` +
      `${a.pilares.length} pilares | ${a.globalBands.length} niveles | ` +
      `${(a.cruces || []).length} cruces`,
  );
}
