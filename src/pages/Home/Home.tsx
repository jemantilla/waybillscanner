import * as _ from "lodash";
import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonButton,
  IonIcon,
  IonLoading,
  IonToast,
  withIonLifeCycle,
} from "@ionic/react";
import React from "react";
import { eye, eyeOff } from "ionicons/icons";

import "./Home.scss";
import * as services from "../../services";
import { SCOLORS } from "../../constants/config";
// import { SVLink } from "../../components/common/SVLink";
// import { SVButton } from "../../components/SVButton/SVButton";
// import * as routes from "../../constants/routes";
import { MSGS_SIGNUP, MSGS_COMMON } from "../../constants/messages";
import { ScannerCommonHeader } from "../../components/ScannerCommonHeader/ScannerCommonHeader";
import { isMobile } from "../../functions/common";

class Home extends React.Component<{}> {
  state = {
    emailAddress: "",
    password: "",
    passwordVisibility: false,
    isLoading: false,
    success: "",
    error: "",
  };

  signIn = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      this.setState({ isLoading: true });

      const { emailAddress, password } = this.state;
      let errorMessage = "";
      if (emailAddress.length === 0) {
        errorMessage = MSGS_SIGNUP.email.required;
      } else if (password.length === 0) {
        errorMessage = MSGS_SIGNUP.password.required;
      }

      if (!_.isEmpty(errorMessage)) {
        this.setState({
          isLoading: false,
          error: errorMessage,
        });
        return;
      }

      await services.signIn(emailAddress, password);

      this.setState({ success: "Sign in success", isLoading: false });
    } catch (error) {
      this.setState({
        isLoading: false,
        error,
      });
    }
  };

  render = () => {
    const {
      emailAddress,
      password,
      passwordVisibility,
      isLoading,
      success,
      error,
    } = this.state;
    return (
      <IonPage>
        <ScannerCommonHeader />
        <IonContent className="ion-padding">
          <IonCard
            className={`sign-in-container ${isMobile() ? "mobile" : ""}`}
          >
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">SIGN IN</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="ion-padding">
              <form onSubmit={this.signIn}>
                <IonItem
                  className="sign-in-user-input-item ion-padding-bottom"
                  lines="none"
                >
                  <IonInput
                    className="sv-input"
                    name="emailAddress"
                    inputmode="email"
                    type="email"
                    value={emailAddress}
                    placeholder="Email Address"
                    onIonChange={(event) =>
                      this.setState({ emailAddress: event.detail.value })
                    }
                  ></IonInput>
                </IonItem>
                <IonItem
                  className="sign-in-user-input-item ion-padding-bottom"
                  lines="none"
                >
                  <IonInput
                    className="sv-input"
                    name="password"
                    inputmode="text"
                    type={this.state.passwordVisibility ? "text" : "password"}
                    value={password}
                    placeholder="Password"
                    onIonChange={(event) =>
                      this.setState({ password: event.detail.value })
                    }
                  >
                    <IonButton
                      slot="end"
                      className="password-visibility"
                      fill="clear"
                      expand="block"
                      tabIndex={-1}
                      onClick={() => {
                        this.setState({
                          passwordVisibility: !passwordVisibility,
                        });
                      }}
                    >
                      <IonIcon
                        icon={passwordVisibility ? eye : eyeOff}
                        color="secondary"
                      />
                    </IonButton>
                  </IonInput>
                </IonItem>

                <IonButton className="login-button" type="submit">
                  Login{" "}
                </IonButton>
              </form>
              {/* <div className="forgot-password">
                <span className="forgot-password-spiel">Forgot password?</span>
                <div>
                  <SVLink
                    title="Reset now"
                    routerLink={routes.FORGOT_PASSWORD}
                  />
                </div>
              </div> */}
            </IonCardContent>
          </IonCard>
        </IonContent>

        <IonLoading
          translucent={true}
          isOpen={isLoading}
          message={MSGS_COMMON.loading}
        />

        <IonToast
          isOpen={!_.isEmpty(error)}
          onDidDismiss={() => this.setState({ error: "" })}
          message={error}
          duration={1000}
          color={SCOLORS.danger}
        />

        <IonToast
          isOpen={!_.isEmpty(success)}
          message={success}
          duration={500}
          onDidDismiss={() => {
            this.setState({ success: "" });
          }}
          color={SCOLORS.success}
        />
      </IonPage>
    );
  };
}

export default withIonLifeCycle(Home);
