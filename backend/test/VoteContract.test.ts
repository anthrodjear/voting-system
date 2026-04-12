import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, Signer, BigNumber } from 'ethers';

describe('VoteContract', () => {
  let voteContract: Contract;
  let keyManager: Contract;
  let admin: Signer;
  let nonAdmin: Signer;
  let otherAccount: Signer;

  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ADMIN_ROLE'));
  const KEY_SETTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('KEY_SETTER_ROLE'));

  beforeEach(async () => {
    [admin, nonAdmin, otherAccount] = await ethers.getSigners();

    // Deploy ElectionKeyManager first
    const ElectionKeyManager = await ethers.getContractFactory('ElectionKeyManager');
    keyManager = await ElectionKeyManager.deploy(admin.address);

    // Deploy VoteContract with keyManager address
    const VoteContract = await ethers.getContractFactory('VoteContract');
    voteContract = await VoteContract.deploy(keyManager.address);
  });

  describe('Election State Management', () => {
    it('should have initial state as NotStarted (0)', async () => {
      const state = await voteContract.state();
      expect(state).to.equal(0); // NotStarted enum value
    });

    it('should allow admin to set election state', async () => {
      // Set to Registration state (1)
      await voteContract.setElectionState(1);
      const state = await voteContract.state();
      expect(state).to.equal(1);
    });

    it('should set electionStartTime when state changes to Voting', async () => {
      await voteContract.setElectionState(1); // Registration
      await voteContract.setElectionState(2); // Voting
      
      const startTime = await voteContract.electionStartTime();
      expect(startTime).to.be.gt(0);
    });

    it('should set electionEndTime when state changes to Completed', async () => {
      await voteContract.setElectionState(1); // Registration
      await voteContract.setElectionState(2); // Voting
      await voteContract.setElectionState(4); // Completed
      
      const endTime = await voteContract.electionEndTime();
      expect(endTime).to.be.gt(0);
    });

    it('should revert when non-admin tries to set election state', async () => {
      await expect(
        voteContract.connect(nonAdmin).setElectionState(1)
      ).to.be.revertedWith(`AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });

    it('should emit StateChanged event when state changes', async () => {
      await expect(voteContract.setElectionState(1))
        .to.emit(voteContract, 'StateChanged')
        .withArgs(0, 1);
    });
  });

  describe('Candidate Management', () => {
    const candidateId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Candidate1'));

    it('should allow admin to add a candidate', async () => {
      await voteContract.addCandidate(candidateId);
      
      const isActive = await voteContract.isCandidate(candidateId);
      expect(isActive).to.be.true;
    });

    it('should return true for isCandidate when candidate exists', async () => {
      await voteContract.addCandidate(candidateId);
      
      const result = await voteContract.isCandidate(candidateId);
      expect(result).to.equal(true);
    });

    it('should return false for isCandidate when candidate does not exist', async () => {
      const nonExistentCandidate = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NonExistent'));
      const result = await voteContract.isCandidate(nonExistentCandidate);
      expect(result).to.equal(false);
    });

    it('should revert when adding candidate with zero bytes32', async () => {
      await expect(
        voteContract.addCandidate(ethers.utils.zeroPadBytes(ethers.constants.Zero, 32))
      ).to.be.reverted;
    });

    it('should revert when non-admin tries to add candidate', async () => {
      await expect(
        voteContract.connect(nonAdmin).addCandidate(candidateId)
      ).to.be.revertedWith(`AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });

    it('should emit CandidateAdded event when candidate is added', async () => {
      await expect(voteContract.addCandidate(candidateId))
        .to.emit(voteContract, 'CandidateAdded')
        .withArgs(candidateId, admin.address);
    });

    it('should add candidate to candidateIds array', async () => {
      await voteContract.addCandidate(candidateId);
      
      const count = await voteContract.getCandidateCount();
      expect(count).to.equal(1);
      
      const storedCandidateId = await voteContract.getCandidateId(0);
      expect(storedCandidateId).to.equal(candidateId);
    });
  });

  describe('Access Control', () => {
    it('should grant ADMIN_ROLE to deployer', async () => {
      const hasRole = await voteContract.hasRole(ADMIN_ROLE, admin.address);
      expect(hasRole).to.be.true;
    });

    it('should grant DEFAULT_ADMIN_ROLE to deployer', async () => {
      const DEFAULT_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('DEFAULT_ADMIN_ROLE'));
      const hasRole = await voteContract.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
      expect(hasRole).to.be.true;
    });

    it('should not allow non-admin to call admin functions', async () => {
      // Try setKeyManager
      await expect(
        voteContract.connect(nonAdmin).setElectionState(1)
      ).to.be.reverted;
    });

    it('should allow admin to call admin functions', async () => {
      // This should not revert
      await voteContract.setElectionState(1);
      expect(await voteContract.state()).to.equal(1);
    });

    it('should allow setting key manager address', async () => {
      // admin already has KEY_SETTER_ROLE since they have ADMIN_ROLE
      await expect(voteContract.setKeyManager(keyManager.address))
        .to.emit(voteContract, 'KeyManagerUpdated');
    });

    it('should revert when setting key manager to zero address', async () => {
      await expect(
        voteContract.setKeyManager(ethers.constants.AddressZero)
      ).to.be.revertedWith('InvalidKeyManagerAddress');
    });
  });

  describe('Pause/Unpause Functionality', () => {
    it('should allow admin to pause the contract', async () => {
      await voteContract.pause();
      
      const paused = await voteContract.paused();
      expect(paused).to.be.true;
    });

    it('should allow admin to unpause the contract', async () => {
      await voteContract.pause();
      await voteContract.unpause();
      
      const paused = await voteContract.paused();
      expect(paused).to.be.false;
    });

    it('should revert when non-admin tries to pause', async () => {
      await expect(
        voteContract.connect(nonAdmin).pause()
      ).to.be.revertedWith(`AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });

    it('should revert when non-admin tries to unpause', async () => {
      await voteContract.pause();
      
      await expect(
        voteContract.connect(nonAdmin).unpause()
      ).to.be.revertedWith(`AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });

    it('should emit EmergencyPauseActivated when paused', async () => {
      await expect(voteContract.pause())
        .to.emit(voteContract, 'EmergencyPauseActivated')
        .withArgs(admin.address);
    });

    it('should emit EmergencyPauseDeactivated when unpaused', async () => {
      await voteContract.pause();
      await expect(voteContract.unpause())
        .to.emit(voteContract, 'EmergencyPauseDeactivated')
        .withArgs(admin.address);
    });

    it('should prevent castVote when paused', async () => {
      // First set state to Voting
      await voteContract.setElectionState(1); // Registration
      await voteContract.setElectionState(2); // Voting
      
      // Pause the contract
      await voteContract.pause();
      
      // Try to cast vote - should revert
      const voterHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('voter1'));
      const voteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('vote1'));
      const proof = ethers.utils.randomBytes(64);
      const blindingFactor = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('blind1'));
      
      await expect(
        voteContract.castVote(voterHash, voteHash, proof, blindingFactor)
      ).to.be.revertedWith('Pausable: paused');
    });
  });

  describe('View Functions', () => {
    it('should return correct election data', async () => {
      const [state, startTime, endTime, totalVotes] = await voteContract.getElectionData();
      
      expect(state).to.equal(0); // NotStarted
      expect(startTime).to.equal(0);
      expect(endTime).to.equal(0);
      expect(totalVotes).to.equal(0);
    });

    it('should return 0 for election duration before voting starts', async () => {
      const duration = await voteContract.getElectionDuration();
      expect(duration).to.equal(0);
    });

    it('should return 0 candidate count initially', async () => {
      const count = await voteContract.getCandidateCount();
      expect(count).to.equal(0);
    });
  });
});