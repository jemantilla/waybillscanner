import { Provider, WaybillStatus } from "../interface";

export interface Orders {
  docId?: string;
  provider: Provider;
  orderId: string;
  status: WaybillStatus;
  createdDate: firebase.firestore.Timestamp;
}

export interface OrderPrintDetails {
  "Order ID": string;
  Status: string;
  "Date Added": string;
  "": string;
  "Order ID ": string;
  "Status ": string;
  "Date Added ": string;
}

export interface ClearDB {
  lastClearDate: firebase.firestore.Timestamp;
}
