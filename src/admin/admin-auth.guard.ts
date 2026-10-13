import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

/** Protege las rutas del panel: exige un token emitido por `/admin/login`. */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization ?? '';
    const [tipo, token] = header.split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de acceso.');
    }
    try {
      (req as Request & { admin?: unknown }).admin =
        await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Sesión vencida o token inválido.');
    }
  }
}
