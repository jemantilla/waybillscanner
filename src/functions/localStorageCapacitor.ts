import { Plugins } from "@capacitor/core";

const { Storage } = Plugins;

export const setItem = async (key: string, value: string) => {
  await Storage.set({
    key,
    value,
  });
};

export const getItem = async (key: string) => {
  const { value } = await Storage.get({ key });
  return value;
};

export const removeItem = async () => {
  await Storage.remove({ key: "name" });
};

export const keys = async () => {
  const { keys } = await Storage.keys();
  return keys;
};

export const clear = async () => {
  await Storage.clear();
};
