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
import { downloadOutline, trashBinOutline } from "ionicons/icons";

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
import {
  ScannerDropdownSelect,
  ScannerDropdownSelectOption,
} from "../../components/ScannerDropdownSelect/ScannerDropdownSelect";

interface OrderWithBatchNo extends Orders {
  batchNo: number;
}

class OrdersPage extends React.Component<{}> {
  state = {
    calendarFromAnchor: null as Event | undefined | null,
    calendarToAnchor: null as Event | undefined | null,
    selectedFromDate: new Date(),
    selectedToDate: new Date(),
    isLoading: false,

    lazadaOrders: null as OrderWithBatchNo[] | null,
    lazadaBatchOptions: [] as ScannerDropdownSelectOption[],
    selectedLazadaBatch: {} as ScannerDropdownSelectOption,
    filteredLazadaOrders: null as OrderWithBatchNo[] | null,
    isLazadaCancelledOrdersSelected: false,
    isLazadaReturnedOrdersSelected: false,
    isLazadaRelesedOrdersSelected: false,

    shopeeOrders: null as OrderWithBatchNo[] | null,
    shopeeBatchOptions: [] as ScannerDropdownSelectOption[],
    selectedShopeeBatch: {} as ScannerDropdownSelectOption,
    filteredShopeeOrders: null as OrderWithBatchNo[] | null,
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
    const {
      selectedFromDate,
      selectedToDate,
      filteredLazadaOrders,
    } = this.state;
    services.getOrdersWithDate(
      selectedFromDate,
      selectedToDate,
      PROVIDER.lazada.id,
      (orders) => {
        const groupedByBatch = _.groupBy(orders, (order) =>
          order.createdDate.toDate()
        );
        const batchOptions = Object.values(groupedByBatch).map(
          (batch, index) => {
            return {
              id: (index + 1).toString(),
              name: "Batch " + (index + 1).toString(),
            };
          }
        ) as ScannerDropdownSelectOption[];
        const finalBatch = [
          ...[{ id: "all", name: "All Batch" }],
          ...batchOptions,
        ];

        const ordersWithBatch = Object.values(groupedByBatch).map(
          (batch, index) => {
            return batch.map((order) => {
              return {
                batchNo: index + 1,
                ...order,
              } as OrderWithBatchNo;
            });
          }
        );

        this.setState({
          lazadaOrders: _.flatten(ordersWithBatch),
          lazadaBatchOptions: finalBatch,
          selectedLazadaBatch: finalBatch[0],
        });
        if (!_.isNull(filteredLazadaOrders)) {
          this.filterLazadaOrders();
        }
      }
    );
  };

  getShopeeOrders = () => {
    const {
      selectedFromDate,
      selectedToDate,
      filteredShopeeOrders,
    } = this.state;
    services.getOrdersWithDate(
      selectedFromDate,
      selectedToDate,
      PROVIDER.shopee.id,
      (orders) => {
        const groupedByBatch = _.groupBy(orders, (order) =>
          order.createdDate.toDate()
        );
        const batchOptions = Object.values(groupedByBatch).map(
          (batch, index) => {
            return {
              id: (index + 1).toString(),
              name: "Batch " + (index + 1).toString(),
            };
          }
        ) as ScannerDropdownSelectOption[];
        const finalBatch = [
          ...[{ id: "all", name: "All Batch" }],
          ...batchOptions,
        ];

        const ordersWithBatch = Object.values(groupedByBatch).map(
          (batch, index) => {
            return batch.map((order) => {
              return {
                batchNo: index + 1,
                ...order,
              } as OrderWithBatchNo;
            });
          }
        );

        this.setState({
          shopeeOrders: _.flatten(ordersWithBatch),
          shopeeBatchOptions: finalBatch,
          selectedShopeeBatch: finalBatch[0],
        });
        if (!_.isNull(filteredShopeeOrders)) {
          this.filterShopeeOrders();
        }
      }
    );
  };

  formatLazadaOrders = () => {
    const { filteredLazadaOrders, lazadaOrders } = this.state;
    if (!_.isEmpty(lazadaOrders)) {
      const orders = !_.isNull(filteredLazadaOrders)
        ? filteredLazadaOrders
        : lazadaOrders!;
      const jsonFileToDownload = _.chunk(orders, 2).map((order) => {
        const col = {} as Partial<OrderPrintDetails>;
        col["Order ID"] = order[0].orderId;
        col.Status = _.find(
          Object.values(WAYBILL_STATUS),
          (status) => status.id === order[0].status
        )!.name;
        col["Date Added"] = moment(order[0].createdDate.toDate()).format(
          "MM-DD-YYYY HH:MM:SS"
        );

        col[""] = "";
        if (order.length > 1) {
          col["Order ID "] = order[1].orderId;
          col["Status "] = _.find(
            Object.values(WAYBILL_STATUS),
            (status) => status.id === order[1].status
          )!.name;
          col["Date Added "] = moment(order[1].createdDate.toDate()).format(
            "MM-DD-YYYY HH:MM:SS"
          );
        } else {
          col["Order ID "] = "";
          col["Status "] = "";
          col["Date Added "] = "";
        }
        return col as OrderPrintDetails;
      });
      const finalJsonFileToDownload = [
        ...jsonFileToDownload,
        {},
        {},
        {
          "Order ID": "Courier: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": `Total No. of Parcel: ${orders.length}`,
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Recieved By: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Plate: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": `Date and Time: ${moment(new Date()).format(
            "MM/DD/YYYY HH:MM:SS"
          )}`,
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Released By: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Checked By: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
      ];

      return finalJsonFileToDownload;
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
        `Lazada-${moment(new Date()).format("MM-DD-YYYY HH:MM:SS").toString()}`
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
      const orders = !_.isNull(filteredShopeeOrders)
        ? filteredShopeeOrders
        : shopeeOrders!;
      const jsonFileToDownload = _.chunk(orders, 2).map((order) => {
        const col = {} as Partial<OrderPrintDetails>;
        col["Order ID"] = order[0].orderId;
        col.Status = _.find(
          Object.values(WAYBILL_STATUS),
          (status) => status.id === order[0].status
        )!.name;
        col["Date Added"] = moment(order[0].createdDate.toDate()).format(
          "MM-DD-YYYY HH:MM:SS"
        );
        col[""] = "";
        if (order.length > 1) {
          col["Order ID "] = order[1].orderId;
          col["Status "] = _.find(
            Object.values(WAYBILL_STATUS),
            (status) => status.id === order[1].status
          )!.name;
          col["Date Added "] = moment(order[1].createdDate.toDate()).format(
            "MM-DD-YYYY HH:MM:SS"
          );
        } else {
          col["Order ID "] = "";
          col["Status "] = "";
          col["Date Added "] = "";
        }

        return col as OrderPrintDetails;
      });
      const finalJsonFileToDownload = [
        ...jsonFileToDownload,
        {},
        {},
        {
          "Order ID": "Courier: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": `Total No. of Parcel: ${orders.length}`,
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Recieved By: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Plate: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": `Date and Time: ${moment(new Date()).format(
            "MM/DD/YYYY HH:MM:SS"
          )}`,
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Released By: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
        {},
        {
          "Order ID": "Checked By: __________________",
          Status: "",
          "Date Added": "",
          "": "",
          "Order ID ": "",
          "Status ": "",
          "Date Added ": "",
        },
      ];

      return finalJsonFileToDownload;
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
        `Shopee-${moment(new Date()).format("MM-DD-YYYY HH:MM:SS").toString()}`
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
      selectedLazadaBatch,
      isLazadaCancelledOrdersSelected,
      isLazadaReturnedOrdersSelected,
      isLazadaRelesedOrdersSelected,
    } = this.state;

    const compactStatus = _.compact([
      isLazadaCancelledOrdersSelected,
      isLazadaReturnedOrdersSelected,
      isLazadaRelesedOrdersSelected,
      selectedLazadaBatch.id !== "all",
    ]);
    if (compactStatus.length === 3 || compactStatus.length === 0) {
      this.setState({
        filteredLazadaOrders: null,
      });
    } else {
      if (!_.isEmpty(lazadaOrders)) {
        const newFilteredOrders = _.filter(lazadaOrders, (order) => {
          let result = true;
          const compactOrderStatus = _.compact([
            isLazadaCancelledOrdersSelected,
            isLazadaReturnedOrdersSelected,
            isLazadaRelesedOrdersSelected,
          ]);
          if (
            compactOrderStatus.length === 3 ||
            compactOrderStatus.length === 0
          ) {
            result = true;
          } else {
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
          }

          if (
            selectedLazadaBatch.id !== "all" &&
            selectedLazadaBatch.id !== order.batchNo.toString()
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
      selectedShopeeBatch,
    } = this.state;

    const compactStatus = _.compact([
      isShopeeCancelledOrdersSelected,
      isShopeeReturnedOrdersSelected,
      isShopeeRelesedOrdersSelected,
      selectedShopeeBatch.id !== "all",
    ]);
    if (compactStatus.length === 4 || compactStatus.length === 0) {
      this.setState({
        filteredShopeeOrders: null,
      });
    } else {
      if (!_.isEmpty(shopeeOrders)) {
        const newFilteredOrders = _.filter(shopeeOrders, (order) => {
          let result = true;
          const compactOrderStatus = _.compact([
            isShopeeCancelledOrdersSelected,
            isShopeeReturnedOrdersSelected,
            isShopeeRelesedOrdersSelected,
          ]);
          if (
            compactOrderStatus.length === 3 ||
            compactOrderStatus.length === 0
          ) {
            result = true;
          } else {
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
          }

          if (
            selectedShopeeBatch.id !== "all" &&
            selectedShopeeBatch.id !== order.batchNo.toString()
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

  setSelectedDateFromAndRefresh = async (selectedFromDate: Date) => {
    this.setState({ selectedFromDate, lazadaOrders: null, shopeeOrders: null });
    setTimeout(() => {
      this.getLazadaOrders();
      this.getShopeeOrders();
    }, 500);
  };
  setSelectedDateToAndRefresh = async (selectedToDate: Date) => {
    this.setState({ selectedToDate, lazadaOrders: null, shopeeOrders: null });
    setTimeout(() => {
      this.getLazadaOrders();
      this.getShopeeOrders();
    }, 500);
  };

  deleteOrder = async (docId: string) => {
    try {
      this.setState({
        isLoading: true,
      });
      await services.deleteOrderId(docId);
      this.setState({
        success: "Order Deleted",
        isLoading: false,
      });
    } catch (e) {
      this.setState({
        error: e,
        isLoading: false,
      });
    }
  };

  render = () => {
    const {
      lazadaOrders,
      calendarFromAnchor,
      calendarToAnchor,
      selectedFromDate,
      selectedToDate,
      filteredLazadaOrders,
      lazadaBatchOptions,
      selectedLazadaBatch,
      isLazadaCancelledOrdersSelected,
      isLazadaReturnedOrdersSelected,
      isLazadaRelesedOrdersSelected,
      shopeeOrders,
      filteredShopeeOrders,
      shopeeBatchOptions,
      selectedShopeeBatch,
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
            <div className="date-range-container">
              <IonItem lines="none" className="ion-no-padding">
                <IonLabel
                  position="floating"
                  className="ion-padding-bottom wc-h3 bold"
                >
                  From Date
                </IonLabel>
                <IonInput
                  className="selected-date-input"
                  value={moment(selectedFromDate).format("MM-DD-YYYY")}
                  readonly={true}
                  onClick={(event) => {
                    this.setState({ calendarFromAnchor: event.nativeEvent });
                  }}
                />
              </IonItem>
              <IonItem lines="none" className="ion-no-padding">
                <IonLabel
                  position="floating"
                  className="ion-padding-bottom wc-h3 bold"
                >
                  To Date
                </IonLabel>
                <IonInput
                  className="selected-date-input"
                  value={moment(selectedToDate).format("MM-DD-YYYY")}
                  readonly={true}
                  onClick={(event) => {
                    this.setState({ calendarToAnchor: event.nativeEvent });
                  }}
                />
              </IonItem>
            </div>
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
                    <div className="order-provider-options">
                      <div className="batch-option-div">
                        <ScannerDropdownSelect
                          value={
                            !_.isEmpty(selectedLazadaBatch)
                              ? selectedLazadaBatch.name
                              : ""
                          }
                          options={lazadaBatchOptions}
                          onSelectItem={(selectedLazadaBatch) => {
                            this.setState({
                              selectedLazadaBatch,
                            });
                            setTimeout(() => {
                              this.filterLazadaOrders();
                            });
                          }}
                          selectFromOptionsRequired={true}
                        />
                      </div>
                      <IonButton onClick={this.downloadLazadaOrders}>
                        <IonIcon icon={downloadOutline} />
                      </IonButton>
                    </div>
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
                            <IonCol className="order-table-header" size="3.33">
                              <IonLabel className="wc-h3 bold white">
                                Order ID
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="3.33">
                              <IonLabel className="wc-h3 bold white">
                                Status
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="3.33">
                              <IonLabel className="wc-h3 bold white">
                                Date Added
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="1">
                              <IonLabel className="wc-h3 bold white">
                                Batch
                              </IonLabel>
                            </IonCol>
                            <IonCol
                              className="order-table-header"
                              size="1"
                            ></IonCol>
                          </IonRow>
                          {(!_.isNull(filteredLazadaOrders)
                            ? filteredLazadaOrders
                            : lazadaOrders
                          ).map((order) => {
                            return (
                              <IonRow>
                                <IonCol className="order-col" size="3.33">
                                  <IonLabel className="wc-h4">
                                    {order.orderId}
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="3.33">
                                  <IonLabel className="wc-h4">
                                    {
                                      _.find(
                                        Object.values(WAYBILL_STATUS),
                                        (status) => status.id === order.status
                                      )!.name
                                    }
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="3.33">
                                  <IonLabel className="wc-h4">
                                    {moment(order.createdDate.toDate()).format(
                                      "MM-DD-YYYY HH:MM:SS"
                                    )}
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="1">
                                  <IonLabel className="wc-h4">
                                    {order.batchNo}
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="1">
                                  <IonButton
                                    fill="clear"
                                    onClick={() => {
                                      this.deleteOrder(order.docId || "");
                                    }}
                                  >
                                    <IonIcon icon={trashBinOutline} />
                                  </IonButton>
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
                    <div className="order-provider-options">
                      <div className="batch-option-div">
                        <ScannerDropdownSelect
                          value={
                            !_.isEmpty(selectedShopeeBatch)
                              ? selectedShopeeBatch.name
                              : ""
                          }
                          options={shopeeBatchOptions}
                          onSelectItem={(selectedShopeeBatch) => {
                            this.setState({
                              selectedShopeeBatch,
                            });
                            setTimeout(() => {
                              this.filterShopeeOrders();
                            });
                          }}
                          selectFromOptionsRequired={true}
                        />
                      </div>
                      <IonButton onClick={this.downloadShopeeOrders}>
                        <IonIcon icon={downloadOutline} />
                      </IonButton>
                    </div>
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
                            <IonCol className="order-table-header" size="3.33">
                              <IonLabel className="wc-h3 bold white">
                                Order ID
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="3.33">
                              <IonLabel className="wc-h3 bold white">
                                Status
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="3.33">
                              <IonLabel className="wc-h3 bold white">
                                Date Added
                              </IonLabel>
                            </IonCol>
                            <IonCol className="order-table-header" size="1">
                              <IonLabel className="wc-h3 bold white">
                                Batch
                              </IonLabel>
                            </IonCol>
                            <IonCol
                              className="order-table-header"
                              size="1"
                            ></IonCol>
                          </IonRow>
                          {(!_.isNull(filteredShopeeOrders)
                            ? filteredShopeeOrders
                            : shopeeOrders
                          ).map((order) => {
                            return (
                              <IonRow>
                                <IonCol className="order-col" size="3.33">
                                  <IonLabel className="wc-h4">
                                    {order.orderId}
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="3.33">
                                  <IonLabel className="wc-h4">
                                    {
                                      _.find(
                                        Object.values(WAYBILL_STATUS),
                                        (status) => status.id === order.status
                                      )!.name
                                    }
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="3.33">
                                  <IonLabel className="wc-h4">
                                    {moment(order.createdDate.toDate()).format(
                                      "MM-DD-YYYY HH:MM:SS"
                                    )}
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="1">
                                  <IonLabel className="wc-h4">
                                    {order.batchNo}
                                  </IonLabel>
                                </IonCol>
                                <IonCol className="order-col" size="1">
                                  <IonButton
                                    fill="clear"
                                    onClick={() => {
                                      this.deleteOrder(order.docId || "");
                                    }}
                                  >
                                    <IonIcon icon={trashBinOutline} />
                                  </IonButton>
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
          calendarAnchor={calendarFromAnchor}
          selectedDate={selectedFromDate}
          removeCalendarAnchor={() => {
            this.setState({ calendarFromAnchor: null });
          }}
          onDateChange={this.setSelectedDateFromAndRefresh}
          minDate={new Date()}
        />

        <ScannerCalendar
          calendarAnchor={calendarToAnchor}
          selectedDate={selectedToDate}
          removeCalendarAnchor={() => {
            this.setState({ calendarToAnchor: null });
          }}
          onDateChange={this.setSelectedDateToAndRefresh}
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
