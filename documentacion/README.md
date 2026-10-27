# Documentación

`manual-panel.html` es la fuente del manual que se le entrega al cliente. El PDF
se genera desde ahí, sin dependencias: Chrome ya trae todo lo necesario.

```bash
chrome --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="Manual del panel - X-Ray.pdf" \
  "file:///<ruta absoluta>/manual-panel.html"
```

En Windows, el ejecutable está en
`C:\Program Files\Google\Chrome\Application\chrome.exe`.

Los comentarios `<!--CAPTURA:algo-->` marcan dónde van las capturas de pantalla
del panel, que todavía faltan.

## El job de los recordatorios

El 360° necesita que algo despierte el servicio una vez por día, porque Cloud
Run se apaga sin tráfico. Lo hace un job de Cloud Scheduler:

```
gcloud scheduler jobs describe xray-360-diario --location southamerica-east1 --project big-cargo-469201-r1
```

Corre a las 9 de la mañana de Argentina contra `POST /tareas/evaluacion-360`,
con la clave en la cabecera `x-tarea-clave`. Manda los recordatorios pendientes
y cierra las rondas vencidas; si no hay nada que hacer, responde
`{"recordatorios":0,"cerradas":0}`.
