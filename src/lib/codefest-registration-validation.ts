export interface CodefestRegistrationFormData {
  fullName: string;
  gradeClass: string;
  schoolName: string;
  cityState: string;
  fullResidentialAddress: string;
  parentGuardianName: string;
  parentEmailAddress: string;
  studentEmailAddress: string;
  parentGuardianContactNumber: string;
  emergencyContactNumber: string;
  deviceAvailableForCompetition: string;
  previousExperience: string;
  participatedBefore: string;
  preferredCodingPlatform: string;
  agreedToTerms: boolean;
}

export type CodefestRegistrationFormErrors = Partial<
  Record<keyof CodefestRegistrationFormData, string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,}$/;

export const CODEFEST_COMPETITION = {
  key: "codefest-competition",
  name: "CodeFest 1.0 Maze Challenge",
  amount: 499,
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
    gradeClass: formData.gradeClass.replace(/\s+/g, " ").trim(),
    schoolName: formData.schoolName.replace(/\s+/g, " ").trim(),
    cityState: formData.cityState.replace(/\s+/g, " ").trim(),
    fullResidentialAddress: formData.fullResidentialAddress
      .replace(/\s+/g, " ")
      .trim(),
    parentGuardianName: formData.parentGuardianName
      .replace(/\s+/g, " ")
      .trim(),
    parentEmailAddress: formData.parentEmailAddress.trim(),
    studentEmailAddress: formData.studentEmailAddress.trim(),
    parentGuardianContactNumber: formData.parentGuardianContactNumber
      .replace(/\D/g, "")
      .slice(0, 10),
    emergencyContactNumber: formData.emergencyContactNumber
      .replace(/\D/g, "")
      .slice(0, 10),
    deviceAvailableForCompetition: formData.deviceAvailableForCompetition.trim(),
    previousExperience: formData.previousExperience.trim(),
    participatedBefore: formData.participatedBefore.trim(),
    preferredCodingPlatform: formData.preferredCodingPlatform.trim(),
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

  if (!data.gradeClass) {
    errors.gradeClass = "Grade or class is required.";
  }

  if (!data.schoolName) {
    errors.schoolName = "School name is required.";
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

  if (!data.parentGuardianName) {
    errors.parentGuardianName = "Parent or guardian name is required.";
  } else if (!NAME_REGEX.test(data.parentGuardianName)) {
    errors.parentGuardianName = "Enter the parent or guardian full name.";
  }

  if (!data.parentEmailAddress) {
    errors.parentEmailAddress = "Parent email is required.";
  } else if (!EMAIL_REGEX.test(data.parentEmailAddress)) {
    errors.parentEmailAddress = "Enter a valid parent email address.";
  }

  if (!data.studentEmailAddress) {
    errors.studentEmailAddress = "Student email is required.";
  } else if (!EMAIL_REGEX.test(data.studentEmailAddress)) {
    errors.studentEmailAddress = "Enter a valid student email address.";
  }

  if (!data.parentGuardianContactNumber) {
    errors.parentGuardianContactNumber =
      "Parent or guardian contact number is required.";
  } else if (!/^\d{10}$/.test(data.parentGuardianContactNumber)) {
    errors.parentGuardianContactNumber =
      "Enter a valid 10-digit contact number.";
  }

  if (!data.emergencyContactNumber) {
    errors.emergencyContactNumber = "Emergency contact number is required.";
  } else if (!/^\d{10}$/.test(data.emergencyContactNumber)) {
    errors.emergencyContactNumber =
      "Enter a valid 10-digit emergency contact number.";
  }

  if (!data.deviceAvailableForCompetition) {
    errors.deviceAvailableForCompetition = "Please select an available device.";
  }

  if (!["laptop", "desktop"].includes(data.deviceAvailableForCompetition)) {
    errors.deviceAvailableForCompetition =
      "Device must be Laptop or Desktop.";
  }

  if (!data.previousExperience) {
    errors.previousExperience = "Please select previous experience.";
  }

  if (!["beginner", "intermediate", "advanced"].includes(data.previousExperience)) {
    errors.previousExperience =
      "Experience must be Beginner, Intermediate, or Advanced.";
  }

  if (!data.participatedBefore) {
    errors.participatedBefore =
      "Please select whether you have participated before.";
  }

  if (!["yes", "no"].includes(data.participatedBefore)) {
    errors.participatedBefore = "Please select Yes or No.";
  }

  if (!data.preferredCodingPlatform) {
    errors.preferredCodingPlatform =
      "Please select your preferred coding platform.";
  }

  if (!["scratch", "pictoblox"].includes(data.preferredCodingPlatform)) {
    errors.preferredCodingPlatform =
      "Platform must be Scratch or PictoBlox.";
  }

  if (!data.agreedToTerms) {
    errors.agreedToTerms = "Please accept the terms to continue.";
  }

  return errors;
}
