import { brokerAdapterLoader } from "../core/adapter-loader";

export async function registerBrokerAdapters() {
  return brokerAdapterLoader.loadAvailable();
}
