import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const storageUtil = {
  setItem: async (k: string, v: string) => {
    if (Platform.OS === "web") {
      // web
      await AsyncStorage.setItem(k, v);
    } else {
      // mobile
      await SecureStore.setItemAsync(k, v.toString()); // v must be string,
    }
  },
  getItem: async (k: string) => {
    if (Platform.OS === "web") {
      // web
      return await AsyncStorage.getItem(k);
    } else {
      // mobile
      return await SecureStore.getItemAsync(k);
    }
  },
  deleteItem: async (k: string) => {
    if (Platform.OS === "web") {
      // web
      await AsyncStorage.removeItem(k);
    } else {
      // mobile
      await SecureStore.deleteItemAsync(k);
    }
  },
};
export default storageUtil;
