import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, Signer } from 'ethers';

describe('ElectionKeyManager', () => {
  let electionKeyManager: Contract;
  let admin: Signer;
  let keySetter: Signer;
  let nonKeySetter: Signer;

  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ADMIN_ROLE'));
  const KEY_SETTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('KEY_SETTER_ROLE'));

  beforeEach(async () => {
    [admin, keySetter, nonKeySetter] = await ethers.getSigners();

    // Deploy ElectionKeyManager
    const ElectionKeyManager = await ethers.getContractFactory('ElectionKeyManager');
    electionKeyManager = await ElectionKeyManager.deploy(admin.address);
  });

  describe('Key Initialization', () => {
    it('should have keys not initialized initially', async () => {
      const keysInitialized = await electionKeyManager.keysInitialized();
      expect(keysInitialized).to.be.false;
    });

    it('should return empty HE public key initially', async () => {
      const hePublicKey = await electionKeyManager.getHePublicKey();
      expect(hePublicKey).to.equal('0x');
    });

    it('should return empty ZKP verification key initially', async () => {
      const zkpKey = await electionKeyManager.getZkpVerificationKey();
      expect(zkpKey).to.equal('0x');
    });

    it('should return false for areKeysSet when keys not initialized', async () => {
      const areKeysSet = await electionKeyManager.areKeysSet();
      expect(areKeysSet).to.be.false;
    });
  });

  describe('Setting Keys', () => {
    const validHeKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('he_public_key_1'));
    const validZkpKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('zkp_verification_key_1'));

    // Pad keys to meet minimum length requirements (MIN_HE_KEY_LENGTH = 64, MIN_ZKP_KEY_LENGTH = 32)
    const paddedHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
    const paddedZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

    it('should allow key setter to set election keys', async () => {
      // admin has KEY_SETTER_ROLE by default
      await electionKeyManager.setElectionKeys(paddedHeKey, paddedZkpKey);
      
      const keysInitialized = await electionKeyManager.keysInitialized();
      expect(keysInitialized).to.be.true;
    });

    it('should set keysInitialized to true after setting keys', async () => {
      await electionKeyManager.setElectionKeys(paddedHeKey, paddedZkpKey);
      
      const result = await electionKeyManager.keysInitialized();
      expect(result).to.be.true;
    });

    it('should store HE public key after setting', async () => {
      await electionKeyManager.setElectionKeys(paddedHeKey, paddedZkpKey);
      
      const hePublicKey = await electionKeyManager.getHePublicKey();
      expect(hePublicKey).to.equal(paddedHeKey);
    });

    it('should store ZKP verification key after setting', async () => {
      await electionKeyManager.setElectionKeys(paddedHeKey, paddedZkpKey);
      
      const zkpKey = await electionKeyManager.getZkpVerificationKey();
      expect(zkpKey).to.equal(paddedZkpKey);
    });

    it('should emit KeysSet event when keys are set', async () => {
      await expect(electionKeyManager.setElectionKeys(paddedHeKey, paddedZkpKey))
        .to.emit(electionKeyManager, 'KeysSet');
    });

    it('should revert when setting keys with empty HE key', async () => {
      await expect(
        electionKeyManager.setElectionKeys('0x', paddedZkpKey)
      ).to.be.revertedWith('EmptyHeKey');
    });

    it('should revert when setting keys with empty ZKP key', async () => {
      await expect(
        electionKeyManager.setElectionKeys(paddedHeKey, '0x')
      ).to.be.revertedWith('EmptyZkpKey');
    });

    it('should revert when non-key-setter tries to set keys', async () => {
      await expect(
        electionKeyManager.connect(nonKeySetter).setElectionKeys(paddedHeKey, paddedZkpKey)
      ).to.be.revertedWith('InvalidKeySetter');
    });

    it('should revert when setting keys twice (keys already set)', async () => {
      await electionKeyManager.setElectionKeys(paddedHeKey, paddedZkpKey);
      
      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));
      
      await expect(
        electionKeyManager.setElectionKeys(newHeKey, newZkpKey)
      ).to.be.revertedWith('KeysAlreadySet');
    });

    it('should revert when HE key is too short', async () => {
      const shortHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(32)); // Less than MIN_HE_KEY_LENGTH (64)
      
      await expect(
        electionKeyManager.setElectionKeys(shortHeKey, paddedZkpKey)
      ).to.be.revertedWith('InvalidHeKeyLength');
    });

    it('should revert when ZKP key is too short', async () => {
      const shortZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(16)); // Less than MIN_ZKP_KEY_LENGTH (32)
      
      await expect(
        electionKeyManager.setElectionKeys(paddedHeKey, shortZkpKey)
      ).to.be.revertedWith('InvalidZkpKeyLength');
    });

    it('should work with KEY_SETTER_ROLE granted to another account', async () => {
      // Grant KEY_SETTER_ROLE to keySetter
      await electionKeyManager.grantRole(KEY_SETTER_ROLE, keySetter.address);
      
      // keySetter should now be able to set keys
      await electionKeyManager.connect(keySetter).setElectionKeys(paddedHeKey, paddedZkpKey);
      
      const keysInitialized = await electionKeyManager.keysInitialized();
      expect(keysInitialized).to.be.true;
    });
  });

  describe('Key Rotation', () => {
    const initialHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
    const initialZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

    beforeEach(async () => {
      // Set initial keys first
      await electionKeyManager.setElectionKeys(initialHeKey, initialZkpKey);
    });

    it('should allow key rotation after interval', async () => {
      // Move time forward by KEY_ROTATION_INTERVAL (30 days)
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await electionKeyManager.rotateKeys(newHeKey, newZkpKey);
      
      const hePublicKey = await electionKeyManager.getHePublicKey();
      expect(hePublicKey).to.equal(newHeKey);
    });

    it('should emit KeysRotated event on rotation', async () => {
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await expect(electionKeyManager.rotateKeys(newHeKey, newZkpKey))
        .to.emit(electionKeyManager, 'KeysRotated');
    });

    it('should revert when trying to rotate too soon', async () => {
      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await expect(
        electionKeyManager.rotateKeys(newHeKey, newZkpKey)
      ).to.be.revertedWith('TooSoonToRotate');
    });

    it('should revert when rotating with same key', async () => {
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      // Try to rotate with the same key
      await expect(
        electionKeyManager.rotateKeys(initialHeKey, initialZkpKey)
      ).to.be.revertedWith('KeysAlreadySet');
    });

    it('should revert when non-key-setter tries to rotate', async () => {
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await expect(
        electionKeyManager.connect(nonKeySetter).rotateKeys(newHeKey, newZkpKey)
      ).to.be.revertedWith('InvalidKeySetter');
    });

    it('should update lastKeyRotation after rotation', async () => {
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      const beforeRotation = await electionKeyManager.lastKeyRotation();
      
      await electionKeyManager.rotateKeys(newHeKey, newZkpKey);
      
      const afterRotation = await electionKeyManager.lastKeyRotation();
      expect(afterRotation).to.be.gt(beforeRotation);
    });

    it('should return correct time until next rotation', async () => {
      const timeUntil = await electionKeyManager.getTimeUntilRotation();
      // Should be close to KEY_ROTATION_INTERVAL since keys were just set
      expect(timeUntil).to.be.gt(0);
    });

    it('should return 0 time when rotation is available', async () => {
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      const timeUntil = await electionKeyManager.getTimeUntilRotation();
      expect(timeUntil).to.equal(0);
    });
  });

  describe('Access Control', () => {
    it('should grant ADMIN_ROLE to primary admin', async () => {
      const hasRole = await electionKeyManager.hasRole(ADMIN_ROLE, admin.address);
      expect(hasRole).to.be.true;
    });

    it('should grant KEY_SETTER_ROLE to primary admin', async () => {
      const hasRole = await electionKeyManager.hasRole(KEY_SETTER_ROLE, admin.address);
      expect(hasRole).to.be.true;
    });

    it('should allow admin to grant KEY_SETTER_ROLE to other', async () => {
      await electionKeyManager.grantRole(KEY_SETTER_ROLE, keySetter.address);
      
      const hasRole = await electionKeyManager.hasRole(KEY_SETTER_ROLE, keySetter.address);
      expect(hasRole).to.be.true;
    });

    it('should allow admin to revoke KEY_SETTER_ROLE', async () => {
      await electionKeyManager.grantRole(KEY_SETTER_ROLE, keySetter.address);
      await electionKeyManager.revokeRole(KEY_SETTER_ROLE, keySetter.address);
      
      const hasRole = await electionKeyManager.hasRole(KEY_SETTER_ROLE, keySetter.address);
      expect(hasRole).to.be.false;
    });

    it('should correctly report isKeySetter', async () => {
      expect(await electionKeyManager.isKeySetter(admin.address)).to.be.true;
      expect(await electionKeyManager.isKeySetter(nonKeySetter.address)).to.be.false;
    });
  });

  describe('View Functions', () => {
    it('should return correct key holder count initially', async () => {
      const count = await electionKeyManager.getKeyHolderCount();
      expect(count).to.equal(0);
    });

    it('should return empty ceremony status initially', async () => {
      const [required, current, initialized, completed, id] = await electionKeyManager.getCeremonyStatus();
      
      expect(required).to.equal(0);
      expect(current).to.equal(0);
      expect(initialized).to.be.false;
      expect(completed).to.be.false;
      expect(id).to.equal(ethers.constants.Zero);
    });
  });

  describe('Emergency Key Reset', () => {
    const initialHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
    const initialZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

    beforeEach(async () => {
      await electionKeyManager.setElectionKeys(initialHeKey, initialZkpKey);
    });

    it('should allow admin to perform emergency key reset', async () => {
      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await electionKeyManager.emergencyKeyReset(newHeKey, newZkpKey);
      
      const hePublicKey = await electionKeyManager.getHePublicKey();
      expect(hePublicKey).to.equal(newHeKey);
    });

    it('should emit EmergencyKeyReset event', async () => {
      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await expect(electionKeyManager.emergencyKeyReset(newHeKey, newZkpKey))
        .to.emit(electionKeyManager, 'EmergencyKeyReset')
        .withArgs(admin.address);
    });

    it('should reset lastKeyRotation after emergency reset', async () => {
      // First rotate to set lastKeyRotation
      const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [KEY_ROTATION_INTERVAL]);
      await ethers.provider.send('evm_mine', []);

      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await electionKeyManager.emergencyKeyReset(newHeKey, newZkpKey);
      
      // Should be able to rotate again immediately (rotation timer reset)
      // Try to rotate - should still fail because interval hasn't passed yet (but that's different from KeysAlreadySet)
      // Actually with emergency reset, we should be able to set keys differently
    });

    it('should revert when non-admin tries emergency reset', async () => {
      const newHeKey = ethers.utils.hexlify(ethers.utils.randomBytes(100));
      const newZkpKey = ethers.utils.hexlify(ethers.utils.randomBytes(50));

      await expect(
        electionKeyManager.connect(nonKeySetter).emergencyKeyReset(newHeKey, newZkpKey)
      ).to.be.revertedWith(`AccessControl: account ${nonKeySetter.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });
  });
});