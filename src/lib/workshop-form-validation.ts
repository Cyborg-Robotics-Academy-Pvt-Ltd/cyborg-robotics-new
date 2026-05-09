export interface WorkshopRegistrationFormData {
  email: string;
  contactNumber: string;
  childName: string;
  age: string;
  city: string;
  area: string;
}

export type WorkshopRegistrationFormErrors = Partial<
  Record<keyof WorkshopRegistrationFormData, string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,}$/;

export function normalizeWorkshopRegistrationForm(
  formData: WorkshopRegistrationFormData,
): WorkshopRegistrationFormData {
  return {
    email: formData.email.trim(),
    contactNumber: formData.contactNumber.replace(/\D/g, "").slice(0, 10),
    childName: formData.childName.replace(/\s+/g, " ").trim(),
    age: formData.age.replace(/[^\d]/g, "").slice(0, 2),
    city: formData.city.replace(/\s+/g, " ").trim(),
    area: formData.area.replace(/\s+/g, " ").trim(),
  };
}

export function validateWorkshopRegistrationForm(
  formData: WorkshopRegistrationFormData,
): WorkshopRegistrationFormErrors {
  const data = normalizeWorkshopRegistrationForm(formData);
  const errors: WorkshopRegistrationFormErrors = {};

  if (!data.email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.contactNumber) {
    errors.contactNumber = "Contact number is required.";
  } else if (!/^\d{10}$/.test(data.contactNumber)) {
    errors.contactNumber = "Enter a valid 10-digit contact number.";
  }

  if (!data.childName) {
    errors.childName = "Child name is required.";
  } else if (!NAME_REGEX.test(data.childName)) {
    errors.childName = "Enter the child's full name.";
  }

  if (!data.age) {
    errors.age = "Age is required.";
  } else {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 4 || age > 16) {
      errors.age = "Age must be between 4 and 16.";
    }
  }

  if (!data.city) {
    errors.city = "City is required.";
  } else if (data.city.length < 2) {
    errors.city = "Enter a valid city name.";
  }

  if (!data.area) {
    errors.area = "Area or location is required.";
  } else if (data.area.length < 2) {
    errors.area = "Enter a valid area or location.";
  }

  return errors;
}
