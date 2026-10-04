'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { createEvent } from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type {
  Customer,
  EventPackage,
  EventType,
  Venue,
} from '@/lib/server/events/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function EventCreateDialog({
  branchId,
  eventTypes,
  customers,
  venues,
  packages,
}: {
  branchId: string;
  eventTypes: EventType[];
  customers: Customer[];
  venues: Venue[];
  packages: EventPackage[];
}) {
  const [open, setOpen] = useState(false);
  const action = createEvent.bind(null, branchId);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.event_type_id}>
              <FieldLabel htmlFor="event_type_id">Event type</FieldLabel>
              <Select name="event_type_id" required>
                <SelectTrigger id="event_type_id">
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.customer_id}>
              <FieldLabel htmlFor="customer_id">Customer</FieldLabel>
              <Select name="customer_id" required>
                <SelectTrigger id="customer_id">
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.venue_id}>
              <FieldLabel htmlFor="venue_id">Venue</FieldLabel>
              <Select name="venue_id" required>
                <SelectTrigger id="venue_id">
                  <SelectValue placeholder="Choose a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} ({venue.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="package_id">Package (optional)</FieldLabel>
              <Select name="package_id">
                <SelectTrigger id="package_id">
                  <SelectValue placeholder="No package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.event_date}>
              <FieldLabel htmlFor="event_date">Event date</FieldLabel>
              <Input id="event_date" name="event_date" type="date" required />
              <FieldError
                errors={
                  state.fieldErrors?.event_date
                    ? [{ message: state.fieldErrors.event_date }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.guest_count}>
              <FieldLabel htmlFor="guest_count">Guest count</FieldLabel>
              <Input
                id="guest_count"
                name="guest_count"
                type="number"
                min="1"
                step="1"
                required
              />
              <FieldError
                errors={
                  state.fieldErrors?.guest_count
                    ? [{ message: state.fieldErrors.guest_count }]
                    : []
                }
              />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create event'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
