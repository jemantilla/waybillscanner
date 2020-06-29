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
} from "@ionic/react";
import BarcodeScannerComponent from "../../components/BarcodeScannerComponent/BarcodeScanner";

export const Scanner = () => {
  const [scannedWaybill, setScannedWaybill] = useState([] as string[]);
  const [currentReading, setCurrentReading] = useState("");
  const scannedInputRef: React.RefObject<HTMLIonInputElement> = useRef(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleScan = (data: any) => {
    console.log("SCANNING???", data);
    setCurrentReading(data);
  };

  const onScan = (scannedItem: string) => {
    const clonedScannedWayBill = _.cloneDeep(scannedWaybill);

    if (_.isEmpty(scannedItem)) {
      setError("NO WAYBILL FOUND");
    } else if (clonedScannedWayBill.indexOf(scannedItem) !== -1) {
      setError("DUPLICATE WAYBILL");
    } else {
      clonedScannedWayBill.push(scannedItem);
      setScannedWaybill(clonedScannedWayBill);
      setSuccess("SCAN SUCCESS!");
    }

    setCurrentReading("");
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="scanner-container">
          <IonCard className="scanner-card">
            <IonCardHeader>
              <IonTitle>Waybill Scanner</IonTitle>
            </IonCardHeader>
            <IonCardContent>
              {/* <BarcodeScannerComponent
                width={300}
                height={300}
                onUpdate={(err: any, result: any) => {
                  if (result) handleScan(result.text);
                }}
              /> */}
              <IonLabel className="ion-margin-bottom">Reading:</IonLabel>
              {/* {" "}
              {!_.isEmpty(currentReading)
                ? currentReading
                : "---------------"} */}
              <IonInput
                className="scanned-input ion-margin-top"
                value={currentReading}
                ref={scannedInputRef}
                onIonChange={(event) => {
                  setCurrentReading(event.detail.value || "");
                }}
              ></IonInput>
            </IonCardContent>
          </IonCard>

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
          {!_.isEmpty(scannedWaybill) && (
            <div className="scanner-scanned-container">
              <IonLabel className="ws-h3">SCANNED WAYBILL: </IonLabel>
              {scannedWaybill.map((scannedData, index) => {
                return (
                  <IonLabel className="ws-h5" key={scannedData}>
                    {`${index + 1}. ${scannedData}`}
                  </IonLabel>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>

      <IonToast
        isOpen={!_.isEmpty(error)}
        message={error}
        duration={2000}
        onDidDismiss={() => setError("")}
        color="danger"
      />

      <IonToast
        isOpen={!_.isEmpty(success)}
        message={success}
        duration={2000}
        onDidDismiss={() => setSuccess("")}
        color="success"
      />
    </IonPage>
  );
};
