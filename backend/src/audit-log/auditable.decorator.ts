const AUDITABLE_ENTITIES = new Set<Function>();

// Marks an entity class as tracked by AuditSubscriber. Add it to any
// entity you want automatically logged on create/update/delete — see
// docs/audit-log-design.md#capture-mechanism--automatic-not-per-call.
// Currently applied to the RBAC entities (User, Role, UserRole,
// UserPermission, RolePermission) and Branch/Setting as the concrete
// examples from the design doc; extend to any other entity the same way.
export function Auditable(): ClassDecorator {
  return (target: Function) => {
    AUDITABLE_ENTITIES.add(target);
  };
}

export function isAuditable(target: Function): boolean {
  return AUDITABLE_ENTITIES.has(target);
}
