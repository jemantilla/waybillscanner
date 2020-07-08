import { settings } from "ionicons/icons";
import React, { useState } from "react";
import {
  IonToolbar,
  IonHeader,
  IonItem,
  IonButton,
  IonPopover,
  IonIcon,
  IonLabel,
  IonToast,
  IonLoading,
  IonTitle,
} from "@ionic/react";

import "./ScannerCommonHeader.scss";
import * as pjson from "../../../package.json";
import * as services from "../../services";
import { SCOLORS } from "../../constants/config";
import { auth } from "../../firebase";
import _ from "lodash";
import { MSGS_COMMON } from "../../constants/messages";

export const ScannerCommonHeader: React.FunctionComponent<{
  showSignOut?: boolean;
}> = ({ showSignOut = false }) => {
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({
    open: false,
    event: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const resetPassword = async () => {
    setLoading(true);
    try {
      await services.doSendResetPasswordEmail(auth.currentUser!.email!);
      setLoading(false);
      setSuccess("Reset password link has been sent to your email.");
    } catch (e) {
      setError("Error sending reset password.");
      setLoading(false);
    }
  };
  return (
    <IonHeader>
      <IonToolbar color={SCOLORS.tertiary}>
        <IonItem color={SCOLORS.tertiary}>
          <IonTitle className="wc-h1 white" slot="start">
            BUILDMATE
          </IonTitle>
          <div className="home-header-container">
            <div className="home-header-logo">
              <div className="ion-text-center version-container">
                <IonLabel className="app-version " slot="end" color="primary">
                  {"v" + pjson.version}
                </IonLabel>
              </div>
            </div>

            {showSignOut && (
              <>
                <IonPopover
                  cssClass="header-popover"
                  showBackdrop={false}
                  isOpen={showPopover.open}
                  event={showPopover.event}
                  onDidDismiss={(e) =>
                    setShowPopover({ open: false, event: undefined })
                  }
                >
                  <div>
                    <IonButton
                      fill="clear"
                      className="ion-no-padding"
                      expand="block"
                      color={SCOLORS.primary}
                      onClick={resetPassword}
                    >
                      Reset Password
                    </IonButton>
                  </div>
                  <div className="logout-button">
                    <IonButton
                      fill="clear"
                      className="ion-no-padding"
                      expand="block"
                      color={SCOLORS.primary}
                      onClick={() => {
                        services.signOut();
                      }}
                    >
                      Sign Out
                    </IonButton>
                  </div>
                </IonPopover>

                <IonButton
                  fill="clear"
                  size="large"
                  expand="block"
                  className="home-header-settings-button"
                  color={SCOLORS.light}
                  onClick={(e) =>
                    setShowPopover({ open: true, event: e.nativeEvent })
                  }
                >
                  <IonIcon icon={settings}></IonIcon>
                </IonButton>
              </>
            )}
          </div>
        </IonItem>
      </IonToolbar>
      <IonToast
        isOpen={!_.isEmpty(success)}
        message={success}
        duration={2000}
        onDidDismiss={() => {
          setSuccess("");
        }}
        color="success"
      />
      <IonToast
        isOpen={!_.isEmpty(error)}
        message={error}
        duration={2000}
        onDidDismiss={() => {
          setError("");
        }}
        color="danger"
      />

      <IonLoading
        translucent={true}
        isOpen={loading}
        message={MSGS_COMMON.loading}
      />
    </IonHeader>
  );
};
