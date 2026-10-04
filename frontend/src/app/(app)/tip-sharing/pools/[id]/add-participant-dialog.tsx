'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { toast } from 'sonner';
import { addParticipant } from '@/lib/server/tip-sharing/actions';
import type { Employee } from '@/lib/server/roster/types';

export function AddParticipantDialog({
  poolId,
  suggested,
  allEmployees,
}: {
  poolId: string;
  suggested: { id: string; name: string; employee_code: string }[];
  allEmployees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function submit(id: string) {
    startTransition(async () => {
      const result = await addParticipant(poolId, id);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success('Participant added.');
        setOpen(false);
        setEmployeeId('');
        setError(undefined);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add participant</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a participant</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          {suggested.length > 0 && (
            <Field>
              <FieldLabel>Suggested (present/late today)</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {suggested.map((employee) => (
                  <Button
                    key={employee.id}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => submit(employee.id)}
                  >
                    {employee.name}
                  </Button>
                ))}
              </div>
            </Field>
          )}
          <Field>
            <FieldLabel>Or choose any employee</FieldLabel>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button
            onClick={() => submit(employeeId)}
            disabled={pending || !employeeId}
          >
            {pending ? 'Adding…' : 'Add'}
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
