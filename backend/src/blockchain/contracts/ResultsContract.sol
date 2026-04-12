// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ResultsContract
 * @dev Contract for managing election results and tallying
 */
contract ResultsContract is AccessControl, ReentrancyGuard {
    bytes32 public constant TALLY_ROLE = keccak256("TALLY_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct CandidateResult {
        bytes32 encryptedCount;
        bytes proof;
        bool published;
        uint256 timestamp;
    }

    // Mapping from candidate ID to result
    mapping(bytes32 => CandidateResult) public results;

    // Array of candidate IDs
    bytes32[] public candidateIds;

    // Total votes in the election
    uint256 public totalVotes;

    // Hash of final results for verification
    bytes32 public finalResultsHash;

    // Whether results have been finalized
    bool public resultsFinalized;

    // Events
    event ResultPublished(bytes32 indexed candidateId, bytes32 encryptedCount, bytes proof, uint256 timestamp);
    event ResultsFinalized(bytes32 finalResultsHash, uint256 totalVotes);
    event ResultChallenged(bytes32 indexed candidateId, string reason);

    // Errors
    error ResultsAlreadyFinalized();
    error InvalidCandidateId();
    error UnauthorizedTallyRole();

    /**
     * @dev Modifier that reverts if results are already finalized
     */
    modifier onlyWhenNotFinalized() {
        if (resultsFinalized) {
            revert ResultsAlreadyFinalized();
        }
        _;
    }

    /**
     * @dev Contract constructor - grants roles to deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(TALLY_ROLE, msg.sender);
    }

    /**
     * @dev Add an account to the TALLY_ROLE
     * @param account The address to grant TALLY_ROLE
     */
    function addTallyRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(TALLY_ROLE, account);
    }

    /**
     * * @dev Publish the result for a candidate
     * @param candidateId The ID of the candidate
     * @param encryptedCount The encrypted vote count
     * @param proof The cryptographic proof for the result
     */
    function publishCandidateResult(
        bytes32 candidateId,
        bytes32 encryptedCount,
        bytes calldata proof
    ) external onlyRole(TALLY_ROLE) onlyWhenNotFinalized nonReentrant {
        if (results[candidateId].published) {
            revert InvalidCandidateId();
        }

        // Add candidate to array if not already added
        bool found = false;
        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (candidateIds[i] == candidateId) {
                found = true;
                break;
            }
        }
        if (!found) {
            candidateIds.push(candidateId);
        }

        results[candidateId] = CandidateResult({
            encryptedCount: encryptedCount,
            proof: proof,
            published: true,
            timestamp: block.timestamp
        });

        emit ResultPublished(candidateId, encryptedCount, proof, block.timestamp);
    }

    /**
     * @dev Finalize all results
     * @param _finalResultsHash The hash of the final results for verification
     */
    function finalizeResults(bytes32 _finalResultsHash)
        external
        onlyRole(TALLY_ROLE)
        onlyWhenNotFinalized
        nonReentrant
    {
        finalResultsHash = _finalResultsHash;
        resultsFinalized = true;

        emit ResultsFinalized(finalResultsHash, totalVotes);
    }

    /**
     * @dev Set the total votes for the election
     * @param _totalVotes The total number of votes
     */
    function setTotalVotes(uint256 _totalVotes) external onlyRole(ADMIN_ROLE) onlyWhenNotFinalized {
        totalVotes = _totalVotes;
    }

    /**
     * @dev Get the result for a specific candidate
     * @param candidateId The ID of the candidate
     * @return The candidate result
     */
    function getResult(bytes32 candidateId) external view returns (CandidateResult memory) {
        return results[candidateId];
    }

    /**
     * @dev Get the number of candidates
     * @return The number of candidates
     */
    function getCandidateCount() external view returns (uint256) {
        return candidateIds.length;
    }

    /**
     * @dev Check if results are finalized
     * @return Whether results are finalized
     */
    function isResultFinalized() external view returns (bool) {
        return resultsFinalized;
    }
}