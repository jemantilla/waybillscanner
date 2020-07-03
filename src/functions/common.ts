import * as _ from "lodash";
import moment from "moment";
import { isPlatform } from "@ionic/react";
import { useEffect } from "react";

import * as capacitorStorage from "./localStorageCapacitor";
import { fb } from "../firebase";
import { LOCAL_STORAGE } from "../config/index";

let { json2excel } = require("js2excel");

export const getRequestHeaders = async () => {
  const id_token = await capacitorStorage.getItem(LOCAL_STORAGE.fbIdToken);
  const user_id = await capacitorStorage.getItem(LOCAL_STORAGE.userId);
  return {
    "Content-Type": "application/json",
    id_token,
    user_id,
  };
};

export const formatString = (str: string) => {
  return str.trim();
};

export const validatePassword = (password: string) => {
  return password.trim().length >= 8;
};

export const hasOnlyNumbers = (value: string) => {
  return /^\d+$/.test(value) || value.length === 0;
};

export const encodeQueryData = (data: any) => {
  return Object.keys(data)
    .map(function (key: any) {
      return [key, data[key]].map(encodeURIComponent).join("=");
    })
    .join("&");
};

export const toDateTimeFromSecs = (secs: number) => {
  return new Date(secs * 1000);
};

export const useEffectOnlyOnce = (func: () => void) => useEffect(func, []);

export const isMobile = () =>
  (isPlatform("ios") || isPlatform("android") || isPlatform("mobileweb")) &&
  !isPlatform("tablet");

export const isToday = (date: Date) => {
  const dateToday = new Date();
  const month = dateToday.getMonth();
  const monthDay = dateToday.getDate();
  const year = dateToday.getFullYear();

  const sameMonth = date.getMonth() === month;
  const sameMonthDay = date.getDate() === monthDay;
  const sameYear = date.getFullYear() === year;

  return sameMonth && sameMonthDay && sameYear;
};

export const isHistoricalDate = (date: Date) => {
  return moment(moment(date).format("YYYY-MM-DD")).isBefore(
    moment(new Date()).format("YYYY-MM-DD")
  );
};

export const isSameDate = (date: Date, date2: Date) => {
  return moment(date).isSame(moment(date2), "day");
};

export const daysSinceDate = (dateSince: Date, dateFrom = new Date()) => {
  const daySince = moment(dateSince);
  const targetDate = moment(dateFrom);
  const activeSinceDays = targetDate.diff(daySince, "days");
  return activeSinceDays;
};

export const dateTomorrow = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const validURL = (str: string) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
};

export const getNotebookHoles = () => {
  let holes = [];

  for (let x = 0; x < 24; x++) {
    holes.push(x);
  }
  return holes;
};

export const getSiteVisFormattedDate = (date: Date) => {
  return moment(date).format("ddd, DD MMM YYYY");
};

export const isNullAndLoadingORNotEmpty = (obj: any) => {
  return _.isNull(obj) || (!_.isEmpty(obj) && !_.isNull(obj));
};

export const getServerTimestamp = (
  date: null | Date = null
): firebase.firestore.Timestamp => {
  if (!_.isNull(date)) {
    return fb.firestore.Timestamp.fromDate(date);
  }
  return fb.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
};

export const download = (data: any[], fileName: string) => {
  try {
    json2excel({
      data,
      name: fileName,
      formateDate: "yyyy/mm/dd",
    });
  } catch (e) {
    console.error("export error");
  }
};
