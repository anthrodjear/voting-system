# Blockchain Configuration Guide

## Environment Variables

Add the following to your `.env` file to configure the blockchain service:

```env
# Blockchain (Hyperledger Besu)
# Private blockchain RPC endpoint
BLOCKCHAIN_RPC_URL=http://localhost:8545

# WebSocket endpoint (optional, for real-time events)
BLOCKCHAIN_WS_URL=ws://localhost:8546

# Authentication token for RPC (optional)
BLOCKCHAIN_AUTH_TOKEN=

# Vote smart contract address (must be deployed)
BLOCKCHAIN_VOTE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000001

# Key Manager smart contract address (must be deployed)
BLOCKCHAIN_KEY_MANAGER_ADDRESS=0x0000000000000000000000000000000000000002

# Network ID (1337 for local development, 648529 for Kenya IEBC network)
BLOCKCHAIN_NETWORK_ID=1337

# Gas limit for transactions (default: 500000)
BLOCKCHAIN_GAS_LIMIT=500000

# Gas price in Wei (optional, will use network price if empty)
BLOCKCHAIN_GAS_PRICE=

# Confirmation blocks required (default: 1)
BLOCKCHAIN_CONFIRMATION_BLOCKS=1

# RPC timeout in milliseconds (default: 30000)
BLOCKCHAIN_TIMEOUT=30000
```

## Local Development Setup

### 1. Start Hyperledger Besu Node

```bash
# Using Docker
docker run -d --name besu-node \
  -p 8545:8545 -p 8546:8546 -p 30303:30303 \
  hyperledger/besu:latest \
  --network-id=1337 \
  --rpc-http-enabled=true \
  --rpc-http-host=0.0.0.0 \
  --rpc-http-port=8545 \
  --rpc-ws-enabled=true \
  --rpc-ws-host=0.0.0.0 \
  --rpc-ws-port=8546 \
  --miner-enabled=true \
  --miner-coinbase=0x1234567890123456789012345678901234567890
```

### 2. Deploy Smart Contracts

Deploy the `VoteContract` and `KeyManagerContract` to the Besu network:

```bash
# Compile contracts (requires Hardhat or Truffle)
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Configure Environment

Update your `.env` with the deployed contract addresses:

```
BLOCKCHAIN_VOTE_CONTRACT_ADDRESS=0x... (from deployment output)
BLOCKCHAIN_KEY_MANAGER_ADDRESS=0x... (from deployment output)
```

## Production Setup

### Validator Network Configuration

For the Kenya IEBC production network, the following validator nodes are configured:

| Node | County | RPC Endpoint |
|------|--------|--------------|
| validator-nairobi-1 | Nairobi | https://besu.iebc.ke/rpc |
| validator-mombasa-1 | Mombasa | https://besu-mombasa.iebc.ke/rpc |
| validator-kisumu-1 | Kisumu | https://besu-kisumu.iebc.ke/rpc |

### Security Considerations

1. **TLS/SSL**: Always use HTTPS/WSS in production
2. **Authentication**: Set `BLOCKCHAIN_AUTH_TOKEN` for RPC authentication
3. **Firewall**: Restrict RPC access to application servers only
4. **Monitoring**: Set up alerts for network health checks

## Health Checks

The blockchain service provides network health monitoring via `checkNetworkHealth()`:

```typescript
const health = await blockchainService.checkNetworkHealth();

console.log({
  connected: health.connected,
  peerCount: health.peerCount,
  blockNumber: health.blockNumber,
  isSyncing: health.isSyncing,
  nodeStatus: health.nodeStatus,
});
```

## Error Handling

The service throws custom errors for different failure scenarios:

- `VoterNotEligibleError`: Voter cannot vote (already voted, not registered, etc.)
- `TransactionFailedError`: Blockchain transaction failed
- `NetworkError`: Network connectivity issues
- `ContractError`: Smart contract call failed
- `ElectionStateError`: Operation not allowed in current election state

## Performance Tuning

### Gas Settings

Adjust `BLOCKCHAIN_GAS_LIMIT` based on network congestion:

- Low congestion: 300000
- Normal: 500000
- High congestion: 1000000

### Timeout Configuration

Increase `BLOCKCHAIN_TIMEOUT` for slower networks:

```env
BLOCKCHAIN_TIMEOUT=60000  # 60 seconds
```

### Connection Pooling

For high-throughput scenarios, consider:
- Using WebSocket connections for subscriptions
- Implementing connection pooling at the load balancer
- Using read replicas for query operations
