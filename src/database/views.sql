-- Vistas de consulta para el cliente (acceso directo por base de datos).
-- La cotización excluye un panel de administración visual: el cliente consulta
-- los resultados con estas vistas desde cualquier cliente SQL o Cloud SQL Studio.
--
-- Aplicar una vez creada la estructura de tablas (tras el primer arranque con
-- DB_SYNCHRONIZE=true o tras correr las migraciones):
--   psql "$DATABASE_URL" -f src/database/views.sql

-- Resumen: una fila por intento completado, con datos del participante.
CREATE OR REPLACE VIEW v_assessment_results AS
SELECT
  a.id                AS assessment_id,
  p.full_name         AS participante,
  p.email             AS email,
  r.name              AS rol_declarado,
  a.total_score       AS puntaje_total,
  a.max_score         AS puntaje_maximo,
  a.alignment_pct     AS alineacion_pct,
  CASE a.deviation
    WHEN 'aligned'  THEN 'Alineado'
    WHEN 'inferior' THEN 'Desvío hacia rol inferior'
    WHEN 'superior' THEN 'Desvío hacia rol superior'
  END                 AS desvio,
  p.wants_email_results AS pidio_email,
  a.completed_at      AS completado_el
FROM assessments a
JOIN participants p ON p.id = a.participant_id
JOIN roles r        ON r.id = a.declared_role_id
WHERE a.status = 'completed'
ORDER BY a.completed_at DESC;

-- Detalle: una fila por respuesta, para auditar qué eligió cada participante.
CREATE OR REPLACE VIEW v_assessment_answers AS
SELECT
  a.id            AS assessment_id,
  p.full_name     AS participante,
  p.email         AS email,
  c.name          AS categoria,
  q.situation     AS situacion,
  o.text          AS respuesta_elegida,
  ans.score_awarded AS puntaje_otorgado
FROM answers ans
JOIN assessments a ON a.id = ans.assessment_id
JOIN participants p ON p.id = a.participant_id
JOIN questions q   ON q.id = ans.question_id
JOIN categories c  ON c.id = q.category_id
JOIN options o     ON o.id = ans.option_id
ORDER BY a.id, c.sort_order, q.sort_order;
