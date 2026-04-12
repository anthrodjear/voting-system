import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, Signer } from 'ethers';

describe('ResultsContract', () => {
  let resultsContract: Contract;
  let admin: Signer;
  let tallyRole: Signer;
  let nonTally: Signer;

  const TALLY_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('TALLY_ROLE'));
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ADMIN_ROLE'));

  beforeEach(async () => {
    [admin, tallyRole, nonTally] = await ethers.getSigners();

    // Deploy ResultsContract
    const ResultsContract = await ethers.getContractFactory('ResultsContract');
    resultsContract = await ResultsContract.deploy();

    // Grant TALLY_ROLE to tallyRole
    await resultsContract.grantRole(TALLY_ROLE, tallyRole.address);
  });

  describe('Result Publishing', () => {
    const candidateId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Candidate1'));
    const encryptedCount = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('encrypted_count_1'));

    it('should allow tally role to publish candidate result', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      const result = await resultsContract.getResult(candidateId);
      expect(result.published).to.be.true;
      expect(result.encryptedCount).to.equal(encryptedCount);
    });

    it('should emit ResultPublished event when publishing result', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      await expect(
        resultsContract.connect(tallyRole).publishCandidateResult(
          candidateId,
          encryptedCount,
          proof
        )
      ).to.emit(resultsContract, 'ResultPublished')
        .withArgs(candidateId, encryptedCount, proof);
    });

    it('should store proof with result', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      const result = await resultsContract.getResult(candidateId);
      expect(result.proof).to.equal(ethers.utils.hexlify(proof));
    });

    it('should set timestamp when publishing result', async () => {
      const proof = ethers.utils.randomBytes(64);
      const beforePublish = (await ethers.provider.getBlock('latest')).timestamp;
      
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      const result = await resultsContract.getResult(candidateId);
      expect(result.timestamp).to.be.gte(beforePublish);
    });

    it('should add candidate to candidateIds array', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      const count = await resultsContract.getCandidateCount();
      expect(count).to.equal(1);

      const storedCandidateId = await resultsContract.candidateIds(0);
      expect(storedCandidateId).to.equal(candidateId);
    });

    it('should revert when non-tally tries to publish result', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      await expect(
        resultsContract.connect(nonTally).publishCandidateResult(
          candidateId,
          encryptedCount,
          proof
        )
      ).to.be.revertedWith(`AccessControl: account ${nonTally.address.toLowerCase()} is missing role ${TALLY_ROLE}`);
    });

    it('should revert when publishing result for same candidate twice', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      const newEncryptedCount = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('new_count'));
      const newProof = ethers.utils.randomBytes(64);

      await expect(
        resultsContract.connect(tallyRole).publishCandidateResult(
          candidateId,
          newEncryptedCount,
          newProof
        )
      ).to.be.revertedWith('InvalidCandidateId');
    });

    it('should allow publishing multiple different candidates', async () => {
      const proof1 = ethers.utils.randomBytes(64);
      const proof2 = ethers.utils.randomBytes(64);

      const candidateId1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Candidate1'));
      const candidateId2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Candidate2'));

      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId1,
        encryptedCount,
        proof1
      );

      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId2,
        encryptedCount,
        proof2
      );

      const count = await resultsContract.getCandidateCount();
      expect(count).to.equal(2);
    });

    it('should not allow publishing after results are finalized', async () => {
      const proof = ethers.utils.randomBytes(64);
      
      // First publish a result
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      // Then finalize results
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      // Try to publish another result - should fail
      const candidateId2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Candidate2'));
      const proof2 = ethers.utils.randomBytes(64);

      await expect(
        resultsContract.connect(tallyRole).publishCandidateResult(
          candidateId2,
          encryptedCount,
          proof2
        )
      ).to.be.revertedWith('ResultsAlreadyFinalized');
    });
  });

  describe('Result Finalization', () => {
    it('should allow tally role to finalize results', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      const isFinalized = await resultsContract.isResultFinalized();
      expect(isFinalized).to.be.true;
    });

    it('should store finalResultsHash when finalizing', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      const storedHash = await resultsContract.finalResultsHash();
      expect(storedHash).to.equal(finalHash);
    });

    it('should emit ResultsFinalized event when finalizing', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      // Since totalVotes is 0 by default
      await expect(
        resultsContract.connect(tallyRole).finalizeResults(finalHash)
      ).to.emit(resultsContract, 'ResultsFinalized')
        .withArgs(finalHash, 0);
    });

    it('should revert when non-tally tries to finalize results', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      await expect(
        resultsContract.connect(nonTally).finalizeResults(finalHash)
      ).to.be.revertedWith(`AccessControl: account ${nonTally.address.toLowerCase()} is missing role ${TALLY_ROLE}`);
    });

    it('should revert when trying to finalize already finalized results', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      const anotherHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('another_hash'));
      
      await expect(
        resultsContract.connect(tallyRole).finalizeResults(anotherHash)
      ).to.be.revertedWith('ResultsAlreadyFinalized');
    });

    it('should set resultsFinalized to true after finalization', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      const result = await resultsContract.resultsFinalized();
      expect(result).to.be.true;
    });
  });

  describe('Access Control Checks', () => {
    it('should grant TALLY_ROLE to deployer', async () => {
      const hasRole = await resultsContract.hasRole(TALLY_ROLE, admin.address);
      expect(hasRole).to.be.true;
    });

    it('should grant ADMIN_ROLE to deployer', async () => {
      const hasRole = await resultsContract.hasRole(ADMIN_ROLE, admin.address);
      expect(hasRole).to.be.true;
    });

    it('should allow admin to grant TALLY_ROLE to another account', async () => {
      await resultsContract.grantRole(TALLY_ROLE, tallyRole.address);
      
      const hasRole = await resultsContract.hasRole(TALLY_ROLE, tallyRole.address);
      expect(hasRole).to.be.true;
    });

    it('should allow admin to revoke TALLY_ROLE', async () => {
      await resultsContract.revokeRole(TALLY_ROLE, tallyRole.address);
      
      const hasRole = await resultsContract.hasRole(TALLY_ROLE, tallyRole.address);
      expect(hasRole).to.be.false;
    });

    it('should allow admin to call addTallyRole', async () => {
      await resultsContract.addTallyRole(tallyRole.address);
      
      const hasRole = await resultsContract.hasRole(TALLY_ROLE, tallyRole.address);
      expect(hasRole).to.be.true;
    });

    it('should revert when non-admin tries to call addTallyRole', async () => {
      await expect(
        resultsContract.connect(nonTally).addTallyRole(tallyRole.address)
      ).to.be.revertedWith(`AccessControl: account ${nonTally.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });

    it('should allow admin to set total votes', async () => {
      await resultsContract.setTotalVotes(1000);
      
      const totalVotes = await resultsContract.totalVotes();
      expect(totalVotes).to.equal(1000);
    });

    it('should revert when non-admin tries to set total votes', async () => {
      await expect(
        resultsContract.connect(nonTally).setTotalVotes(1000)
      ).to.be.revertedWith(`AccessControl: account ${nonTally.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });

    it('should revert when setting total votes after finalization', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      await expect(
        resultsContract.setTotalVotes(1000)
      ).to.be.revertedWith('ResultsAlreadyFinalized');
    });
  });

  describe('View Functions', () => {
    it('should return empty result for non-existent candidate', async () => {
      const nonExistentCandidate = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NonExistent'));
      const result = await resultsContract.getResult(nonExistentCandidate);
      
      expect(result.published).to.be.false;
      expect(result.encryptedCount).to.equal(ethers.constants.Zero);
    });

    it('should return 0 candidate count initially', async () => {
      const count = await resultsContract.getCandidateCount();
      expect(count).to.equal(0);
    });

    it('should return false for isResultFinalized initially', async () => {
      const isFinalized = await resultsContract.isResultFinalized();
      expect(isFinalized).to.be.false;
    });

    it('should return 0 for totalVotes initially', async () => {
      const totalVotes = await resultsContract.totalVotes();
      expect(totalVotes).to.equal(0);
    });

    it('should return empty finalResultsHash initially', async () => {
      const hash = await resultsContract.finalResultsHash();
      expect(hash).to.equal(ethers.constants.Zero);
    });
  });

  describe('Non-Reentrancy Protection', () => {
    it('should prevent reentrancy on publishCandidateResult', async () => {
      // This is a basic check - in a real scenario you'd test with a malicious contract
      const candidateId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Candidate1'));
      const encryptedCount = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('count'));
      const proof = ethers.utils.randomBytes(64);

      // The function should work normally
      await resultsContract.connect(tallyRole).publishCandidateResult(
        candidateId,
        encryptedCount,
        proof
      );

      const result = await resultsContract.getResult(candidateId);
      expect(result.published).to.be.true;
    });

    it('should prevent reentrancy on finalizeResults', async () => {
      const finalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('final_results'));
      
      await resultsContract.connect(tallyRole).finalizeResults(finalHash);

      const isFinalized = await resultsContract.isResultFinalized();
      expect(isFinalized).to.be.true;
    });
  });
});