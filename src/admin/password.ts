import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;

/**
 * Hash de contraseñas con `scrypt` del propio Node.
 *
 * Se evita bcrypt/argon2 a propósito: traen binarios nativos que hay que
 * compilar en la imagen Alpine del contenedor. `scrypt` es parte de Node,
 * está diseñado para esto y no agrega dependencias.
 *
 * Formato: `scrypt$<salt en hex>$<hash en hex>`.
 */
export async function hashPassword(plano: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(plano, salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

/** Comparación en tiempo constante: una comparación normal filtra el hash. */
export async function verifyPassword(
  plano: string,
  almacenado: string,
): Promise<boolean> {
  const partes = almacenado.split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;

  const salt = Buffer.from(partes[1], 'hex');
  const esperado = Buffer.from(partes[2], 'hex');
  if (esperado.length !== KEYLEN) return false;

  const calculado = await scryptAsync(plano, salt, KEYLEN);
  return timingSafeEqual(calculado, esperado);
}
