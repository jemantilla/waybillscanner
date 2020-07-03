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
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import React from "react";
import { eye, eyeOff } from "ionicons/icons";

import "./Orders.scss";
import * as services from "../../services";
import { SCOLORS, PROVIDER } from "../../constants/config";
import { MSGS_SIGNUP, MSGS_COMMON } from "../../constants/messages";
import { ScannerCommonHeader } from "../../components/ScannerCommonHeader/ScannerCommonHeader";
import { isMobile } from "../../functions/common";
import { Orders } from "../../models";

class OrdersPage extends React.Component<{}> {
  state = {
    emailAddress: "",
    password: "",
    passwordVisibility: false,
    isLoading: false,
    lazadaOrders: null as Orders[] | null,
    shopeeOrders: null as Orders[] | null,
    success: "",
    error: "",
  };

  componentDidMount = () => {
    this.getLazadaOrders();
    this.getShopeeOrders();
  };

  getLazadaOrders = () => {
    services.getOrdersWithDate(new Date(), PROVIDER.lazada.id, (orders) => {
      this.setState({ lazadaOrders: orders });
      console.log("GOT ORDERS - getLazadaOrders", orders);
    });
  };

  getShopeeOrders = () => {
    services.getOrdersWithDate(new Date(), PROVIDER.shopee.id, (orders) => {
      this.setState({ shopeeOrders: orders });
      console.log("GOT ORDERS - getShopeeOrders", orders);
    });
  };

  render = () => {
    const {
      lazadaOrders,
      shopeeOrders,
      isLoading,
      success,
      error,
    } = this.state;
    return (
      <IonPage>
        <ScannerCommonHeader showSignOut={true} />
        <IonContent className="ion-padding">
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonCard>
                  <IonCardHeader>
                    <IonLabel className="wc-h1">Lazada Orders</IonLabel>
                  </IonCardHeader>
                  <IonCardContent>
                    {!_.isNull(lazadaOrders) ? (
                      !_.isEmpty(lazadaOrders) ? (
                        lazadaOrders.map((order) => {
                          return <IonLabel>{order.orderId}</IonLabel>;
                        })
                      ) : (
                        "No orders for this date"
                      )
                    ) : (
                      <IonSpinner />
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard>
                  <IonCardHeader>
                    <IonLabel className="wc-h1">Shopee Orders</IonLabel>
                  </IonCardHeader>
                  <IonCardContent>
                    {!_.isNull(shopeeOrders) ? (
                      !_.isEmpty(shopeeOrders) ? (
                        shopeeOrders.map((order) => {
                          return <IonLabel>{order.orderId}</IonLabel>;
                        })
                      ) : (
                        "No orders for this date"
                      )
                    ) : (
                      <IonSpinner />
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
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

export default withIonLifeCycle(OrdersPage);
