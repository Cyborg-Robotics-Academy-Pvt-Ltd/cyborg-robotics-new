"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { EMPTY_DRAFT } from "@/app/enquire-form/constants";
import { EditDraft, TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  target: TrialRegistration | null;
  onClose: () => void;
  onSave: (target: TrialRegistration, draft: EditDraft) => Promise<boolean>;
};

export function EditDialog({ target, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<EditDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!target) return;

    setDraft({
      studentName: target.studentName || "",
      age: String(target.age ?? ""),
      contactNumber: target.contactNumber || "",
      email: target.email || "",
      trialDate: target.trialDate || "",
      trialTime: target.trialTime || "",
      location: target.location || "",
    });
  }, [target]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!target) return;

    setSaving(true);

    const ok = await onSave(target, draft);

    setSaving(false);

    if (ok) onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border-none">
        <DialogHeader>
          <DialogTitle>Edit Registration</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* STUDENT */}

          <div className="grid gap-1.5">
            <Label htmlFor="studentName">Student Name</Label>

            <Input
              id="studentName"
              value={draft.studentName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, studentName: e.target.value }))
              }
            />
          </div>

          {/* AGE + CONTACT */}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="age">Age</Label>

              <Input
                id="age"
                type="number"
                inputMode="numeric"
                value={draft.age}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, age: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="contactNumber">Contact</Label>

              <Input
                id="contactNumber"
                value={draft.contactNumber}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, contactNumber: e.target.value }))
                }
              />
            </div>
          </div>

          {/* EMAIL */}

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
            />
          </div>

          {/* DATE + TIME */}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="trialDate">Trial Date</Label>

              <Input
                id="trialDate"
                value={draft.trialDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, trialDate: e.target.value }))
                }
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="trialTime">Trial Time</Label>

              <Input
                id="trialTime"
                value={draft.trialTime}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, trialTime: e.target.value }))
                }
                placeholder="e.g. 4:00 PM"
              />
            </div>
          </div>

          {/* LOCATION */}

          <div className="grid gap-1.5">
            <Label htmlFor="location">Location</Label>

            <Input
              id="location"
              value={draft.location}
              onChange={(e) =>
                setDraft((d) => ({ ...d, location: e.target.value }))
              }
              placeholder="e.g. Kharadi, Pune"
            />

            <p className="text-xs text-stone-400">
              Kalyani Nagar, Kharadi and Magarpatta are offline. Other locations
              are online.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
