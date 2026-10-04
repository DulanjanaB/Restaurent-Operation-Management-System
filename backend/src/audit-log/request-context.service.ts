import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextData {
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

// Threads "who's making this request" into the TypeORM subscriber, which
// otherwise has no access to the HTTP request. See
// docs/audit-log-design.md#capture-mechanism--automatic-not-per-call.
@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContextData>();

  run<T>(data: RequestContextData, callback: () => T): T {
    return this.storage.run(data, callback);
  }

  get(): RequestContextData | undefined {
    return this.storage.getStore();
  }
}
