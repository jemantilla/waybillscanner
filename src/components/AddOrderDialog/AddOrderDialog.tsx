import _ from "lodash";
import React, { useState } from "react";
import {
  IonButton,
  IonModal,
  IonLabel,
  IonItem,
  IonRadio,
  IonRadioGroup,
  IonToast,
  IonLoading,
  IonInput,
  IonList,
} from "@ionic/react";

import "./AddOrderDialog.scss";
import * as services from "../../services";
import { SCOLORS, PROVIDER, WAYBILL_STATUS } from "../../constants/config";
import { Provider, WaybillStatus } from "../../interface";
import { MSGS_COMMON } from "../../constants/messages";

interface AddOrderDialogProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onCancel: () => void;
}

export const AddOrderDialog = (props: AddOrderDialogProps) => {
  const { isOpen, onDidDismiss, onCancel } = props;
  const [selectedProvider, setSelectedProvider] = useState(1 as Provider);
  const [selectedStatus, setSelectedStatus] = useState(2 as WaybillStatus);
  const [orderIds, setOrderIds] = useState([] as string[]);
  const [orderId, setOrderId] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    try {
      await Promise.all(
        orderIds.map((orderId) =>
          services.submitScannedWaybill(
            selectedProvider,
            orderId,
            selectedStatus,
            new Date()
          )
        )
      );
      setLoading(false);
      setSuccess("Success");
    } catch (e) {
      setLoading(false);
      setError(e);
    }
  };

  const onAddOrderId = () => {
    const clonedOrderIds = _.cloneDeep(orderIds);
    clonedOrderIds.push(orderId);
    setOrderId("");
    setOrderIds(clonedOrderIds);
  };
  return (
    <IonModal
      cssClass="add-order-dialog"
      isOpen={isOpen}
      onDidDismiss={() => {
        onDidDismiss();
        setSelectedProvider(1);
        setSelectedStatus(1);
        setOrderId("");
        setOrderIds([]);
      }}
    >
      <div className="modal-content">
        <div className="add-order-dialog-children-container">
          <IonLabel className="add-order-dialog-title-label wc-h2 ion-text-center">
            Add New Order ID
          </IonLabel>
          <IonLabel className="add-order-dialog-message-label wc-body ion-margin-bottom">
            Please select order details
          </IonLabel>
          <IonLabel className="wc-h2 bold ion-align-self-start ion-margin-top">
            Provider
          </IonLabel>
          <IonRadioGroup
            className="add-order-dialog-radio-container"
            value={selectedProvider}
            onIonChange={(e) => setSelectedProvider(e.detail.value)}
          >
            <IonItem lines="none" disabled={!_.isEmpty(orderIds)}>
              <IonLabel>{PROVIDER.lazada.name}</IonLabel>
              <IonRadio slot="start" value={PROVIDER.lazada.id} />
            </IonItem>

            <IonItem lines="none" disabled={!_.isEmpty(orderIds)}>
              <IonLabel>{PROVIDER.shopee.name}</IonLabel>
              <IonRadio slot="start" value={PROVIDER.shopee.id} />
            </IonItem>
          </IonRadioGroup>
          <IonLabel className="wc-h2 bold ion-align-self-start">
            Status
          </IonLabel>
          <IonRadioGroup
            title="Status"
            className="add-order-dialog-radio-container"
            value={selectedStatus}
            onIonChange={(e) => setSelectedStatus(e.detail.value)}
          >
            <IonItem lines="none" disabled={!_.isEmpty(orderIds)}>
              <IonLabel>{WAYBILL_STATUS.cancelled.name}</IonLabel>
              <IonRadio slot="start" value={WAYBILL_STATUS.cancelled.id} />
            </IonItem>

            <IonItem lines="none" disabled={!_.isEmpty(orderIds)}>
              <IonLabel>{WAYBILL_STATUS.returned.name}</IonLabel>
              <IonRadio slot="start" value={WAYBILL_STATUS.returned.id} />
            </IonItem>
          </IonRadioGroup>
          <IonInput
            className="order-input ion-margin-top"
            value={orderId}
            onIonChange={(event) => {
              setOrderId(event.detail.value || "");
            }}
            color="dark"
          >
            <IonButton
              className="add-order-dialog-button"
              disabled={_.isEmpty(orderId)}
              onClick={onAddOrderId}
            >
              Add
            </IonButton>
          </IonInput>
          <IonLabel className="wc-h2 bold ion-align-self-start ion-margin-top">
            To Add:
          </IonLabel>
          <IonList className="add-order-dialog-order-list ion-align-self-start">
            {!_.isEmpty(orderIds) ? (
              orderIds.map((orderId, index) => {
                return (
                  <IonItem lines="none">
                    <b>{index + 1}. </b> {orderId}
                  </IonItem>
                );
              })
            ) : (
              <IonItem lines="none">
                <IonLabel className="wc-h4">No Order Ids to Add</IonLabel>
              </IonItem>
            )}
          </IonList>

          <div className="add-order-dialog-options-container">
            <IonButton
              onClick={onCancel}
              className="add-order-dialog-no-button wc-body ion-text-capitalize"
              fill="clear"
            >
              Cancel
            </IonButton>
            <IonButton
              onClick={onSubmit}
              className="add-order-dialog-submit-button wc-body bold white ion-text-capitalize"
              color={SCOLORS.tertiary}
            >
              Submit
            </IonButton>
          </div>
        </div>
      </div>

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
        onDidDismiss={() => {
          setSuccess("");
          onDidDismiss();
        }}
        color="success"
      />
      <IonLoading
        translucent={true}
        isOpen={loading}
        message={MSGS_COMMON.loading}
      />
    </IonModal>
  );
};
