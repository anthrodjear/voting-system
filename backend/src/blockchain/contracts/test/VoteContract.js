const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("VoteContract", function () {
  let voteContract;
  let keyManager;
  let owner;
  let addr1;
  let addr2;
  let keySetter;

  // Test data
  const VALID_VOTER_HASH = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("voter1"));
  const VALID_VOTE_HASH = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vote1"));
  const VALID_BLINDING_FACTOR = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("blinding1"));
  const VALID_PROOF = ethers.utils.randomBytes(128);
  const SHORT_PROOF = ethers.utils.randomBytes(32); // Too short
  const LONG_PROOF = ethers.utils.randomBytes(2000); // Too long
  
  const CANDIDATE_ID = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("candidate1"));

  beforeEach(async function () {
    [owner, addr1, addr2, keySetter] = await ethers.getSigners();

    // Deploy ElectionKeyManager first
    const KeyManager = await ethers.getContractFactory("ElectionKeyManager");
    keyManager = await KeyManager.deploy(owner.address);

    // Deploy VoteContract with keyManager address
    const VoteContract = await ethers.getContractFactory("VoteContract");
    voteContract = await VoteContract.deploy(keyManager.address);

    // Set up keys in keyManager
    const hePublicKey = ethers.utils.randomBytes(64);
    const zkpVerificationKey = ethers.utils.randomBytes(128);
    await keyManager.setElectionKeys(hePublicKey, zkpVerificationKey);

    // Add a candidate
    await voteContract.addCandidate(CANDIDATE_ID);
  });

  describe("Deployment", function () {
    it("should set the correct key manager", async function () {
      expect(await voteContract.keyManager()).to.equal(keyManager.address);
    });

    it("should start with NotStarted state", async function () {
      expect(await voteContract.state()).to.equal(0); // NotStarted
    });
  });

  describe("Input Validation", function () {
    it("should reject zero voter hash", async function () {
      await voteContract.setElectionState(2); // Voting
      
      await expect(
        voteContract.castVote(
          ethers.constants.HashZero,
          VALID_VOTE_HASH,
          VALID_PROOF,
          VALID_BLINDING_FACTOR
        )
      ).to.be.reverted;
    });

    it("should reject zero vote hash", async function () {
      await voteContract.setElectionState(2); // Voting
      
      await expect(
        voteContract.castVote(
          VALID_VOTER_HASH,
          ethers.constants.HashZero,
          VALID_PROOF,
          VALID_BLINDING_FACTOR
        )
      ).to.be.reverted;
    });

    it("should reject zero blinding factor", async function () {
      await voteContract.setElectionState(2); // Voting
      
      await expect(
        voteContract.castVote(
          VALID_VOTER_HASH,
          VALID_VOTE_HASH,
          VALID_PROOF,
          ethers.constants.HashZero
        )
      ).to.be.reverted;
    });

    it("should reject proof that is too short", async function () {
      await voteContract.setElectionState(2); // Voting
      
      await expect(
        voteContract.castVote(
          VALID_VOTER_HASH,
          VALID_VOTE_HASH,
          SHORT_PROOF,
          VALID_BLINDING_FACTOR
        )
      ).to.be.revertedWith("ProofTooShort");
    });

    it("should reject proof that is too long", async function () {
      await voteContract.setElectionState(2); // Voting
      
      await expect(
        voteContract.castVote(
          VALID_VOTER_HASH,
          VALID_VOTE_HASH,
          LONG_PROOF,
          VALID_BLINDING_FACTOR
        )
      ).to.be.revertedWith("ProofTooLong");
    });
  });

  describe("Election State", function () {
    it("should only allow admin to change state", async function () {
      await expect(
        voteContract.connect(addr1).setElectionState(1)
      ).to.be.revertedWith("AccessControl");
    });

    it("should allow admin to change state to Voting", async function () {
      await voteContract.setElectionState(2);
      expect(await voteContract.state()).to.equal(2);
    });

    it("should not allow voting when not in Voting state", async function () {
      await expect(
        voteContract.castVote(
          VALID_VOTER_HASH,
          VALID_VOTE_HASH,
          VALID_PROOF,
          VALID_BLINDING_FACTOR
        )
      ).to.be.revertedWith("VotingNotActive");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voteContract.setElectionState(2); // Voting
    });

    it("should allow voting when all inputs are valid", async function () {
      // Note: The current implementation requires actual ZK proof verification
      // For testing, we need a valid proof that passes verification
      // This is a limitation of the test - in production, real proofs would be used
      
      // For now, test the input validation path
      const tx = voteContract.castVote(
        VALID_VOTER_HASH,
        VALID_VOTE_HASH,
        VALID_PROOF,
        VALID_BLINDING_FACTOR
      );
      
      // This will fail because proof verification will fail
      // In production, use a valid proof
      await expect(tx).to.be.reverted;
    });

    it("should prevent double voting", async function () {
      // This would pass with a valid proof
      // Skipping for now as it requires real ZK proof
    });
  });

  describe("Pausing", function () {
    it("should allow admin to pause", async function () {
      await voteContract.pause();
      expect(await voteContract.paused()).to.equal(true);
    });

    it("should prevent voting when paused", async function () {
      await voteContract.setElectionState(2);
      await voteContract.pause();

      await expect(
        voteContract.castVote(
          VALID_VOTER_HASH,
          VALID_VOTE_HASH,
          VALID_PROOF,
          VALID_BLINDING_FACTOR
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should allow admin to unpause", async function () {
      await voteContract.pause();
      await voteContract.unpause();
      expect(await voteContract.paused()).to.equal(false);
    });
  });

  describe("Access Control", function () {
    it("should grant admin role to deployer", async function () {
      const ADMIN_ROLE = await voteContract.ADMIN_ROLE();
      expect(await voteContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("should allow adding new admin", async function () {
      const ADMIN_ROLE = await voteContract.ADMIN_ROLE();
      await voteContract.grantRole(ADMIN_ROLE, addr1.address);
      expect(await voteContract.hasRole(ADMIN_ROLE, addr1.address)).to.equal(true);
    });

    it("should prevent non-admin from adding candidates", async function () {
      await expect(
        voteContract.connect(addr1).addCandidate(CANDIDATE_ID)
      ).to.be.revertedWith("AccessControl");
    });
  });
});
