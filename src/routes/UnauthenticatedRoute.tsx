import * as _ from "lodash";
import * as React from "react";

import * as routes from "../constants/routes";
import { Route, RouteComponentProps, Redirect } from "react-router-dom";

import { AuthUser } from "../interface";
import { isMobile } from "../functions/common";

interface UnauthenticatedRouteProps {
  component: any;
  path: string;
  exact: boolean;
  authUser: AuthUser;
}
export const UnauthenticatedRoute = (props: UnauthenticatedRouteProps) => {
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
  // const authUser = RouteRef.state.authUser as AuthUser;
  // console.log("GOT AUTH USER", authUser);
  if (!_.isEmpty(authUser)) {
    return isMobile() ? (
      <Redirect to={routes.SCANNER} />
    ) : (
      <Redirect to={routes.ORDER_PAGE} />
    );
  }
  // if (!_.isEmpty(authUser)) {
  //   // if (authUser.role) //todo: check role here
  //   if (
  //     authUser.userType === undefined &&
  //     [routes.FAQ, routes.CONTACT_US].indexOf(path) === -1
  //   ) {
  //     if (path === routes.CREATE_WITH_EMAIL_ACCOUNT_SETUP) {
  //       return <C {...props} {...{ authUser: authUser }} />;
  //     } else {
  //       return <Redirect to={routes.ACCOUNT_SETUP} />;
  //     }
  //   } else if ([routes.FAQ, routes.CONTACT_US].indexOf(path) !== -1) {
  //     return <C {...props} {...{ authUser: authUser }} />;
  //   } else if (authUser.userType === USER_TYPES.patients.id) {
  //     if (path === routes.CREATE_WITH_EMAIL_ACCOUNT_SETUP) {
  //       return <C {...props} {...{ authUser: authUser }} />;
  //     } else {
  //       return <Redirect to={routes.PATIENT_APPOINTMENTS} />;
  //     }
  //   } else if (authUser.userType === USER_TYPES.hospitals.id) {
  //     if (path === routes.CREATE_WITH_EMAIL_ACCOUNT_SETUP) {
  //       return <C {...props} {...{ authUser: authUser }} />;
  //     } else {
  //       return <Redirect to={routes.HOSPITAL_DEPARTMENT} />;
  //     }
  //   } else if (authUser.userType === USER_TYPES.doctors.id) {
  //     const doctorDetail = authUser.userDetails as Doctor;
  //     if (!!doctorDetail && _.isEmpty(doctorDetail.initialPasswordCipher)) {
  //       return <Redirect to={routes.DOCTOR_APPOINTMENTS} />;
  //     } else {
  //       return <Redirect to={routes.DOCTOR_CREATE_PASSWORD} />;
  //     }
  //   } else if (authUser.userType === USER_TYPES.support.id) {
  //     return <Redirect to={routes.HOSPITAL_APPLICATIONS} />;
  //   } else if (authUser.userType === USER_TYPES.transport.id) {
  //     if (path === routes.CREATE_WITH_EMAIL_ACCOUNT_SETUP) {
  //       return <C {...props} {...{ authUser: authUser }} />;
  //     } else {
  //       return <Redirect to={routes.TRANSPORT_ACCOUNT} />;
  //     }
  //   }
  // }

  return <C {...props} {...{ authUser: authUser }} />;
};
