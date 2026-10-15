export interface CodefestRegistrationFormData {
  fullName: string;
  institutionName: string;
  dateOfBirth: string;
  cityState: string;
  fullResidentialAddress: string;
  emailAddress: string;
  parentGuardianContactNumber: string;
  emergencyContactNumber?: string;
  preferredCodingPlatform?: string;
  agreedToTerms: boolean;
}

export type CodefestRegistrationFormErrors = Partial<
  Record<keyof CodefestRegistrationFormData, string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,}$/;

export const CODEFEST_COMPETITION = {
  key: "codefest-competition",
  name: "CodeFest 1.0 python Competition",
  baseAmount: 499,
  gstPercent: 18,
  get gstAmount() {
    return Math.round(this.baseAmount * (this.gstPercent / 100));
  },
  get amount() {
    return this.baseAmount + this.gstAmount;
  },
  get priceLabel() {
    return `₹${this.baseAmount} + GST (${this.gstPercent}%)`;
  },
} as const;

export function generateCompetitionHallTicketNumber(orderId: string): string {
  const compactOrderId = orderId.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `CF-${compactOrderId.slice(-8)}`;
}

export function normalizeCodefestRegistrationForm(
  formData: CodefestRegistrationFormData,
): CodefestRegistrationFormData {
  return {
    fullName: formData.fullName.replace(/\s+/g, " ").trim(),
    institutionName: formData.institutionName.replace(/\s+/g, " ").trim(),
    dateOfBirth: formData.dateOfBirth.trim(),
    cityState: formData.cityState.replace(/\s+/g, " ").trim(),
    fullResidentialAddress: formData.fullResidentialAddress
      .replace(/\s+/g, " ")
      .trim(),
    emailAddress: formData.emailAddress.trim(),
    parentGuardianContactNumber: formData.parentGuardianContactNumber
      .replace(/\D/g, "")
      .slice(0, 10),
    emergencyContactNumber: formData.emergencyContactNumber
      ? formData.emergencyContactNumber.replace(/\D/g, "").slice(0, 10)
      : "",
    preferredCodingPlatform: (formData.preferredCodingPlatform ?? "").trim(),
    agreedToTerms: Boolean(formData.agreedToTerms),
  };
}

export function validateCodefestRegistrationForm(
  formData: CodefestRegistrationFormData,
): CodefestRegistrationFormErrors {
  const data = normalizeCodefestRegistrationForm(formData);
  const errors: CodefestRegistrationFormErrors = {};

  if (!data.fullName) {
    errors.fullName = "Participant name is required.";
  } else if (!NAME_REGEX.test(data.fullName)) {
    errors.fullName = "Enter the participant's full name.";
  }

  if (!data.institutionName) {
    errors.institutionName = "Institution name is required.";
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.dateOfBirth);
    const dateOfBirth = dateMatch
      ? new Date(
          Date.UTC(
            Number(dateMatch[1]),
            Number(dateMatch[2]) - 1,
            Number(dateMatch[3]),
          ),
        )
      : null;
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const isValidDate =
      dateOfBirth !== null &&
      !Number.isNaN(dateOfBirth.getTime()) &&
      dateOfBirth.toISOString().slice(0, 10) === data.dateOfBirth;

    if (!isValidDate || data.dateOfBirth > todayString) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    }
  }

  if (!data.cityState) {
    errors.cityState = "City and state are required.";
  } else if (data.cityState.length < 2) {
    errors.cityState = "Enter a valid city and state.";
  }

  if (!data.fullResidentialAddress) {
    errors.fullResidentialAddress = "Residential address is required.";
  } else if (data.fullResidentialAddress.length < 10) {
    errors.fullResidentialAddress = "Enter the full residential address.";
  }

  if (!data.emailAddress) {
    errors.emailAddress = "Email address is required.";
  } else if (!EMAIL_REGEX.test(data.emailAddress)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (!data.parentGuardianContactNumber) {
    errors.parentGuardianContactNumber =
      "Primary WhatsApp number is required.";
  } else if (!/^\d{10}$/.test(data.parentGuardianContactNumber)) {
    errors.parentGuardianContactNumber =
      "Enter a valid 10-digit WhatsApp number.";
  }

  if (data.emergencyContactNumber && !/^\d{10}$/.test(data.emergencyContactNumber)) {
    errors.emergencyContactNumber =
      "Enter a valid 10-digit emergency contact number.";
  }

  if (!data.agreedToTerms) {
    errors.agreedToTerms = "Please accept the terms to continue.";
  }

  return errors;
}
