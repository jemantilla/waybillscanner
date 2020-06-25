import { RouteComponentProps } from "react-router";

export interface AuthUser {
  uid: string;
  authEmail: string;
}
export interface WSProps extends RouteComponentProps {
  authUser: AuthUser;
}
