'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { answerChecklistItem } from '@/lib/server/checklist/actions';
import type { ActionResult } from '@/lib/validation';
import type {
  ChecklistItem,
  ChecklistRecordResponse,
} from '@/lib/server/checklist/types';
import { useActionToast } from '@/lib/hooks/use-action-toast';

const initialState: ActionResult = {};

export function AnswerItemRow({
  recordId,
  item,
  response,
  canAnswer,
}: {
  recordId: string;
  item: ChecklistItem;
  response?: ChecklistRecordResponse;
  canAnswer: boolean;
}) {
  const [answer, setAnswer] = useState<boolean | null>(
    response?.answer ?? null,
  );
  const action = async (
    _prev: ActionResult,
    formData: FormData,
  ): Promise<ActionResult> =>
    answerChecklistItem(
      recordId,
      item.id,
      answer === true,
      (formData.get('reason') as string) || undefined,
    );
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(pending, state, 'Answer saved.');

  const needsReason = answer === false && item.requires_reason_on_no;

  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1">{item.label}</span>
        {canAnswer ? (
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={answer === true ? 'default' : 'outline'}
              onClick={() => setAnswer(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              size="sm"
              variant={answer === false ? 'destructive' : 'outline'}
              onClick={() => setAnswer(false)}
            >
              No
            </Button>
          </div>
        ) : (
          <span
            className={cn(
              'text-sm font-medium',
              response?.answer === false && 'text-destructive',
            )}
          >
            {response ? (response.answer ? 'Yes' : 'No') : 'Not answered'}
          </span>
        )}
      </div>

      {canAnswer && answer !== null && (
        <form action={formAction} className="flex items-end gap-2">
          <Field className="flex-1" data-invalid={!!state.error && needsReason}>
            {needsReason && (
              <>
                <Textarea
                  name="reason"
                  rows={1}
                  placeholder="Reason (required for No)"
                  defaultValue={response?.reason ?? ''}
                  required
                />
                {state.error && <FieldError>{state.error}</FieldError>}
              </>
            )}
          </Field>
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            {pending ? 'Saving…' : response ? 'Update' : 'Save'}
          </Button>
        </form>
      )}

      {!canAnswer && response?.reason && (
        <p className="text-sm text-muted-foreground">
          Reason: {response.reason}
        </p>
      )}
    </li>
  );
}
