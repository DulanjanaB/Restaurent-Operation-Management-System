'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { setRolePermissions } from '@/lib/server/administration/actions';
import type { Permission } from '@/lib/server/administration/types';

// One collapsible block per module, `.report` rendered as a plain checkbox
// inline with the rest of that module's permissions — not pulled into a
// separate "Reports" section (an explicit design-doc call-out, easy to get
// wrong). Full replace on save, matching SetRolePermissionsDto's contract.
export function PermissionChecklist({
  roleId,
  allPermissions,
  initialPermissionIds,
  readOnly,
}: {
  roleId: string;
  allPermissions: Permission[];
  initialPermissionIds: string[];
  readOnly: boolean;
}) {
  const [selected, setSelected] = useState(new Set(initialPermissionIds));
  const [pending, startTransition] = useTransition();

  const byModule = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of allPermissions) {
      const list = groups.get(permission.module) ?? [];
      list.push(permission);
      groups.set(permission.module, list);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const dirty =
    selected.size !== initialPermissionIds.length ||
    initialPermissionIds.some((id) => !selected.has(id));

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const result = await setRolePermissions(roleId, [...selected]);
      if (result?.error) toast.error(result.error);
      else toast.success('Permissions saved.');
    });
  }

  if (readOnly) {
    return (
      <p className="text-sm text-muted-foreground">
        This is a system role — its permissions are fixed and can&apos;t be
        edited.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {byModule.map(([module, permissions]) => {
        const moduleSelectedCount = permissions.filter((p) =>
          selected.has(p.id),
        ).length;
        return (
          <Collapsible key={module} defaultOpen={moduleSelectedCount > 0}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/50"
              >
                <span className="capitalize">{module.replace(/_/g, ' ')}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {moduleSelectedCount}/{permissions.length}
                  <ChevronDown className="size-4" />
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
              {permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <Checkbox
                    checked={selected.has(permission.id)}
                    onCheckedChange={(checked) =>
                      toggle(permission.id, checked === true)
                    }
                  />
                  <span>
                    <span className="font-medium">
                      {permission.resource
                        ? `${permission.resource}.${permission.action}`
                        : permission.action}
                    </span>
                    {permission.description && (
                      <span className="block text-xs text-muted-foreground">
                        {permission.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      <Button onClick={save} disabled={!dirty || pending}>
        {pending ? 'Saving…' : 'Save permissions'}
      </Button>
    </div>
  );
}
