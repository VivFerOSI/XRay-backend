-- Migración 001 — motor multicuestionario, panel y evaluación 360°
--
-- Producción corre con DB_SYNCHRONIZE=false: las tablas no se crean solas.
-- Hay que ejecutar esto ANTES de desplegar el backend nuevo.
-- Todo es idempotente (IF NOT EXISTS), así que se puede repetir sin romper nada.
--
--   gcloud sql connect <instancia> --user=postgres --database=xray
--   \i 001-motor-panel-360.sql
--
-- `assessment_definitions` se siembra sola al arrancar el backend: alcanza con
-- crearla vacía.
--
-- ⚠️ Antes de correrla, comprobar la versión del servidor:
--
--   SHOW server_version;
--
-- Las tablas nuevas usan `gen_random_uuid()`, que recién es nativa en
-- PostgreSQL 13. En una versión anterior hay que habilitar la extensión antes:
--
--   CREATE EXTENSION IF NOT EXISTS pgcrypto;
--
-- (La tabla vieja `stress_test_submissions` usa `uuid_generate_v4()`, de la
-- extensión uuid-ossp, que ya está habilitada. Son mecanismos distintos y por
-- eso no alcanza con que esa tabla funcione.)

ALTER TABLE stress_test_submissions
  ADD COLUMN IF NOT EXISTS assessment_key varchar NOT NULL DEFAULT 'emprendimiento';

CREATE TABLE IF NOT EXISTS assessment_definitions (
  key         varchar PRIMARY KEY,
  definition  jsonb NOT NULL,
  activo      boolean NOT NULL DEFAULT true,
  orden       integer NOT NULL DEFAULT 0,
  updated_at  timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluaciones_360 (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamp NOT NULL DEFAULT now(),
  submission_id      uuid NOT NULL REFERENCES stress_test_submissions(id) ON DELETE CASCADE,
  assessment_key     varchar NOT NULL,
  vence_el           timestamp NOT NULL,
  estado             varchar NOT NULL DEFAULT 'abierta',
  informe_enviado_el timestamp
);
CREATE INDEX IF NOT EXISTS ix_360_submission ON evaluaciones_360(submission_id);
CREATE INDEX IF NOT EXISTS ix_360_estado ON evaluaciones_360(estado, vence_el);

CREATE TABLE IF NOT EXISTS evaluadores_360 (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ronda_id            uuid NOT NULL REFERENCES evaluaciones_360(id) ON DELETE CASCADE,
  nombre              varchar NOT NULL,
  email               varchar NOT NULL,
  token               varchar NOT NULL UNIQUE,
  estado              varchar NOT NULL DEFAULT 'pendiente',
  answers             jsonb,
  respondio_el        timestamp,
  recordatorios       integer NOT NULL DEFAULT 0,
  ultimo_recordatorio timestamp,
  created_at          timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_evaluadores_ronda ON evaluadores_360(ronda_id);
CREATE INDEX IF NOT EXISTS ix_evaluadores_token ON evaluadores_360(token);
