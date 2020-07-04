import * as _ from "lodash";
import React from "react";
import { IonButton, IonModal, IonLabel } from "@ionic/react";

import "./ScannerDialog.scss";
import { SCOLORS } from "../../constants/config";

interface ScannerDialogProps {
  title: string;
  message?: string;
  isOpen: boolean;
  onDidDismiss: () => void;
  onClick?: () => void;
  buttonLabel?: string;
  miscMessage?: any;
  onApprove?: () => void; //adding prop will show yes or no option rather than "ok" button
  onDecline?: () => void; //adding prop will show yes or no option rather than "ok" button
}

export const ScannerDialog = (props: ScannerDialogProps) => {
  const {
    isOpen,
    onDidDismiss,
    title,
    message,
    onClick,
    buttonLabel,
    miscMessage,
    onApprove,
    onDecline,
  } = props;
  return (
    <IonModal cssClass="wc-dialog" isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <div className="modal-content">
        <div className="wc-dialog-children-container">
          <IonLabel className="wc-dialog-title-label wc-h2">{title}</IonLabel>
          {!_.isEmpty(message) && (
            <IonLabel className="wc-dialog-message-label wc-body">
              {message}
            </IonLabel>
          )}
          {!_.isEmpty(miscMessage) && (
            <IonLabel className="wc-dialog-message-label wc-body">
              {miscMessage}
            </IonLabel>
          )}
          {onApprove !== undefined && onDecline !== undefined ? (
            <div className="wc-dialog-options-container">
              <IonButton
                onClick={onDecline}
                className="wc-dialog-no-button wc-body ion-text-capitalize"
                fill="clear"
              >
                No
              </IonButton>
              <IonButton
                onClick={onApprove}
                className="wc-dialog-submit-button wc-body bold white ion-text-capitalize"
                color={SCOLORS.tertiary}
              >
                Approve
              </IonButton>
            </div>
          ) : (
            <IonButton
              className="wc-dialog-action-button wc-body white ion-text-capitalize"
              color={SCOLORS.tertiary}
              onClick={!!onClick ? onClick : onDidDismiss}
            >
              {buttonLabel || "Ok"}
            </IonButton>
          )}
        </div>
      </div>
    </IonModal>
  );
};
