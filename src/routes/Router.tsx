import * as _ from "lodash";
import * as React from "react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { IonRouterOutlet, IonLoading } from "@ionic/react";

import * as capacitorStorage from "../functions/localStorageCapacitor";
import * as routes from "../constants/routes";
import { auth } from "../firebase";
import { AuthUser } from "../interface";
import { LOCAL_STORAGE } from "../config";
import { AuthenticatedRoute } from "./AuthenticatedRoute";
import { Scanner } from "../pages/Scanner/Scanner";

class RouterComponent extends React.Component<any, any> {
  state = {
    loading: true,
    authUser: {} as AuthUser,
  };

  componentDidMount = () => {
    this.deployAuthStateListener();
  };

  deployAuthStateListener = () => {
    auth.onAuthStateChanged(async (authUser) => {
      if (!!authUser) {
        this.refreshToken();
        try {
          let authenticatedUser = {
            authEmail: authUser.email,
            uid: authUser.uid,
          } as AuthUser;

          this.setState({
            authUser: authenticatedUser,
            loading: false,
          });
        } catch (e) {
          console.log("error getting auth user", e);
          this.setState({ loading: false, authUser: null });
        }
      } else {
        console.log("no authUser");
        this.setState({ loading: false, authUser: null });
      }
    });
  };

  refreshToken = async () => {
    if (!!auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);

      // if expired do something
      if (!idToken) {
        this.setState({
          authUser: null,
          loading: false,
        });
      } else {
        const currentToken = await capacitorStorage.getItem(
          LOCAL_STORAGE.fbIdToken
        );

        // refresh token if not updated
        if (currentToken !== idToken) {
          await capacitorStorage.setItem(LOCAL_STORAGE.fbIdToken, idToken);
          await capacitorStorage.setItem(
            LOCAL_STORAGE.userId,
            auth.currentUser.uid
          );
        }
      }
    }
  };

  //TODO: check auth, integrate the authed and unauthed routes

  render = () => {
    const { authUser, loading } = this.state;

    return (
      <IonReactRouter>
        {!loading && (
          <IonRouterOutlet>
            <AuthenticatedRoute
              path={routes.SCANNER}
              component={Scanner}
              exact={true}
              authUser={authUser}
            />
            <Route
              exact
              path="/"
              render={() => <Redirect to={routes.SCANNER} />}
            />
          </IonRouterOutlet>
        )}

        <IonLoading
          translucent={true}
          isOpen={loading}
          mode="ios"
          message={"Loading ..."}
        />
      </IonReactRouter>
    );
  };
}

export default RouterComponent;