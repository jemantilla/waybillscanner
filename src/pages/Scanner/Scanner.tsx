import * as _ from "lodash";
import React, { useState, useRef } from "react";

import "./Scanner.scss";
import {
  IonPage,
  IonContent,
  IonLabel,
  IonButton,
  IonCard,
  IonCardHeader,
  IonTitle,
  IonCardContent,
  IonToast,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonRadioGroup,
  IonItem,
  IonRadio,
  IonLoading,
  IonIcon,
  IonModal,
  IonHeader,
} from "@ionic/react";

import * as services from "../../services";
import { Provider, WaybillStatus } from "../../interface";
import { PROVIDER, WAYBILL_STATUS } from "../../constants/config";
import { ScannerCommonHeader } from "../../components/ScannerCommonHeader/ScannerCommonHeader";
import { MSGS_COMMON } from "../../constants/messages";
import { useEffectOnlyOnce } from "../../functions/common";
import { trashBinOutline } from "ionicons/icons";

export const Scanner = () => {
  const [provider, setProvider] = useState(1 as Provider);
  const [waybillStatus, setWayBillStatus] = useState(1 as WaybillStatus);
  const [scannedWaybill, setScannedWaybill] = useState([] as string[]);
  const [currentReading, setCurrentReading] = useState("");

  const scannedInputRef: React.RefObject<HTMLIonInputElement> = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onScan = async (scannedItem: string) => {
    setLoading(true);
    try {
      const clonedScannedWayBill = _.cloneDeep(scannedWaybill);
      const existingOrder = await services.getOrder(scannedItem, provider);

      setLoading(false);
      if (_.isEmpty(scannedItem)) {
        setError("NO WAYBILL FOUND");
      } else if (
        clonedScannedWayBill.indexOf(scannedItem) !== -1 ||
        (!_.isEmpty(existingOrder) &&
          existingOrder!.status !== WAYBILL_STATUS.cancelled.id &&
          waybillStatus === WAYBILL_STATUS.forRelease.id)
      ) {
        setError("Duplicate waybill detected.");
      } else if (
        !_.isEmpty(existingOrder) &&
        existingOrder!.status === WAYBILL_STATUS.cancelled.id
      ) {
        setError("This order is cancelled.");
      } else {
        // clonedScannedWayBill.push(scannedItem);
        setScannedWaybill([...[scannedItem], ...clonedScannedWayBill]);
        setSuccess("Waybill Scanned");
      }

      setCurrentReading("");
    } catch (e) {
      setLoading(false);
      setError(e);
      setCurrentReading("");
    }
  };

  const deleteScannedId = (orderId: string) => {
    const clonedScannedWayBill = _.cloneDeep(scannedWaybill);
    _.remove(clonedScannedWayBill, (scannedItem) => scannedItem === orderId);

    setScannedWaybill(clonedScannedWayBill);
  };

  const submitScannedData = async () => {
    setLoading(true);
    try {
      const date = new Date();
      await Promise.all(
        scannedWaybill.map((orderId) => {
          return new Promise(async (resolve) => {
            const existingOrder = await services.getOrder(orderId, provider);
            if (
              !_.isEmpty(existingOrder) &&
              existingOrder!.status !== WAYBILL_STATUS.cancelled.id &&
              waybillStatus === WAYBILL_STATUS.forRelease.id
            ) {
              resolve();
            } else if (
              !_.isEmpty(existingOrder) &&
              existingOrder!.status === WAYBILL_STATUS.cancelled.id
            ) {
              resolve();
            } else {
              await services.submitScannedWaybill(
                provider,
                orderId,
                waybillStatus,
                date
              );

              resolve();
            }
          });
        })
      );
      setSuccess("Scanned waybills saved.");
      setScannedWaybill([]);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e);
    }
  };

  return (
    <IonPage>
      <ScannerCommonHeader showSignOut={true} />
      <IonContent className="ion-padding">
        <div className="scanner-container">
          <IonCard className="scanner-card">
            <IonCardHeader className="ion-margin-top">
              <IonTitle>Waybill Scanner</IonTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid className="scanner-grid">
                <IonRow>
                  <IonCol size="12">
                    <IonLabel className="ion-margin-bottom">Provider:</IonLabel>
                    <IonRadioGroup
                      value={provider}
                      onIonChange={(e) => setProvider(e.detail.value)}
                    >
                      {Object.values(PROVIDER).map((providerItem) => {
                        return (
                          <IonItem
                            lines="none"
                            disabled={!_.isEmpty(scannedWaybill)}
                          >
                            <IonLabel>{providerItem.name}</IonLabel>
                            <IonRadio
                              mode="md"
                              slot="start"
                              value={providerItem.id}
                            />
                          </IonItem>
                        );
                      })}
                    </IonRadioGroup>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12">
                    <IonLabel className="ion-margin-bottom">
                      Waybill Status:
                    </IonLabel>
                    <IonRadioGroup
                      value={waybillStatus}
                      onIonChange={(e) => setWayBillStatus(e.detail.value)}
                    >
                      {_.filter(
                        Object.values(WAYBILL_STATUS),
                        (status) => status.id !== WAYBILL_STATUS.cancelled.id
                      ).map((waybillStatusItem) => {
                        return (
                          <IonItem
                            lines="none"
                            disabled={!_.isEmpty(scannedWaybill)}
                          >
                            <IonLabel>{waybillStatusItem.name}</IonLabel>
                            <IonRadio
                              mode="md"
                              slot="start"
                              value={waybillStatusItem.id}
                            />
                          </IonItem>
                        );
                      })}
                    </IonRadioGroup>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12">
                    <IonLabel className="ion-margin-bottom">Reading:</IonLabel>
                    <IonInput
                      className="scanned-input ion-margin-top"
                      value={currentReading}
                      ref={scannedInputRef}
                      onIonChange={(event) => {
                        setCurrentReading(event.detail.value || "");
                      }}
                    ></IonInput>
                  </IonCol>
                </IonRow>
              </IonGrid>
              <IonButton
                size="large"
                expand="full"
                shape="round"
                className="scanner-scan-button ion-margin-top"
                onClick={() => {
                  onScan(currentReading);
                  if (!_.isEmpty(scannedInputRef.current)) {
                    scannedInputRef.current!.setFocus();
                  }
                }}
              >
                Scan
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard className="scanner-card-scanned-waybill">
            <IonCardHeader className="ion-margin-top ion-margin-bottom">
              <IonTitle>Scanned Waybill</IonTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="scanner-scanned-container ion-padding-start ion-padding-end ion-padding-bottom">
                {!_.isEmpty(scannedWaybill) ? (
                  scannedWaybill.map((scannedData, index) => {
                    return (
                      <div className="scanned-item">
                        <IonLabel className="ws-h5" key={scannedData}>
                          <b>{scannedWaybill.length - index}</b>. {scannedData}
                        </IonLabel>
                        <IonButton
                          fill="clear"
                          onClick={() => {
                            deleteScannedId(scannedData);
                          }}
                        >
                          <IonIcon icon={trashBinOutline} />
                        </IonButton>
                      </div>
                    );
                  })
                ) : (
                  <IonLabel className="ws-h3">No Scanned Waybill</IonLabel>
                )}
              </div>

              {!_.isEmpty(scannedWaybill) && (
                <IonButton
                  size="large"
                  expand="full"
                  shape="round"
                  className="scanner-scan-button ion-margin-top"
                  onClick={submitScannedData}
                >
                  Submit
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>

      {/* <IonToast
        isOpen={!_.isEmpty(error)}
        message={error}
        duration={2000}
        onDidDismiss={() => setError("")}
        color="danger"
      /> */}

      <IonModal
        isOpen={!_.isEmpty(error)}
        onDidDismiss={() => {
          setError("");
        }}
        cssClass="error-modal"
        backdropDismiss={false}
      >
        <IonCard className="error-card">
          <IonCardHeader>
            <IonTitle className="wc-h1 danger">ATTENTION</IonTitle>
          </IonCardHeader>
          <IonCardContent className="ion-text-center">
            <IonLabel className="wc-h1">{error}</IonLabel>
            <IonButton
              size="large"
              expand="full"
              shape="round"
              fill="outline"
              className="ion-margin-top"
              onClick={() => {
                setError("");
              }}
            >
              Okay
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonModal>

      <IonToast
        isOpen={!_.isEmpty(success)}
        message={success}
        duration={2000}
        onDidDismiss={() => {
          setSuccess("");
        }}
        color="success"
      />
      <IonLoading
        translucent={true}
        isOpen={loading}
        message={MSGS_COMMON.loading}
      />
    </IonPage>
  );
};
