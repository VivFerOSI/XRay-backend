import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Apaga el panel completo según `ADMIN_PANEL_ENABLED`.
 *
 * El código del panel se despliega junto con el resto, pero cada parte se
 * publica en su fase: con el interruptor en false las rutas responden 404,
 * como si no existieran. Se usa 404 y no 403 a propósito: un 403 confirmaría
 * que el panel está ahí.
 */
@Injectable()
export class PanelHabilitadoGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(): boolean {
    const habilitado =
      this.config.get<string>('ADMIN_PANEL_ENABLED', 'false') === 'true';
    if (!habilitado) throw new NotFoundException();
    return true;
  }
}
