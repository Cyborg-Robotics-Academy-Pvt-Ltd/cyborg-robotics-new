"use client";

import React, { useEffect, useState } from "react";
import { History, Loader2, Plus } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

import { FollowUpEntry, TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  target: TrialRegistration | null;
  onClose: () => void;
  onSave: (
    target: TrialRegistration,
    entry: FollowUpEntry,
  ) => Promise<FollowUpEntry[] | null>;
};

export function FollowUpDialog({ target, onClose, onSave }: Props) {
  const { user } = useAuth();
  const [dateDraft, setDateDraft] = useState("");
  const [remarkDraft, setRemarkDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<FollowUpEntry[]>([]);

  useEffect(() => {
    if (!target) return;

    setDateDraft(target.nextFollowUpDate || "");
    setRemarkDraft("");
    setHistory(target.followUpHistory || []);
  }, [target]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!target) return;

    if (!dateDraft) {
      alert("Please pick a follow-up date.");
      return;
    }

    const entryToSave: FollowUpEntry = {
      date: dateDraft,
      createdAt: new Date().toISOString(),
      // Save the actor with the entry so historical activity remains accurate
      // after another account signs in.
      updatedBy:
        user?.displayName?.trim() ||
        user?.email?.split("@")[0] ||
        "Unknown user",
      updatedByEmail: user?.email || "",
      remark: remarkDraft.trim(),
      status: target.status,
      leadTemp: target.leadTemp,
      leadOutcome: target.leadOutcome,
      counsellorRemark: target.counsellorRemark,
      closeRemark: target.closeRemark,
    };

    setSaving(true);

    const updatedHistory = await onSave(target, entryToSave);

    setSaving(false);

    if (updatedHistory) {
      setHistory(updatedHistory);
      setRemarkDraft("");
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border-none">
        <DialogHeader>
          <DialogTitle>
            Follow-up {target ? `· ${target.studentName}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
            <Input
              id="nextFollowUpDate"
              type="date"
              value={dateDraft}
              onChange={(e) => setDateDraft(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="followUpRemark">Remark</Label>
            <Input
              id="followUpRemark"
              value={remarkDraft}
              onChange={(e) => setRemarkDraft(e.target.value)}
              placeholder="What was discussed / next step..."
            />
          </div>

          <div className="grid gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
              <History className="h-3.5 w-3.5" />
              Follow-up History
            </p>

            {history.length > 0 ? (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 p-3">
                {[...history].reverse().map((entry, index) => (
                  <div
                    key={`${entry.date}-${index}`}
                    className="rounded-md border border-stone-200 bg-white p-2"
                  >
                    <p className="text-xs font-medium tabular-nums text-stone-700">
                      {entry.date}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-sm",
                        entry.remark
                          ? "text-stone-600"
                          : "italic text-stone-400",
                      )}
                    >
                      {entry.remark || "No remark"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-3 text-sm italic text-stone-400">
                No follow-ups logged yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Close
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
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                Save Follow-up
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
