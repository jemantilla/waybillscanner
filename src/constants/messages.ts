import { LIMITS } from "./config";

export const MSGS_SIGNUP = {
  firstName: {
    required: "Your first name is required.",
    max: `Your first name can not exceed ${LIMITS.name.single} characters in length.`,
  },
  lastName: {
    required: "Your surname is required.",
    max: `Your surname can not exceed ${LIMITS.name.single} characters in length.`,
  },
  email: {
    required: "An email address is required.",
    invalid: "You have entered an invalid email address.",
  },
  country: "Your country is required.",
  password: {
    required: "You must enter a password.",
    invalid:
      "Your password must contain at least one letter and one number and be a minimum of 8 characters long.",
  },
  mobileNumber: "Your mobile number is required",
  smsVerificationPin: "Invalid pin. Please try again",
  pendingSMSVerification: "Please input pin after receiving SMS",
  success: "Sign up success!",
};

export const MSGS_FIREBASE = {
  invalidActionCode: "The link is invalid. Please try again.",
  userNotFound: "There was no account found with this email address.",
  incorrectPassword: "The password you have entered is incorrect.",
  emailVerificationFailedNoOOB: "Email verification failed. No OOB Code found.",
  emailRecoveryFailedNoOOB: "Email recovery failed. No OOB Code found.",
};

export const MSGS_GENERIC_ERROR =
  "Sorry, an unexpected error has occurred. Please try again later.";

export const MSGS_RESET_PASSWORD = {
  email: {
    required: "Your email address is required.",
    notRegistered: "This email address is not registered.",
  },
  password: {
    required: "An email address is required.",
    confirmRequired: "Confirm Password field is required.",
    mismatch: "Passwords do not match.",
    invalid:
      "Your new password must contain at least one letter and one number and be a minimum of 8 characters long.",
  },
};

export const MSGS_CHANGE_PASSWORD = {
  currentRequired: "Current password field is required.",
  newRequired: "New password field is required.",
  confirmRequired: "Confirm password field is required.",
  mismatch: "Passwords do not match.",
  invalid:
    "Your new password must contain at least one letter and one number and be a minimum of 8 characters long.",
  success: "Change Password Success!",
};

export const MSGS_COMMON = {
  saving: "Saving...",
  loading: "Loading...",
};

export const MSGS_RESERVATION = {
  selectRoom: "Please select room",
  notEqualDate: "Please input meeting length",
  lowerEndDate: "End date can not be lower than Start date",
  success: "New Reservation Success!",
  hasBooking: "The selected date is unavailable",
  approved: "Reservation Approved!",
  cancelled: "Reservation Cancelled!",
  batchError:
    "Can not perform multiple reservation, some dates are not available.",
};

export const MSGS_PROFILE = {
  successUpdate: "Profile update success!",
  errorUpdate: "Profile update error, please try again.",
};

export const MSGS_EMPLOYEE = {
  successCreation: "Add new employee success",
  successDelete: "Employee Deleted.",
};
