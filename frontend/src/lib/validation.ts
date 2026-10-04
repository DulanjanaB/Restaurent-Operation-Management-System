import { ApiError, type ApiErrorBody } from './api/client';

export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

// NestJS's ValidationPipe messages look like "name should not be empty" or
// "email must be an email" — class-validator always leads with the
// property name. Best-effort map to a field so forms can show inline
// errors; anything unparseable falls back to the form-level `error`.
function messageToField(message: string): string | null {
  const match = message.match(/^([a-zA-Z0-9_.]+)\s/);
  return match ? match[1] : null;
}

export function describeApiError(error: unknown): ActionResult {
  if (!(error instanceof ApiError)) {
    throw error;
  }

  const body = error.body as ApiErrorBody | { message?: string } | null;
  const rawMessage = body && 'message' in body ? body.message : undefined;

  if (error.status === 400 && Array.isArray(rawMessage)) {
    const fieldErrors: Record<string, string> = {};
    const unmatched: string[] = [];
    for (const message of rawMessage) {
      const field = messageToField(message);
      if (field) fieldErrors[field] = message;
      else unmatched.push(message);
    }
    return {
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
      error: unmatched.length ? unmatched.join(', ') : undefined,
    };
  }

  if (typeof rawMessage === 'string') {
    return { error: rawMessage };
  }

  if (error.status === 403) {
    return { error: "You don't have permission to do that." };
  }
  if (error.status === 404) {
    return { error: 'Not found.' };
  }
  return { error: 'Something went wrong. Please try again.' };
}
