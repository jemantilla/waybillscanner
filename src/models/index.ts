import { Provider, WaybillStatus } from "../interface";

export interface Orders {
  docId?: string;
  provider: Provider;
  orderId: string;
  status: WaybillStatus;
  createdDate: firebase.firestore.Timestamp;
}
