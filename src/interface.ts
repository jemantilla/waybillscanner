import { RouteComponentProps } from "react-router";

export interface AuthUser {
  uid: string;
  authEmail: string;
}
export interface WSProps extends RouteComponentProps {
  authUser: AuthUser;
}

export type Provider = 1 | 2;
export type WaybillStatus = 1 | 2 | 3;
