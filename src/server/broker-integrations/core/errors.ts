export class BrokerIntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BrokerIntegrationError";
  }
}

export class BrokerAdapterNotFoundError extends BrokerIntegrationError {
  constructor(adapterKey: string) {
    super(`Broker adapter not registered: ${adapterKey}`, "BROKER_ADAPTER_NOT_FOUND", { adapterKey });
  }
}
