# Voting System Smart Contracts

This directory contains the secure smart contracts for the blockchain voting system.

## Contracts

### 1. VoteContract.sol
Main voting contract with the following security features:
- **ZK Proof Verification**: Actual implementation of zero-knowledge proof verification
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Access Control**: Role-based access control (RBAC) via OpenZeppelin
- **Input Validation**: Zero-value checks, proof length validation
- **Pausable**: Emergency stop functionality

### 2. ElectionKeyManager.sol
Key management contract with the following security features:
- **Access Control**: Only authorized key setters can modify keys
- **Key Ceremony**: Distributed key generation support
- **Key Rotation**: Timelocked key rotation (30 days)
- **Emergency Reset**: Admin emergency key reset capability
- **Input Validation**: Key format and length validation

## Security Fixes Applied

### Issue 1: ZK Proof Verification (CRITICAL) ✅ FIXED
**Previous**: Stubbed `return true;`
**Now**: Actual ZK-SNARK verification including:
- Verification key retrieval from key manager
- Public input extraction from proof
- Cryptographic integrity checks
- Curve point validation for EC-based proofs

### Issue 2: Unrestricted Key Setting (CRITICAL) ✅ FIXED
**Previous**: No access control
**Now**: 
- `onlyKeySetter` modifier
- Role-based access control
- Input validation for key formats
- Key ceremony support for distributed key generation

### Issue 3: Missing Input Validation (HIGH) ✅ FIXED
**Previous**: No validation on inputs
**Now**:
- Zero bytes32 validation
- Proof length validation (64-1024 bytes)
- Reentrancy guards on critical functions
- Comprehensive error messages

## Prerequisites

```bash
# Install Node.js dependencies
npm install

# Compile contracts
npm run compile
```

## Deployment

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy to localhost
npm run deploy:localhost
```

### Testnet (Sepolia)

```bash
# Set environment variables in .env
cp .env.example .env
# Edit .env with your private key and RPC URLs

# Deploy
npm run deploy:sepolia
```

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npx hardhat test test/VoteContract.js
```

## Contract Interface

### VoteContract

```solidity
// Vote casting
function castVote(
    bytes32 _voterHash,      // Hash of voter identity
    bytes32 _voteHash,       // Hash of encrypted vote
    bytes calldata _proof,   // ZK proof (64-1024 bytes)
    bytes32 _blindingFactor   // Blinding factor used
) external nonReentrant whenNotPaused;

// Election management
function setElectionState(ElectionState _state) external;
function addCandidate(bytes32 _candidateId) external;

// View functions
function hasVoted(bytes32 _voterHash) external view returns (bool);
function getVoteProof(bytes32 _voterHash) external view returns (...);
```

### ElectionKeyManager

```solidity
// Key management
function setElectionKeys(
    bytes calldata _hePublicKey,
    bytes calldata _zkpVerificationKey
) external onlyKeySetter;

// Key rotation (after 30 days)
function rotateKeys(
    bytes calldata _newHePublicKey,
    bytes calldata _newZkpVerificationKey
) external onlyKeySetter;

// Emergency reset
function emergencyKeyReset(
    bytes calldata _newHePublicKey,
    bytes calldata _newZkpVerificationKey
) external onlyRole(ADMIN_ROLE);

// View functions
function getHePublicKey() external view returns (bytes);
function getZkpVerificationKey() external view returns (bytes);
```

## Integration

### Backend Integration

Import the contract configuration:

```typescript
import {
  networks,
  contractAddresses,
  electionKeyManagerABI,
  voteContractABI,
  ElectionState,
  getNetworkConfig,
  getContractAddresses,
  GAS_LIMITS,
} from './blockchain/config/contracts';

// Get web3 instance
const web3 = new Web3(rpcUrl);

// Get contract instances
const keyManager = new web3.eth.Contract(
  electionKeyManagerABI,
  addresses.electionKeyManager
);

const voteContract = new web3.eth.Contract(
  voteContractABI,
  addresses.voteContract
);
```

## Gas Estimates

| Function | Estimated Gas |
|----------|---------------|
| castVote | ~400,000 |
| setElectionKeys | ~250,000 |
| rotateKeys | ~250,000 |
| addCandidate | ~80,000 |
| setElectionState | ~50,000 |

## Security Considerations

1. **Private Key Security**: Never commit private keys
2. **Key Ceremony**: Use multi-party computation for key generation
3. **Monitoring**: Set up event monitoring for suspicious activity
4. **Upgrades**: Consider proxy pattern for future upgrades
5. **Testing**: Always test on testnet before mainnet

## License

MIT
