import * as _ from "lodash";
import moment from "moment";
import React from "react";
import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  IonCardHeader,
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
  IonCheckbox,
} from "@ionic/react";
import { downloadOutline } from "ionicons/icons";

import "./Orders.scss";
import * as services from "../../services";
import { download } from "../../functions/common";
import { AddOrderDialog } from "../../components/AddOrderDialog/AddOrderDialog";
import { ScannerCalendar } from "../../components/ScannerCalendar/ScannerCalendar";
import { ScannerDialog } from "../../components/ScannerDialog/ScannerDialog";
import { ScannerCommonHeader } from "../../components/ScannerCommonHeader/ScannerCommonHeader";
import { Orders, OrderPrintDetails } from "../../models";
import { MSGS_COMMON } from "../../constants/messages";
import { SCOLORS, PROVIDER, WAYBILL_STATUS } from "../../constants/config";

class OrdersPage extends React.Component<{}> {
  state = {
    calendarAnchor: null as Event | undefined | null,
    selectedDate: new Date(),
    isLoading: false,

    lazadaOrders: null as Orders[] | null,
    filteredLazadaOrders: null as Orders[] | null,
    isLazadaCancelledOrdersSelected: false,
    isLazadaReturnedOrdersSelected: false,
    isLazadaRelesedOrdersSelected: false,

    shopeeOrders: null as Orders[] | null,
    filteredShopeeOrders: null as Orders[] | null,
    isShopeeCancelledOrdersSelected: false,
    isShopeeReturnedOrdersSelected: false,
    isShopeeRelesedOrdersSelected: false,

    isClearDatabaseOpen: false,
    addOrderDialogOpen: false,
    success: "",
    error: "",
  };

  componentDidMount = () => {
    this.getLazadaOrders();
    this.getShopeeOrders();

    this.checkIfShouldClearDB();
  };

  checkIfShouldClearDB = async () => {
    try {
      const shouldClearDB = await services.shouldClearDatabase();
      if (shouldClearDB) {
        this.setState({
          isClearDatabaseOpen: true,
        });
      }
    } catch (e) {
      this.setState({
        error: e,
      });
    }
  };

  clearDatabase = async () => {
    this.setState({
      isLoading: true,
    });
    try {
      await services.clearOrders();
      this.setState({
        isLoading: false,
      });
    } catch (e) {
      this.setState({
        isLoading: false,
      });
    }
  };

  getLazadaOrders = () => {
    const { selectedDate } = this.state;
    services.getOrdersWithDate(selectedDate, PROVIDER.lazada.id, (orders) => {
      this.setState({ lazadaOrders: orders });
      console.log("GOT ORDERS - getLazadaOrders", orders);
    });
  };

  getShopeeOrders = () => {
    const { selectedDate } = this.state;
    services.getOrdersWithDate(selectedDate, PROVIDER.shopee.id, (orders) => {
      this.setState({ shopeeOrders: orders });
      console.log("GOT ORDERS - getShopeeOrders", orders);
    });
  };

  formatLazadaOrders = () => {
    const { filteredLazadaOrders, lazadaOrders } = this.state;
    if (!_.isEmpty(lazadaOrders)) {
      return (!_.isNull(filteredLazadaOrders)
        ? filteredLazadaOrders
        : lazadaOrders!
      ).map((order) => {
        const row = {} as Partial<OrderPrintDetails>;
        row["Order ID"] = order.orderId;
        row.Status = _.find(
          Object.values(WAYBILL_STATUS),
          (status) => status.id === order.status
        )!.name;
        row["Date Added"] = moment(order.createdDate.toDate()).format(
          "MM-DD-YYYY"
        );
        return row as OrderPrintDetails;
      });
    } else {
      return [];
    }
  };

  downloadLazadaOrders = () => {
    const { lazadaOrders } = this.state;
    if (!_.isEmpty(lazadaOrders)) {
      this.setState({ loading: true });
      download(
        this.formatLazadaOrders(),
        `Lazada-${moment(new Date()).format("MM-DD-YYYY").toString()}`
      );
      this.setState({ loading: false });
    } else {
      this.setState({
        error: "No orders found.",
      });
    }
  };

  formatShopeeOrders = () => {
    const { filteredShopeeOrders, shopeeOrders } = this.state;
    if (!_.isEmpty(shopeeOrders)) {
      return (!_.isNull(filteredShopeeOrders)
        ? filteredShopeeOrders
        : shopeeOrders!
      ).map((order) => {
        const row = {} as Partial<OrderPrintDetails>;
        row["Order ID"] = order.orderId;
        row.Status = _.find(
          Object.values(WAYBILL_STATUS),
          (status) => status.id === order.status
        )!.name;
        row["Date Added"] = moment(order.createdDate.toDate()).format(
          "MM-DD-YYYY"
        );
        return row as OrderPrintDetails;
      });
    } else {
      return [];
    }
  };

  downloadShopeeOrders = () => {
    const { shopeeOrders } = this.state;
    if (!_.isEmpty(shopeeOrders)) {
      this.setState({ loading: true });
      download(
        this.formatShopeeOrders(),
        `Shopee-${moment(new Date()).format("MM-DD-YYYY").toString()}`
      );
      this.setState({ loading: false });
    } else {
      this.setState({
        error: "No orders found.",
      });
    }
  };

  filterLazadaOrders = () => {
    const {
      lazadaOrders,
      isLazadaCancelledOrdersSelected,
      isLazadaReturnedOrdersSelected,
      isLazadaRelesedOrdersSelected,
    } = this.state;

    const compactStatus = _.compact([
      isLazadaCancelledOrdersSelected,
      isLazadaReturnedOrdersSelected,
      isLazadaRelesedOrdersSelected,
    ]);
    if (compactStatus.length === 3 || compactStatus.length === 0) {
      this.setState({
        filteredLazadaOrders: null,
      });
    } else {
      if (!_.isEmpty(lazadaOrders)) {
        const newFilteredOrders = _.filter(lazadaOrders, (order) => {
          let result = true;
          if (
            !isLazadaCancelledOrdersSelected &&
            order.status === WAYBILL_STATUS.cancelled.id
          ) {
            result = false;
          }

          if (
            !isLazadaReturnedOrdersSelected &&
            order.status === WAYBILL_STATUS.returned.id
          ) {
            result = false;
          }

          if (
            !isLazadaRelesedOrdersSelected &&
            order.status === WAYBILL_STATUS.forRelease.id
          ) {
            result = false;
          }

          return result;
        });

        this.setState({
          filteredLazadaOrders: newFilteredOrders,
        });
      }
    }
  };

  filterShopeeOrders = () => {
    const {
      shopeeOrders,
      isShopeeCancelledOrdersSelected,
      isShopeeReturnedOrdersSelected,
      isShopeeRelesedOrdersSelected,
    } = this.state;

    const compactStatus = _.compact([
      isShopeeCancelledOrdersSelected,
      isShopeeReturnedOrdersSelected,
      isShopeeRelesedOrdersSelected,
    ]);
    if (compactStatus.length === 3 || compactStatus.length === 0) {
      this.setState({
        filteredShopeeOrders: null,
      });
    } else {
      if (!_.isEmpty(shopeeOrders)) {
        const newFilteredOrders = _.filter(shopeeOrders, (order) => {
          let result = true;
          if (
            !isShopeeCancelledOrdersSelected &&
            order.status === WAYBILL_STATUS.cancelled.id
          ) {
            result = false;
          }

          if (
            !isShopeeReturnedOrdersSelected &&
            order.status === WAYBILL_STATUS.returned.id
          ) {
            result = false;
          }

          if (
            !isShopeeRelesedOrdersSelected &&
            order.status === WAYBILL_STATUS.forRelease.id
          ) {
            result = false;
          }

          return result;
        });

        this.setState({
          filteredShopeeOrders: newFilteredOrders,
        });
      }
    }
  };

  setSelectedDateAndRefresh = async (selectedDate: Date) => {
    this.setState({ selectedDate, lazadaOrders: null, shopeeOrders: null });
    setTimeout(() => {
      this.getLazadaOrders();
      this.getShopeeOrders();
    }, 500);
  };

  render = () => {
    const {
      lazadaOrders,
      calendarAnchor,
      selectedDate,
      filteredLazadaOrders,
      isLazadaCancelledOrdersSelected,
      isLazadaReturnedOrdersSelected,
      isLazadaRelesedOrdersSelected,
      shopeeOrders,
      filteredShopeeOrders,
      isShopeeCancelledOrdersSelected,
      isShopeeReturnedOrdersSelected,
      isShopeeRelesedOrdersSelected,
      addOrderDialogOpen,
      isClearDatabaseOpen,
      isLoading,
      success,
      error,
    } = this.state;
    return (
      <IonPage>
        <ScannerCommonHeader showSignOut={true} />
        <IonContent className="ion-padding">
          <div className="order-options-container">
            <IonItem lines="none" className="ion-no-padding">
              <IonLabel position="floating" className="ion-padding-bottom">
                Selected Date
              </IonLabel>
              <IonInput
                className="selected-date-input"
                value={moment(selectedDate).format("MM-DD-YYYY")}
                readonly={true}
                onClick={(event) => {
                  this.setState({ calendarAnchor: event.nativeEvent });
                }}
              />
            </IonItem>
            <IonButton
              className="ion-margin-start wc-h1 bold white ion-text-capitalize add-button"
              onClick={() => {
                this.setState({
                  addOrderDialogOpen: true,
                });
              }}
            >
              Add Order
            </IonButton>
          </div>
          <IonGrid className="order-grid">
            <IonRow>
              <IonCol size="6">
                <IonCard>
                  <IonCardHeader className="order-table-card-header ion-no-padding ion-padding-start ion-padding-end ion-padding-top">
                    <IonLabel className="wc-h1">Lazada Orders</IonLabel>
                    <IonButton onClick={this.downloadLazadaOrders}>
                      <IonIcon icon={downloadOutline} />
                    </IonButton>
                  </IonCardHeader>
                  <IonCardContent>
                    {!_.isNull(lazadaOrders) ? (
                      !_.isEmpty(lazadaOrders) ? (
                        <IonGrid>
                          <IonRow>
                            <IonCol size="4">
                              <IonItem className="status-checkbox" lines="none">
                                <IonCheckbox
                                  checked={isLazadaRelesedOrdersSelected}
                                  onIonChange={(event) => {
                                    this.setState({
                                      isLazadaRelesedOrdersSelected:
                                        event.detail.checked,
                                    });
                                    setTimeout(() => {
                                      this.filterLazadaOrders();
                                    });
                                  }}
                                />
                                <IonLabel className="wc-h3 ion-margin-start">
                                  {WAYBILL_STATUS.forRelease.name}
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="4">
                              <IonItem className="status-checkbox" lines="none">
                                <IonCheckbox
                                  checked={isLazadaCancelledOrdersSelected}
                                  onIonChange={(event) => {
                                    this.setState({
                                      isLazadaCancelledOrdersSelected:
                                        event.detail.checked,
                                    });
                                    setTimeout(() => {
                                      this.filterLazadaOrders();
                                    });
                                  }}
                                />
                                <IonLabel className="wc-h3 ion-margin-start">
                                  {WAYBILL_STATUS.cancelled.name}
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="4">
                              <IonItem className="status-checkbox" lines="none">
                                <IonCheckbox
                                  checked={isLazadaReturnedOrdersSelected}
                                  onIonChange={(event) => {
                                    this.setState({
                                      isLazadaReturnedOrdersSelected:
                                        event.detail.checked,
                                    });
                                    setTimeout(() => {
                                      this.filterLazadaOrders();
                                    });
                                  }}
                                />
                                <IonLabel className="wc-h3 ion-margin-start">
                                  {WAYBILL_STATUS.returned.name}
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                          </IonRow>
                          <IonRow>
                            <IonCol className="order-table-header" size="4">
                              <IonLabel className="wc-h3 bold white">
                                Order ID
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="4">
                              <IonLabel className="wc-h3 bold white">
                                Status
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="4">
                              <IonLabel className="wc-h3 bold white">
                                Date Added
                              </IonLabel>
                            </IonCol>
                          </IonRow>
                          {(!_.isNull(filteredLazadaOrders)
                            ? filteredLazadaOrders
                            : lazadaOrders
                          ).map((order) => {
                            return (
                              <IonRow>
                                <IonCol size="4">
                                  <IonLabel className="wc-h4">
                                    {order.orderId}
                                  </IonLabel>
                                </IonCol>
                                <IonCol size="4">
                                  <IonLabel className="wc-h4">
                                    {
                                      _.find(
                                        Object.values(WAYBILL_STATUS),
                                        (status) => status.id === order.status
                                      )!.name
                                    }
                                  </IonLabel>
                                </IonCol>
                                <IonCol size="4">
                                  <IonLabel className="wc-h4">
                                    {moment(order.createdDate.toDate()).format(
                                      "MM-DD-YYYY"
                                    )}
                                  </IonLabel>
                                </IonCol>
                              </IonRow>
                            );
                          })}
                        </IonGrid>
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
                  <IonCardHeader className="order-table-card-header ion-no-padding ion-padding-start ion-padding-end ion-padding-top">
                    <IonLabel className="wc-h1">Shopee Orders</IonLabel>
                    <IonButton onClick={this.downloadShopeeOrders}>
                      <IonIcon icon={downloadOutline} />
                    </IonButton>
                  </IonCardHeader>
                  <IonCardContent>
                    {!_.isNull(shopeeOrders) ? (
                      !_.isEmpty(shopeeOrders) ? (
                        <IonGrid>
                          <IonRow>
                            <IonCol size="4">
                              <IonItem className="status-checkbox" lines="none">
                                <IonCheckbox
                                  checked={isShopeeRelesedOrdersSelected}
                                  onIonChange={(event) => {
                                    this.setState({
                                      isShopeeRelesedOrdersSelected:
                                        event.detail.checked,
                                    });
                                    setTimeout(() => {
                                      this.filterShopeeOrders();
                                    });
                                  }}
                                />
                                <IonLabel className="wc-h3 ion-margin-start">
                                  {WAYBILL_STATUS.forRelease.name}
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="4">
                              <IonItem className="status-checkbox" lines="none">
                                <IonCheckbox
                                  checked={isShopeeCancelledOrdersSelected}
                                  onIonChange={(event) => {
                                    this.setState({
                                      isShopeeCancelledOrdersSelected:
                                        event.detail.checked,
                                    });
                                    setTimeout(() => {
                                      this.filterShopeeOrders();
                                    });
                                  }}
                                />
                                <IonLabel className="wc-h3 ion-margin-start">
                                  {WAYBILL_STATUS.cancelled.name}
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="4">
                              <IonItem className="status-checkbox" lines="none">
                                <IonCheckbox
                                  checked={isShopeeReturnedOrdersSelected}
                                  onIonChange={(event) => {
                                    this.setState({
                                      isShopeeReturnedOrdersSelected:
                                        event.detail.checked,
                                    });
                                    setTimeout(() => {
                                      this.filterShopeeOrders();
                                    });
                                  }}
                                />
                                <IonLabel className="wc-h3 ion-margin-start">
                                  {WAYBILL_STATUS.returned.name}
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                          </IonRow>
                          <IonRow>
                            <IonCol className="order-table-header" size="4">
                              <IonLabel className="wc-h3 bold white">
                                Order ID
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="4">
                              <IonLabel className="wc-h3 bold white">
                                Status
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="4">
                              <IonLabel className="wc-h3 bold white">
                                Date Added
                              </IonLabel>
                            </IonCol>
                          </IonRow>
                          {(!_.isNull(filteredShopeeOrders)
                            ? filteredShopeeOrders
                            : shopeeOrders
                          ).map((order) => {
                            return (
                              <IonRow>
                                <IonCol size="4">
                                  <IonLabel className="wc-h4">
                                    {order.orderId}
                                  </IonLabel>
                                </IonCol>
                                <IonCol size="4">
                                  <IonLabel className="wc-h4">
                                    {
                                      _.find(
                                        Object.values(WAYBILL_STATUS),
                                        (status) => status.id === order.status
                                      )!.name
                                    }
                                  </IonLabel>
                                </IonCol>
                                <IonCol size="4">
                                  <IonLabel className="wc-h4">
                                    {moment(order.createdDate.toDate()).format(
                                      "MM-DD-YYYY"
                                    )}
                                  </IonLabel>
                                </IonCol>
                              </IonRow>
                            );
                          })}
                        </IonGrid>
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

        <AddOrderDialog
          isOpen={addOrderDialogOpen}
          onCancel={() => {
            this.setState({
              addOrderDialogOpen: false,
            });
          }}
          onDidDismiss={() => {
            this.setState({
              addOrderDialogOpen: false,
            });
          }}
        />

        <ScannerDialog
          isOpen={isClearDatabaseOpen}
          title="6 months has gone by"
          message="Clear database will commence now. Please approve."
          onDidDismiss={() => {
            this.setState({
              isClearDatabaseOpen: false,
            });
          }}
          onApprove={() => {
            this.setState({
              isClearDatabaseOpen: false,
            });
            this.clearDatabase();
          }}
          onDecline={() => {
            this.setState({
              isClearDatabaseOpen: false,
            });
          }}
        />

        <ScannerCalendar
          calendarAnchor={calendarAnchor}
          selectedDate={selectedDate}
          removeCalendarAnchor={() => {
            this.setState({ calendarAnchor: null });
          }}
          onDateChange={this.setSelectedDateAndRefresh}
          minDate={new Date()}
        />

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
