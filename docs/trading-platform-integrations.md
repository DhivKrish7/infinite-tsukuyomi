# Trading Platform Integration Architecture

The broker integration layer is intentionally separated from app routes and UI code.

```txt
src/server/broker-integrations/
  adapters/              Broker-specific plugins
  api/                   API payload validation
  core/                  Adapter interface, registry, event bus, websocket gateway abstraction
  plugins/               Adapter registration
  services/              Connection lifecycle and health checks
  sync/                  Account, trade, transaction, and balance sync engines
```

## Adapter Contract

Every broker plugin implements `BrokerAdapter`:

- metadata: key, vendor, version, capabilities
- config validation
- health check
- account sync fetcher
- trade sync fetcher
- transaction sync fetcher
- optional realtime balance subscription

Adapters normalize broker data only. They do not write to the database.

## Sync Ownership

Persistence belongs to sync engines:

- `AccountSyncEngine` upserts clients, trading accounts, balance snapshots, and publishes balance events.
- `TradeSyncEngine` upserts trade history by platform/account/ticket.
- `TransactionSyncEngine` upserts deposits, withdrawals, fees, transfers, and commissions.
- `BrokerSyncOrchestrator` coordinates connection-level syncs.

## Realtime Layer

Adapters publish normalized `balance.updated` events to `BrokerIntegrationEventBus`.
`BrokerRealtimeGateway` is the websocket-facing abstraction that can be bound to a Node websocket server when the backend runtime moves from route handlers to a long-lived API process.
