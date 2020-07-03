import { Provider, WaybillStatus } from "../interface";

export const SCOLORS = {
  primary: "primary",
  secondary: "secondary",
  tertiary: "tertiary",
  success: "success",
  warning: "warning",
  danger: "danger",
  dark: "dark",
  medium: "medium",
  light: "light",
};

export const LIMITS = {
  name: {
    single: 50,
    full: 100,
  },
};

export const FIREBASE_EMAIL_MODES = {
  verifyEmail: "verifyEmail",
  resetPassword: "resetPassword",
  recoverEmail: "recoverEmail",
};

export const FIREBASE_ERROR_CODES = {
  invalidActionCode: "auth/invalid-action-code",
  userNotFound: "auth/user-not-found",
  incorrectPassword: "auth/wrong-password",
};

export const PROVIDER = {
  lazada: {
    id: 1 as Provider,
    name: "Lazada",
  },
  shopee: {
    id: 2 as Provider,
    name: "Shopee",
  },
};

export const WAYBILL_STATUS = {
  forRelease: {
    id: 1 as WaybillStatus,
    name: "For Release",
  },
  cancelled: {
    id: 2 as WaybillStatus,
    name: "Cancelled",
  },
  returned: {
    id: 3 as WaybillStatus,
    name: "Returned",
  },
};
