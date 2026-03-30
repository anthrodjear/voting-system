// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ElectionKeyManager
 * @dev Manages election cryptographic keys with proper access control
 * 
 * Security Features:
 * - Role-based access control (RBAC)
 * - Multi-signature support for key ceremonies
 * - Input validation for key formats
 * - Key rotation with timelock
 * - Reentrancy guards
 * - Comprehensive event logging
 * 
 * Keys managed:
 * - HE Public Key: For homomorphic encryption of votes
 * - ZKP Verification Key: For zero-knowledge proof verification
 */
contract ElectionKeyManager is AccessControl, ReentrancyGuard, Pausable {
    
    // ============================================
    // Data Structures
    // ============================================
    
    /// @notice Key ceremony participant
    struct KeyHolder {
        address participant;
        bytes32 publicKey;
        bool hasContributed;
        uint256 contributionTime;
    }
    
    /// @notice Key ceremony state
    struct KeyCeremonyState {
        uint256 requiredParticipants;
        uint256 currentParticipants;
        bool isInitialized;
        bool isCompleted;
        bytes32 ceremonyId;
    }
    
    // ============================================
    // Roles
    // ============================================
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KEY_SETTER_ROLE = keccak256("KEY_SETTER_ROLE");
    bytes32 public constant KEY_CEREMONY_ROLE = keccak256("KEY_CEREMONY_ROLE");
    
    // ============================================
    // State Variables
    // ============================================
    
    /// @notice Homomorphic encryption public key
    bytes public hePublicKey;
    
    /// @notice ZKP verification key (for ZK-SNARKs)
    bytes public zkpVerificationKey;
    
    /// @notice Whether keys have been initialized
    bool public keysInitialized;
    
    /// @notice Key ceremony participants
    mapping(address => KeyHolder) public keyHolders;
    
    /// @notice Array of key holder addresses
    address[] public keyHolderAddresses;
    
    /// @notice Current key ceremony state
    KeyCeremonyState public ceremonyState;
    
    /// @notice Last key rotation timestamp
    uint256 public lastKeyRotation;
    
    /// @notice Minimum time between key rotations (30 days)
    uint256 public constant KEY_ROTATION_INTERVAL = 30 days;
    
    /// @notice Maximum HE public key length (8192 bytes for 4096-bit keys)
    uint256 public constant MAX_HE_KEY_LENGTH = 8192;
    
    /// @notice Minimum HE public key length (64 bytes for 256-bit keys)
    uint256 public constant MIN_HE_KEY_LENGTH = 64;
    
    /// @notice Maximum ZKP verification key length
    uint256 public constant MAX_ZKP_KEY_LENGTH = 4096;
    
    /// @notice Minimum ZKP verification key length
    uint256 public constant MIN_ZKP_KEY_LENGTH = 32;
    
    /// @notice Admin who can set key setter role
    address public primaryAdmin;
    
    // ============================================
    // Events
    // ============================================
    
    /// @notice Emitted when election keys are set
    event KeysSet(
        bytes indexed hePublicKey,
        bytes indexed zkpVerificationKey,
        address indexed setter
    );
    
    /// @notice Emitted when keys are rotated
    event KeysRotated(
        bytes oldHeKeyHash,
        bytes newHeKeyHash,
        uint256 timestamp,
        address indexed rotator
    );
    
    /// @notice Emitted when key ceremony starts
    event KeyCeremonyStarted(
        bytes32 indexed ceremonyId,
        uint256 requiredParticipants,
        address indexed initiator
    );
    
    /// @notice Emitted when key ceremony participant contributes
    event KeyCeremonyContribution(
        address indexed participant,
        bytes32 publicKey,
        uint256 participantCount,
        uint256 timestamp
    );
    
    /// @notice Emitted when key ceremony completes
    event KeyCeremonyCompleted(
        bytes32 indexed ceremonyId,
        uint256 totalParticipants,
        address indexed completedBy
    );
    
    /// @notice Emitted when key holder is added
    event KeyHolderAdded(
        address indexed holder,
        address indexed addedBy
    );
    
    /// @notice Emitted when key holder is removed
    event KeyHolderRemoved(
        address indexed holder,
        address indexed removedBy
    );
    
    /// @notice Emitted when emergency key reset occurs
    event EmergencyKeyReset(
        address indexed resetBy,
        uint256 timestamp
    );
    
    // ============================================
    // Errors
    // ============================================
    
    error KeysAlreadySet();
    error KeysNotSet();
    error InvalidHeKeyLength();
    error InvalidZkpKeyLength();
    error EmptyHeKey();
    error EmptyZkpKey();
    error InvalidKeySetter();
    error InvalidParticipant();
    error CeremonyNotInitialized();
    error CeremonyAlreadyCompleted();
    error InsufficientParticipants();
    error DuplicateContribution();
    error InvalidCeremonyId();
    error TooSoonToRotate();
    error KeyCeremonyInProgress();
    error ZeroAddress();
    error NotKeyHolder();
    
    // ============================================
    // Modifiers
    // ============================================
    
    /// @notice Modifier for key setter role
    modifier onlyKeySetter() {
        if (!hasRole(KEY_SETTER_ROLE, msg.sender)) {
            revert InvalidKeySetter();
        }
        _;
    }
    
    /// @notice Modifier for key ceremony role
    modifier onlyKeyCeremonyParticipant() {
        if (!hasRole(KEY_CEREMONY_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert InvalidParticipant();
        }
        _;
    }
    
    /// @notice Validate non-empty bytes
    modifier validBytes(bytes calldata data) {
        if (data.length == 0) {
            revert EmptyHeKey();
        }
        _;
    }
    
    /// @notice Validate HE key length
    modifier validHeKeyLength(uint256 length) {
        if (length < MIN_HE_KEY_LENGTH || length > MAX_HE_KEY_LENGTH) {
            revert InvalidHeKeyLength();
        }
        _;
    }
    
    /// @notice Validate ZKP key length
    modifier validZkpKeyLength(uint256 length) {
        if (length < MIN_ZKP_KEY_LENGTH || length > MAX_ZKP_KEY_LENGTH) {
            revert InvalidZkpKeyLength();
        }
        _;
    }
    
    // ============================================
    // Constructor
    // ============================================
    
    /**
     * @dev Contract constructor
     * @param _primaryAdmin Primary admin address
     */
    constructor(address _primaryAdmin) {
        if (_primaryAdmin == address(0)) {
            revert ZeroAddress();
        }
        
        primaryAdmin = _primaryAdmin;
        _grantRole(DEFAULT_ADMIN_ROLE, _primaryAdmin);
        _grantRole(ADMIN_ROLE, _primaryAdmin);
        _grantRole(KEY_SETTER_ROLE, _primaryAdmin);
        
        lastKeyRotation = block.timestamp;
    }
    
    // ============================================
    // Admin Functions
    // ============================================
    
    /**
     * @dev Add a key setter role
     * @param _account Address to grant key setter role
     */
    function addKeySetter(address _account) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (_account == address(0)) {
            revert ZeroAddress();
        }
        grantRole(KEY_SETTER_ROLE, _account);
    }
    
    /**
     * @dev Remove key setter role
     * @param _account Address to revoke key setter role
     */
    function removeKeySetter(address _account) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        revokeRole(KEY_SETTER_ROLE, _account);
    }
    
    /**
     * @dev Add key ceremony participant
     * @param _participant Address to add as participant
     */
    function addKeyHolder(address _participant) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (_participant == address(0)) {
            revert ZeroAddress();
        }
        if (keyHolders[_participant].hasContributed) {
            revert InvalidParticipant(); // Already a participant
        }
        
        keyHolders[_participant] = KeyHolder({
            participant: _participant,
            publicKey: bytes32(0),
            hasContributed: false,
            contributionTime: 0
        });
        
        keyHolderAddresses.push(_participant);
        
        emit KeyHolderAdded(_participant, msg.sender);
    }
    
    /**
     * @dev Remove key ceremony participant
     * @param _participant Address to remove
     */
    function removeKeyHolder(address _participant) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (!keyHolders[_participant].hasContributed && keyHolders[_participant].publicKey == bytes32(0)) {
            revert NotKeyHolder();
        }
        
        delete keyHolders[_participant];
        
        // Remove from array
        for (uint256 i = 0; i < keyHolderAddresses.length; i++) {
            if (keyHolderAddresses[i] == _participant) {
                keyHolderAddresses[i] = keyHolderAddresses[keyHolderAddresses.length - 1];
                keyHolderAddresses.pop();
                break;
            }
        }
        
        emit KeyHolderRemoved(_participant, msg.sender);
    }
    
    /**
     * @dev Pause contract in emergency
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause after emergency
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // ============================================
    // Key Setting Functions
    // ============================================
    
    /**
     * @dev Set election keys (HE public key and ZKP verification key)
     * @param _hePublicKey Homomorphic encryption public key
     * @param _zkpVerificationKey ZKP verification key
     * 
     * Security measures:
     * - Only KEY_SETTER_ROLE can call
     * - Keys can only be set once (until rotation)
     * - Input validation for key lengths
     * - Key ceremony must not be in progress
     */
    function setElectionKeys(
        bytes calldata _hePublicKey,
        bytes calldata _zkpVerificationKey
    ) 
        external 
        onlyKeySetter 
        nonReentrant 
        whenNotPaused
        validBytes(_hePublicKey)
        validBytes(_zkpVerificationKey)
        validHeKeyLength(_hePublicKey.length)
        validZkpKeyLength(_zkpVerificationKey.length)
    {
        // Check keys not already set
        if (keysInitialized) {
            revert KeysAlreadySet();
        }
        
        // Check key ceremony not in progress
        if (ceremonyState.isInitialized && !ceremonyState.isCompleted) {
            revert KeyCeremonyInProgress();
        }
        
        // Set the keys
        hePublicKey = _hePublicKey;
        zkpVerificationKey = _zkpVerificationKey;
        keysInitialized = true;
        
        emit KeysSet(_hePublicKey, _zkpVerificationKey, msg.sender);
    }
    
    /**
     * @dev Rotate election keys
     * @param _newHePublicKey New HE public key
     * @param _newZkpVerificationKey New ZKP verification key
     * 
     * Requirements:
     * - Must wait KEY_ROTATION_INTERVAL since last rotation
     * - Must have KEY_SETTER_ROLE
     * - New keys must be different from current keys
     */
    function rotateKeys(
        bytes calldata _newHePublicKey,
        bytes calldata _newZkpVerificationKey
    ) 
        external 
        onlyKeySetter 
        nonReentrant 
        whenNotPaused
        validBytes(_newHePublicKey)
        validBytes(_newZkpVerificationKey)
        validHeKeyLength(_newHePublicKey.length)
        validZkpKeyLength(_newZkpVerificationKey.length)
    {
        // Check time since last rotation
        if (block.timestamp < lastKeyRotation + KEY_ROTATION_INTERVAL) {
            revert TooSoonToRotate();
        }
        
        // Verify new keys are different
        bytes32 oldHeKeyHash = keccak256(hePublicKey);
        bytes32 newHeKeyHash = keccak256(_newHePublicKey);
        
        if (oldHeKeyHash == newHeKeyHash) {
            revert KeysAlreadySet(); // Same key
        }
        
        // Store old key hash for event
        bytes memory oldHeKeyHashBytes = abi.encodePacked(oldHeKeyHash);
        
        // Update keys
        hePublicKey = _newHePublicKey;
        zkpVerificationKey = _newZkpVerificationKey;
        lastKeyRotation = block.timestamp;
        
        emit KeysRotated(
            oldHeKeyHashBytes,
            abi.encodePacked(newHeKeyHash),
            block.timestamp,
            msg.sender
        );
    }
    
    /**
     * @dev Emergency key reset (requires ADMIN_ROLE, not KEY_SETTER_ROLE)
     * This should only be used in case of key compromise
     * @param _newHePublicKey New HE public key
     * @param _newZkpVerificationKey New ZKP verification key
     */
    function emergencyKeyReset(
        bytes calldata _newHePublicKey,
        bytes calldata _newZkpVerificationKey
    ) 
        external 
        onlyRole(ADMIN_ROLE) 
        nonReentrant 
        validBytes(_newHePublicKey)
        validBytes(_newZkpVerificationKey)
    {
        hePublicKey = _newHePublicKey;
        zkpVerificationKey = _newZkpVerificationKey;
        
        // Reset rotation timer
        lastKeyRotation = block.timestamp;
        
        // If ceremony was in progress, reset it
        if (ceremonyState.isInitialized && !ceremonyState.isCompleted) {
            ceremonyState.isInitialized = false;
            ceremonyState.isCompleted = false;
            ceremonyState.ceremonyId = bytes32(0);
        }
        
        emit EmergencyKeyReset(msg.sender, block.timestamp);
    }
    
    // ============================================
    // Key Ceremony Functions
    // ============================================
    
    /**
     * @dev Initialize a distributed key ceremony
     * @param _ceremonyId Unique ceremony identifier
     * @param _requiredParticipants Number of required participants
     */
    function initializeKeyCeremony(
        bytes32 _ceremonyId,
        uint256 _requiredParticipants
    ) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (_ceremonyId == bytes32(0)) {
            revert InvalidCeremonyId();
        }
        if (_requiredParticipants == 0) {
            revert InsufficientParticipants();
        }
        
        ceremonyState = KeyCeremonyState({
            requiredParticipants: _requiredParticipants,
            currentParticipants: 0,
            isInitialized: true,
            isCompleted: false,
            ceremonyId: _ceremonyId
        });
        
        emit KeyCeremonyStarted(_ceremonyId, _requiredParticipants, msg.sender);
    }
    
    /**
     * @dev Contribute to key ceremony
     * @param _publicKey Public key contribution from participant
     */
    function contributeToCeremony(bytes32 _publicKey) 
        external 
        onlyKeyCeremonyParticipant 
        nonReentrant
    {
        if (!ceremonyState.isInitialized) {
            revert CeremonyNotInitialized();
        }
        if (ceremonyState.isCompleted) {
            revert CeremonyAlreadyCompleted();
        }
        
        KeyHolder storage holder = keyHolders[msg.sender];
        
        if (holder.hasContributed) {
            revert DuplicateContribution();
        }
        
        // Record contribution
        holder.publicKey = _publicKey;
        holder.hasContributed = true;
        holder.contributionTime = block.timestamp;
        
        ceremonyState.currentParticipants++;
        
        emit KeyCeremonyContribution(
            msg.sender,
            _publicKey,
            ceremonyState.currentParticipants,
            block.timestamp
        );
        
        // Check if ceremony is complete
        if (ceremonyState.currentParticipants >= ceremonyState.requiredParticipants) {
            ceremonyState.isCompleted = true;
            
            emit KeyCeremonyCompleted(
                ceremonyState.ceremonyId,
                ceremonyState.currentParticipants,
                msg.sender
            );
        }
    }
    
    /**
     * @dev Finalize key ceremony and set keys
     * @param _hePublicKey Combined HE public key from ceremony
     * @param _zkpVerificationKey Combined ZKP verification key
     */
    function finalizeCeremony(
        bytes calldata _hePublicKey,
        bytes calldata _zkpVerificationKey
    ) 
        external 
        onlyRole(ADMIN_ROLE) 
        validBytes(_hePublicKey)
        validBytes(_zkpVerificationKey)
    {
        if (!ceremonyState.isInitialized) {
            revert CeremonyNotInitialized();
        }
        if (!ceremonyState.isCompleted) {
            revert InsufficientParticipants();
        }
        
        hePublicKey = _hePublicKey;
        zkpVerificationKey = _zkpVerificationKey;
        keysInitialized = true;
        
        emit KeysSet(_hePublicKey, _zkpVerificationKey, msg.sender);
    }
    
    // ============================================
    // View Functions
    // ============================================
    
    /**
     * @dev Get HE public key
     * @return The homomorphic encryption public key
     */
    function getHePublicKey() external view returns (bytes memory) {
        return hePublicKey;
    }
    
    /**
     * @dev Get ZKP verification key
     * @return The ZKP verification key
     */
    function getZkpVerificationKey() external view returns (bytes memory) {
        return zkpVerificationKey;
    }
    
    /**
     * @dev Check if keys are initialized
     * @return Whether keys have been set
     */
    function areKeysSet() external view returns (bool) {
        return keysInitialized;
    }
    
    /**
     * @dev Get key ceremony status
     * @return required Number of required participants
     * @return current Current number of participants
     * @return initialized Whether ceremony is initialized
     * @return completed Whether ceremony is completed
     * @return id Ceremony ID
     */
    function getCeremonyStatus() 
        external 
        view 
        returns (
            uint256 required,
            uint256 current,
            bool initialized,
            bool completed,
            bytes32 id
        ) 
    {
        return (
            ceremonyState.requiredParticipants,
            ceremonyState.currentParticipants,
            ceremonyState.isInitialized,
            ceremonyState.isCompleted,
            ceremonyState.ceremonyId
        );
    }
    
    /**
     * @dev Get number of key holders
     * @return Number of registered key holders
     */
    function getKeyHolderCount() external view returns (uint256) {
        return keyHolderAddresses.length;
    }
    
    /**
     * @dev Get key holder by index
     * @param index Index of key holder
     * @return Address of key holder
     */
    function getKeyHolder(uint256 index) external view returns (address) {
        require(index < keyHolderAddresses.length, "Invalid index");
        return keyHolderAddresses[index];
    }
    
    /**
     * @dev Get time until next key rotation allowed
     * @return Seconds until rotation allowed
     */
    function getTimeUntilRotation() external view returns (uint256) {
        if (block.timestamp >= lastKeyRotation + KEY_ROTATION_INTERVAL) {
            return 0;
        }
        return (lastKeyRotation + KEY_ROTATION_INTERVAL) - block.timestamp;
    }
    
    /**
     * @dev Check if address is key setter
     * @param _account Address to check
     * @return Whether address has key setter role
     */
    function isKeySetter(address _account) external view returns (bool) {
        return hasRole(KEY_SETTER_ROLE, _account);
    }
}
