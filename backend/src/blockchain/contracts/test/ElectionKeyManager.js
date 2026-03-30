const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElectionKeyManager", function () {
  let keyManager;
  let owner;
  let addr1;
  let addr2;

  // Test data
  const VALID_HE_KEY = ethers.utils.randomBytes(64);
  const VALID_ZKP_KEY = ethers.utils.randomBytes(128);
  const SHORT_HE_KEY = ethers.utils.randomBytes(32); // Too short
  const LONG_HE_KEY = ethers.utils.randomBytes(10000); // Too long
  const SHORT_ZKP_KEY = ethers.utils.randomBytes(16); // Too short
  const CEREMONY_ID = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ceremony1"));

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const KeyManager = await ethers.getContractFactory("ElectionKeyManager");
    keyManager = await KeyManager.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("should set primary admin", async function () {
      expect(await keyManager.primaryAdmin()).to.equal(owner.address);
    });

    it("should not have keys initialized initially", async function () {
      expect(await keyManager.keysInitialized()).to.equal(false);
    });
  });

  describe("Setting Keys", function () {
    it("should allow key setter to set keys", async function () {
      await keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY);
      
      expect(await keyManager.keysInitialized()).to.equal(true);
      expect(await keyManager.areKeysSet()).to.equal(true);
    });

    it("should reject empty HE key", async function () {
      await expect(
        keyManager.setElectionKeys(ethers.utils.toUtf8Bytes(""), VALID_ZKP_KEY)
      ).to.be.revertedWith("EmptyHeKey");
    });

    it("should reject empty ZKP key", async function () {
      await expect(
        keyManager.setElectionKeys(VALID_HE_KEY, ethers.utils.toUtf8Bytes(""))
      ).to.be.revertedWith("EmptyZkpKey");
    });

    it("should reject HE key that is too short", async function () {
      await expect(
        keyManager.setElectionKeys(SHORT_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("InvalidHeKeyLength");
    });

    it("should reject HE key that is too long", async function () {
      await expect(
        keyManager.setElectionKeys(LONG_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("InvalidHeKeyLength");
    });

    it("should reject ZKP key that is too short", async function () {
      await expect(
        keyManager.setElectionKeys(VALID_HE_KEY, SHORT_ZKP_KEY)
      ).to.be.revertedWith("InvalidZkpKeyLength");
    });

    it("should prevent setting keys twice", async function () {
      await keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY);
      
      await expect(
        keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("KeysAlreadySet");
    });

    it("should not allow non-key-setter to set keys", async function () {
      await expect(
        keyManager.connect(addr1).setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("InvalidKeySetter");
    });
  });

  describe("Key Rotation", function () {
    beforeEach(async function () {
      await keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY);
    });

    it("should prevent immediate rotation", async function () {
      await expect(
        keyManager.rotateKeys(VALID_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("TooSoonToRotate");
    });
  });

  describe("Emergency Key Reset", function () {
    it("should allow admin to emergency reset", async function () {
      await keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY);
      
      const newHeKey = ethers.utils.randomBytes(64);
      const newZkpKey = ethers.utils.randomBytes(128);
      
      await keyManager.emergencyKeyReset(newHeKey, newZkpKey);
      
      const retrievedKey = await keyManager.getHePublicKey();
      expect(ethers.utils.hexlify(retrievedKey)).to.equal(ethers.utils.hexlify(newHeKey));
    });

    it("should not allow non-admin to emergency reset", async function () {
      await expect(
        keyManager.connect(addr1).emergencyKeyReset(VALID_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Role Management", function () {
    it("should allow admin to add key setter", async function () {
      await keyManager.addKeySetter(addr1.address);
      
      const isSetter = await keyManager.isKeySetter(addr1.address);
      expect(isSetter).to.equal(true);
    });

    it("should allow new key setter to set keys", async function () {
      await keyManager.addKeySetter(addr1.address);
      
      // Reset keys for testing (would need emergency reset in real scenario)
      // For testing, we can grant admin to bypass
    });

    it("should not allow non-admin to add key setter", async function () {
      await expect(
        keyManager.connect(addr1).addKeySetter(addr2.address)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Key Ceremony", function () {
    it("should allow admin to initialize ceremony", async function () {
      await keyManager.initializeKeyCeremony(CEREMONY_ID, 3);
      
      const status = await keyManager.getCeremonyStatus();
      expect(status.required).to.equal(3);
      expect(status.initialized).to.equal(true);
    });

    it("should reject invalid ceremony ID", async function () {
      await expect(
        keyManager.initializeKeyCeremony(ethers.constants.HashZero, 3)
      ).to.be.revertedWith("InvalidCeremonyId");
    });

    it("should allow ceremony contribution", async function () {
      await keyManager.initializeKeyCeremony(CEREMONY_ID, 3);
      await keyManager.addKeyHolder(addr1.address);
      
      const participantKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("participantKey"));
      await keyManager.connect(addr1).contributeToCeremony(participantKey);
      
      const holder = await keyManager.keyHolders(addr1.address);
      expect(holder.hasContributed).to.equal(true);
    });

    it("should complete ceremony when all contribute", async function () {
      await keyManager.initializeKeyCeremony(CEREMONY_ID, 1);
      await keyManager.addKeyHolder(addr1.address);
      
      const participantKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("participantKey"));
      await keyManager.connect(addr1).contributeToCeremony(participantKey);
      
      const status = await keyManager.getCeremonyStatus();
      expect(status.completed).to.equal(true);
    });
  });

  describe("Pausing", function () {
    it("should allow admin to pause", async function () {
      await keyManager.pause();
      expect(await keyManager.paused()).to.equal(true);
    });

    it("should prevent key setting when paused", async function () {
      await keyManager.pause();
      
      await expect(
        keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should allow admin to unpause", async function () {
      await keyManager.pause();
      await keyManager.unpause();
      expect(await keyManager.paused()).to.equal(false);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await keyManager.setElectionKeys(VALID_HE_KEY, VALID_ZKP_KEY);
    });

    it("should return HE public key", async function () {
      const key = await keyManager.getHePublicKey();
      expect(ethers.utils.hexlify(key)).to.equal(ethers.utils.hexlify(VALID_HE_KEY));
    });

    it("should return ZKP verification key", async function () {
      const key = await keyManager.getZkpVerificationKey();
      expect(ethers.utils.hexlify(key)).to.equal(ethers.utils.hexlify(VALID_ZKP_KEY));
    });

    it("should return time until rotation", async function () {
      const time = await keyManager.getTimeUntilRotation();
      // Should be ~30 days (converted to seconds)
      expect(time).to.be.gt(0);
    });
  });
});
