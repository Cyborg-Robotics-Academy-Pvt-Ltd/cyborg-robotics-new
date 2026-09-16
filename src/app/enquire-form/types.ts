export type LocationType = "online" | "offline";

/**
 * Trial Status
 *
 * Whether the trial was booked,
 * attended, missed, moved, or
 * cancelled.
 */
export type TrialStatus = "booked" | "show" | "no-show" | "reschedule" | "cancelled";

/**
 * Lead Temp
 *
 * How warm the lead currently is.
 */
export type LeadTemp = "" | "hot" | "warm" | "cold";

/**
 * Lead Outcome
 *
 * Where the lead currently stands
 * in the funnel.
 */
export type LeadOutcome = "" | "opened" | "closed" | "nurture" | "later";

/**
 * A single logged follow-up.
 *
 * `remark` is the note for this specific follow-up. The rest are a
 * snapshot of the registration's state at the moment the follow-up
 * was logged — captured because status/leadTemp/leadOutcome/remarks
 * are overwritten in place on the registration itself, so without
 * this snapshot there'd be no way to see what they were at the time.
 */
export type FollowUpEntry = {
  date: string;
  createdAt?: string;
  /** The authenticated account that saved this follow-up. */
  updatedBy?: string;
  updatedByEmail?: string;
  remark: string;
  status?: TrialStatus;
  leadTemp?: LeadTemp;
  leadOutcome?: LeadOutcome;
  counsellorRemark?: string;
  closeRemark?: string;
};

export type TrialRegistration = {
  id: string;

  studentName: string;
  age: number;
  contactNumber: string;
  email: string;

  trialDate: string;
  trialTime: string;

  /**
   * Actual location entered by the user.
   *
   * Examples:
   * "Wagholi, Pune"
   * "Kharadi"
   * "Pune"
   */
  location: string;

  /**
   * Backend calculated mode.
   */
  trialMode: LocationType;

  /**
   * Backend calculated center ID.
   */
  locationId: string | null;

  /**
   * Backend calculated offline center name.
   */
  locationName: string;

  /**
   * Trial Status.
   *
   * booked / show / no-show / reschedule / cancelled
   */
  status: TrialStatus;

  remark: string;

  /**
   * Only meaningful when status === "show".
   */
  counsellorRemark: string;

  /**
   * Hot / Warm / Cold.
   */
  leadTemp: LeadTemp;

  /**
   * Next scheduled follow-up date (YYYY-MM-DD).
   */
  nextFollowUpDate: string;

  /**
   * History of logged follow-ups.
   */
  followUpHistory: FollowUpEntry[];

  /**
   * Opened / Closed / Nurture / Later.
   */
  leadOutcome: LeadOutcome;

  /**
   * Only meaningful when leadOutcome === "closed".
   */
  closeRemark: string;

  dateOfRegistration: string;
};

/* =========================================================
   SORT / FILTER TYPES
========================================================= */

export type SortField = "studentName" | "trialDate";
export type SortDir = "asc" | "desc";

export type LocationFilter = "all" | "online" | "offline";
export type LeadTempFilter = "all" | LeadTemp;
export type LeadOutcomeFilter = "all" | LeadOutcome;

export type EditDraft = {
  studentName: string;
  age: string;
  contactNumber: string;
  email: string;
  trialDate: string;
  trialTime: string;
  location: string;
};
