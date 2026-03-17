import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT opcional: si hay token válido lo procesa y puebla req.user,
 * si no hay token (o es inválido) simplemente continúa sin rechazar la request.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // Sobreescribimos handleRequest para nunca lanzar error
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
