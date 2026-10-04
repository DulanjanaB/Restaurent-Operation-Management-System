import { IsDefined } from 'class-validator';

export class UpsertSettingDto {
  // Deliberately untyped/unvalidated beyond "must be present" — a
  // setting's value shape varies by key (scalar for business_name, an
  // object for password_policy). See docs/settings-design.md.
  // @IsDefined() is required so the global ValidationPipe's `whitelist`
  // doesn't strip this field — class-validator only keeps properties that
  // carry at least one validator.
  @IsDefined()
  value: unknown;
}
