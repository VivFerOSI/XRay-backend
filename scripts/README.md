# Scripts

## Exportar los cuestionarios a Excel

Arma un `.xlsx` con los tres cuestionarios tal como están publicados: afirmaciones,
devolución por banda, niveles globales, nortes, cruces y lectura general. Es lo que se le
manda al cliente cuando pide "la versión que está en línea".

```bash
npm run build
node scripts/exportar-definiciones.js definiciones.json
python scripts/exportar-cuestionarios-excel.py definiciones.json "Cuestionarios X-Ray.xlsx"
```

Necesita `openpyxl` (`pip install openpyxl`).

> ⚠️ Lee las **semillas del código**, no la base. Mientras el panel no esté publicado son lo
> mismo, pero en cuanto el cliente edite un cuestionario desde el panel va a haber diferencia:
> ahí hay que exportar desde `assessment_definitions` en lugar de `definitions/`.
