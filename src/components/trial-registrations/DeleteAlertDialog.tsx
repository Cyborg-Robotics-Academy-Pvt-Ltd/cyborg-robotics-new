"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  target: TrialRegistration | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
};

export function DeleteAlertDialog({ target, onClose, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!target) return;

    setDeleting(true);

    const ok = await onConfirm(target.id);

    setDeleting(false);

    if (ok) onClose();
  };

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete registration?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-stone-900">
              {target?.studentName}
            </span>
            &apos;s free trial registration. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-white" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
