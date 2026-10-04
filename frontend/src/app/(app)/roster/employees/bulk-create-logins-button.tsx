'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  bulkCreateLogins,
  type BulkLoginCreated,
} from '@/lib/server/roster/actions';

export function BulkCreateLoginsButton({
  branchId,
  missingCount,
}: {
  branchId: string;
  missingCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<BulkLoginCreated[] | null>(null);

  if (missingCount === 0) return null;

  function handleConfirm() {
    startTransition(async () => {
      const result = await bulkCreateLogins(branchId);
      if (result.error) {
        toast.error(result.error);
        setOpen(false);
        return;
      }
      setResults(result.created);
      if (result.failed > 0) {
        toast.error(
          `${result.failed} login${result.failed === 1 ? '' : 's'} failed to create.`,
        );
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResults(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          Create logins for {missingCount} employee
          {missingCount === 1 ? '' : 's'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {results === null ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Create a login for every employee without one?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Usernames are derived from employee codes; employees with no
                email on file get a placeholder address. Each generated password
                is shown exactly once, in a list here — write them down before
                closing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={(event) => {
                  event.preventDefault();
                  handleConfirm();
                }}
              >
                {pending ? 'Creating…' : 'Create logins'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {results.length} login{results.length === 1 ? '' : 's'} created
              </AlertDialogTitle>
              <AlertDialogDescription>
                These passwords won&apos;t be shown again — copy them to
                wherever you&apos;ll relay them from.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3 font-mono text-sm">
              {results.map((result) => (
                <div
                  key={result.username}
                  className="flex flex-wrap items-baseline gap-x-2"
                >
                  <span className="font-sans font-medium text-foreground">
                    {result.employeeName}
                  </span>
                  <span className="text-muted-foreground">
                    {result.username}
                  </span>
                  <span>{result.password}</span>
                </div>
              ))}
              {results.length === 0 && (
                <p className="font-sans text-sm text-muted-foreground">
                  None created — see the error toast for details.
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setOpen(false)}>
                Done
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
