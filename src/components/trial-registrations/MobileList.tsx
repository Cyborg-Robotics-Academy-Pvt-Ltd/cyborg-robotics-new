"use client";

import React from "react";
import { MobileCard } from "./MobileCard";
import { TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  registrations: TrialRegistration[];
  onStatusChange: (id: string, status: string) => void;
  onLeadTempChange: (id: string, value: string) => void;
  onLeadOutcomeChange: (id: string, value: string) => void;
  onCounsellorRemarkSave: (id: string, value: string) => void;
  onCloseRemarkSave: (id: string, value: string) => void;
  onFollowUpClick: (registration: TrialRegistration) => void;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

export function MobileList({ registrations, ...cardHandlers }: Props) {
  return (
    <div className="grid gap-3 md:hidden">
      {registrations.map((registration) => (
        <MobileCard
          key={registration.id}
          registration={registration}
          {...cardHandlers}
        />
      ))}
    </div>
  );
}
