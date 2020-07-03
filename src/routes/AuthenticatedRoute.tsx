import * as _ from "lodash";
import * as React from "react";
import { Route, RouteComponentProps, Redirect } from "react-router-dom";

import * as routes from "../constants/routes";
import { AuthUser } from "../interface";

interface AuthenticatedRouteProps {
  component: any;
  path: string;
  exact: boolean;
  authUser: AuthUser;
}
export const AuthenticatedRoute = (props: AuthenticatedRouteProps) => {
  const { exact, path, authUser, component } = props;
  return (
    <Route
      exact={exact}
      path={path}
      render={(props: RouteComponentProps) => {
        return getRender(authUser, path, props, component);
      }}
    />
  );
};

const getRender = (authUser: AuthUser, path: string, props: any, C: any) => {
  if (_.isEmpty(authUser)) {
    return <Redirect to={routes.HOME} />;
  }
  // if (_.isEmpty(authUser)) {
  //   return <Redirect to={routes.LOGIN_OPTIONS} />;
  // } else {
  //   if (authUser.userType === undefined && path !== routes.ACCOUNT_SETUP) {
  //     return <Redirect to={routes.ACCOUNT_SETUP} />;
  //   } else if (
  //     (authUser.userType === USER_TYPES.patients.id ||
  //       authUser.userType === USER_TYPES.hospitals.id ||
  //       authUser.userType === USER_TYPES.transport.id) &&
  //     !authUser.emailVerified &&
  //     authUser.userType !== USER_TYPES.support.id
  //   ) {
  //     if (path === routes.RESEND_EMAIL_VERIFICATION) {
  //       return <C {...props} {...{ authUser: authUser }} />;
  //     } else {
  //       return <Redirect to={routes.RESEND_EMAIL_VERIFICATION} />;
  //     }
  //   } else if (
  //     authUser.userType === USER_TYPES.hospitals.id &&
  //     !(authUser.userDetails as HospitalRep).isVerified
  //   ) {
  //     if (path === routes.ONGOING_HOSPITAL_VERIFICATION) {
  //       return <C {...props} {...{ authUser: authUser }} />;
  //     } else {
  //       return <Redirect to={routes.ONGOING_HOSPITAL_VERIFICATION} />;
  //     }
  //   }
  //   //INSERT AUTH HERE TO CHECK IF ON PATIENT OR HOSPITAL PAGE BASED ON USER TYPE
  //   //NOTE:  NOT PUTTING REDIRECT TO DASHBOARD WHEN HAS ACCOUNT AND IN ACCOUNT SETUP, is intended to be able to show success dialog on create account
  //   else {
  //     return <C {...props} {...{ authUser: authUser }} />;
  //   }
  // }

  return <C {...props} {...{ authUser: authUser }} />;
};
