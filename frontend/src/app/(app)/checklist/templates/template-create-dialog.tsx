'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { X } from 'lucide-react';
import { createChecklistTemplate } from '@/lib/server/checklist/actions';
import type { ActionResult } from '@/lib/validation';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function TemplateCreateDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = useState(false);
  const action = createChecklistTemplate.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);
  const [lines, setLines] = useState([0]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Template</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New checklist template</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" name="name" required />
              <FieldError
                errors={
                  state.fieldErrors?.name
                    ? [{ message: state.fieldErrors.name }]
                    : []
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="area">Area</FieldLabel>
              <Input id="area" name="area" placeholder="e.g. Kitchen, Bar" />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea id="description" name="description" rows={2} />
            </Field>

            <div className="space-y-2">
              <FieldLabel>
                Items{' '}
                <span className="font-normal text-muted-foreground">
                  (in order)
                </span>
              </FieldLabel>
              {lines.map((lineKey, index) => (
                <div key={lineKey} className="flex items-center gap-2">
                  <span className="w-5 text-sm text-muted-foreground">
                    {index + 1}.
                  </span>
                  <Input
                    name="item_label"
                    placeholder="Checklist question"
                    className="flex-1"
                  />
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setLines((prev) => prev.filter((k) => k !== lineKey))
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLines((prev) => [...prev, Date.now()])}
              >
                Add item
              </Button>
              <p className="text-xs text-muted-foreground">
                Every item defaults to requiring a reason on &quot;No&quot; —
                adjust that per-item after creating the template.
              </p>
            </div>

            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create template'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
