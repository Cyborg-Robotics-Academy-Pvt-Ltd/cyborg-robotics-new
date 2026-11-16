"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  History,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";

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
  onUpdate: (
    target: TrialRegistration,
    currentHistory: FollowUpEntry[],
    index: number,
    entry: FollowUpEntry,
  ) => Promise<FollowUpEntry[] | null>;
};

function formatRelativeDate(date: Date) {
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function formatUpdatedDate(createdAt?: string) {
  return createdAt ? formatRelativeDate(new Date(createdAt)) : null;
}

function formatFollowUpDate(dateString: string) {
  return formatRelativeDate(new Date(`${dateString}T00:00:00`));
}

export function FollowUpDialog({ target, onClose, onSave, onUpdate }: Props) {
  const { user } = useAuth();
  const [dateDraft, setDateDraft] = useState("");
  const [remarkDraft, setRemarkDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDateDraft, setEditDateDraft] = useState("");
  const [editRemarkDraft, setEditRemarkDraft] = useState("");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<FollowUpEntry[]>([]);

  useEffect(() => {
    if (!target) return;

    setDateDraft(target.nextFollowUpDate || "");
    setRemarkDraft("");
    setHistory(target.followUpHistory || []);
    setEditingIndex(null);
    setDateError("");
  }, [target]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!target) return;

    if (!dateDraft) {
      setDateError("Please pick a follow-up date.");
      return;
    }
    if (history.some((entry) => entry.date === dateDraft)) {
      setDateError("This student already has a follow-up on this date.");
      return;
    }
    setDateError("");

    const now = new Date().toISOString();
    const entryToSave: FollowUpEntry = {
      date: dateDraft,
      createdAt: now,
      updatedAt: now,
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

  const startEditing = (entry: FollowUpEntry, index: number) => {
    setEditingIndex(index);
    setEditDateDraft(entry.date);
    setEditRemarkDraft(entry.remark);
    setDateError("");
  };

  const handleUpdate = async () => {
    if (!target || editingIndex === null) return;
    if (!editDateDraft) {
      setDateError("Please pick a follow-up date.");
      return;
    }
    if (
      history.some(
        (entry, index) =>
          index !== editingIndex && entry.date === editDateDraft,
      )
    ) {
      setDateError("This student already has a follow-up on this date.");
      return;
    }
    setDateError("");

    const entryToUpdate: FollowUpEntry = {
      ...history[editingIndex],
      date: editDateDraft,
      remark: editRemarkDraft.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy:
        user?.displayName?.trim() ||
        user?.email?.split("@")[0] ||
        "Unknown user",
      updatedByEmail: user?.email || "",
    };

    setSaving(true);
    const updatedHistory = await onUpdate(
      target,
      history,
      editingIndex,
      entryToUpdate,
    );
    setSaving(false);

    if (updatedHistory) {
      setHistory(updatedHistory);
      setEditingIndex(null);
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
              aria-invalid={editingIndex === null && !!dateError}
              onChange={(e) => {
                setDateDraft(e.target.value);
                setDateError("");
              }}
            />
            {dateError && editingIndex === null && (
              <p className="text-xs text-red-600" role="alert">
                {dateError}
              </p>
            )}
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
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/80 p-3">
                {[...history].reverse().map((entry, index) => {
                  const originalIndex = history.length - 1 - index;
                  const isEditing = editingIndex === originalIndex;
                  const updatedDate = formatUpdatedDate(
                    entry.updatedAt || entry.createdAt,
                  );

                  return (
                    <div
                      key={`${entry.date}-${index}`}
                      className="rounded-lg border border-red-100 border-l-2 border-l-red-500 bg-white p-3 shadow-sm transition-colors hover:border-red-200 hover:border-l-red-600"
                    >
                      {isEditing ? (
                        <div className="grid gap-2">
                          <Input
                            aria-label="Edit remark"
                            value={editRemarkDraft}
                            onChange={(event) =>
                              setEditRemarkDraft(event.target.value)
                            }
                            placeholder="Remark"
                          />
                          <Input
                            aria-label="Edit follow-up date"
                            type="date"
                            value={editDateDraft}
                            aria-invalid={!!dateError}
                            onChange={(event) => {
                              setEditDateDraft(event.target.value);
                              setDateError("");
                            }}
                          />
                          {dateError && (
                            <p className="text-xs text-red-600" role="alert">
                              {dateError}
                            </p>
                          )}
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingIndex(null)}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleUpdate}
                              disabled={saving}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-1 h-4 w-4" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                              Remark
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Edit follow-up"
                              title="Edit remark and follow-up date"
                              className="h-7 w-7 shrink-0 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                startEditing(entry, originalIndex)
                              }
                              disabled={saving}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p
                            className={cn(
                              "mt-0.5 min-h-5 whitespace-pre-wrap break-words text-sm",
                              entry.remark
                                ? "text-stone-700"
                                : "italic text-stone-400",
                            )}
                          >
                            {entry.remark || "No remark"}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold tabular-nums text-red-800">
                              <CalendarDays className="h-3.5 w-3.5 text-red-600" />
                              Follow-up: {formatFollowUpDate(entry.date)}
                            </span>
                            {updatedDate && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold tabular-nums text-red-800">
                                <Clock3 className="h-3 w-3" />
                                Updated : {updatedDate}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-3 text-sm italic text-stone-400">
                No follow-ups logged yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button className="shadow-xl border-gray-300/20 border" onClick={handleClose} disabled={saving}>
            Close
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white"
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
