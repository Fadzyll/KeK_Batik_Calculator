"use client";

import { useFormStatus } from "react-dom";

function Inner({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-danger"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("Delete this? This can't be undone.")) e.preventDefault();
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}

/** A small form that calls a server action with a hidden id after confirming. */
export function DeleteButton({
  action,
  id,
  label = "Delete",
  extra,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  extra?: Record<string, string>;
}) {
  return (
    <form action={action} autoComplete="off" className="inline">
      <input type="hidden" name="id" value={id} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Inner label={label} />
    </form>
  );
}
