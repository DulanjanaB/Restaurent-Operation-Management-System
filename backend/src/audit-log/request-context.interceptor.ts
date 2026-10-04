import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from './request-context.service';

// Runs AFTER guards (unlike middleware), so request.user — set by
// PermissionsGuard's JWT auth — is already available here. Wraps the rest
// of the request in AsyncLocalStorage so the audit subscriber can read who
// made the change, regardless of how deep in the call stack the actual
// database write happens.
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly requestContext: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return new Observable((subscriber) => {
      this.requestContext.run(
        {
          userId: user?.id ?? null,
          userName: user?.name ?? null,
          ipAddress: request.ip ?? null,
          userAgent: request.headers?.['user-agent'] ?? null,
        },
        () => {
          next.handle().subscribe(subscriber);
        },
      );
    });
  }
}
