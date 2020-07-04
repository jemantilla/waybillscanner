import moment from "moment";
import * as _ from "lodash";

import { firestore } from "../firebase";
import { getServerTimestamp, daysSinceDate } from "../functions/common";
import { Orders, ClearDB } from "../models";
import { Provider, WaybillStatus } from "../interface";
import { ORDERS, CLEAR_DB } from "../constants/dbCollections";
import { WAYBILL_STATUS } from "../constants/config";

export const submitScannedWaybill = async (
  provider: Provider,
  orderId: string,
  status: WaybillStatus
) => {
  await firestore.collection(ORDERS).add({
    provider,
    orderId,
    status,
    createdDate: getServerTimestamp(),
  });
};

export const getLatestWaybills = async (
  callback: (orders: Orders[]) => void
) => {
  try {
    const dateMax = new Date();
    dateMax.setHours(23);
    dateMax.setMinutes(59);
    dateMax.setSeconds(59);
    dateMax.setMilliseconds(59);

    const dateMin = moment(_.clone(dateMax)).subtract(3, "days").toDate();
    dateMin.setHours(0);
    dateMin.setMinutes(0);
    dateMin.setSeconds(0);
    dateMin.setMilliseconds(0);
    dateMin.setMilliseconds(59);

    firestore
      .collection(ORDERS)
      .where("createdDate", ">=", dateMin)
      .where("createdDate", "<=", dateMax)
      .where("status", "in", [
        WAYBILL_STATUS.cancelled.id,
        WAYBILL_STATUS.forRelease.id,
      ])
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const orders = snapshot.docs.map((order) => {
            return { docId: order.id, ...order.data() } as Orders;
          });
          callback(orders);
        } else {
          callback([]);
        }
      });
  } catch (e) {
    console.log("ERROR IN GETTING LATEST WAYBILLS");
    callback([]);
  }
};

export const getOrdersWithDate = async (
  date: Date,
  provider: Provider,
  callback: (orders: Orders[]) => void
) => {
  try {
    const dateMin = _.clone(date);
    dateMin.setHours(0);
    dateMin.setMinutes(0);
    dateMin.setSeconds(0);
    dateMin.setMilliseconds(0);

    const dateMax = _.clone(date);
    dateMax.setHours(23);
    dateMax.setMinutes(59);
    dateMax.setSeconds(59);
    dateMax.setMilliseconds(59);

    firestore
      .collection(ORDERS)
      .where("createdDate", ">=", dateMin)
      .where("createdDate", "<=", dateMax)
      .where("provider", "==", provider)
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const orders = snapshot.docs.map((order) => {
            return { docId: order.id, ...order.data() } as Orders;
          });
          callback(orders);
        } else {
          callback([]);
        }
      });
  } catch (e) {
    console.log("ERROR IN GETTING ORDERS WITH DATE");
    callback([]);
  }
};

export const shouldClearDatabase = async () => {
  const result = await firestore.collection(CLEAR_DB).get();
  if (!result.empty) {
    const clearDBInfo = result.docs[0].data() as ClearDB;
    if (daysSinceDate(clearDBInfo.lastClearDate.toDate()) >= 180) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

export const clearOrders = async () => {
  const orders = await firestore.collection(ORDERS).get();
  if (!orders.empty) {
    await Promise.all(orders.docs.map((order) => order.ref.delete()));
  }

  const latestClear = await firestore.collection(CLEAR_DB).get();
  if (!latestClear.empty) {
    await latestClear.docs[0].ref.update({
      lastClearDate: getServerTimestamp(),
    });
  } else {
    await firestore.collection(CLEAR_DB).add({
      lastClearDate: getServerTimestamp(),
    });
  }
};
