"use client";

import React from "react";
import { MobileCard } from "./MobileCard";
import { TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  registrations: TrialRegistration[];
  canModify: boolean;
  trainerView: boolean;
  marketingView: boolean;
  showContact: boolean;
  canAddTrialSlot: boolean;
  openTimelineId: string | null;
  onTimelineToggle: (id: string) => void;
  canDelete: boolean;
  onStatusChange: (id: string, status: string) => void;
  onSalesSelectedCenterChange: (id: string, center: string | null) => void;
  onLeadTempChange: (id: string, value: string) => void;
  onLeadOutcomeChange: (id: string, value: string) => void;
  onCounsellorRemarkSave: (id: string, value: string) => void;
  onCloseRemarkSave: (id: string, value: string) => void;
  onFollowUpClick: (registration: TrialRegistration) => void;
  onAddTrialSlot: (registration: TrialRegistration) => void;
  onSendTrialMeetingEmail: (id: string) => Promise<boolean>;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

export function MobileList({
  registrations,
  trainerView,
  marketingView,
  canModify,
  openTimelineId,
  onTimelineToggle,
  onStatusChange,
  ...cardHandlers
}: Props) {
  return (
    <div className="grid gap-3 md:hidden">
      {registrations.map((registration) => (
        <MobileCard
          key={registration.id}
          registration={registration}
          canModify={canModify}
          openTimelineId={openTimelineId}
          onTimelineToggle={onTimelineToggle}
          trainerView={trainerView}
          marketingView={marketingView}
          onStatusChange={onStatusChange}
          {...cardHandlers}
        />
      ))}
    </div>
  );
}
