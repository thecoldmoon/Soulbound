const { expect } = require("chai");
const BigNumber = require('bignumber.js');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Soulbound Contract", function () {
  async function deployCreatorFixture() {
    // CREATE A CREATOR CONTRACT
    const Token = await ethers.getContractFactory("TUTORIAL3");
    const [creatorOwner, addr1, addr2] = await ethers.getSigners();
    const creatorToken = await Token.deploy();

    await creatorToken.deployed();
    console.log("Creator Contract deployed to:", creatorToken.address);

    // CREATE SOULBOUND CONTRACT
    const SBtoken = await ethers.getContractFactory("SoulBound");
    const [soulBoundOwner, addr3, addr4] = await ethers.getSigners();
    const soulBoundToken = await SBtoken.deploy(creatorToken.address);

    await soulBoundToken.deployed();

    console.log("Soulbound Contract deployed to:", soulBoundToken.address);

    // Fixtures can return anything you consider useful for your tests
    return { creatorToken, creatorOwner, soulBoundToken, soulBoundOwner, addr1, addr2 };
  }

  async function deployExtensionFixture() {
    const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployCreatorFixture);
    await creatorToken['registerExtension(address,string)'](soulBoundToken.address, '');
    await soulBoundToken.setApproveTransfer(creatorToken.address, true);

    return { creatorToken, creatorOwner, soulBoundToken, addr1, addr2}
  }

  describe("Deployment", function () {
    it("Register Extension", async function () {

      const { creatorToken, soulBoundToken} = await loadFixture(deployCreatorFixture);
      await creatorToken['registerExtension(address,string)'](soulBoundToken.address, '');
      await soulBoundToken.setApproveTransfer(creatorToken.address, true);
      const extensionsAvailable = await creatorToken.getExtensions()

      expect(extensionsAvailable[0]).to.equal(soulBoundToken.address);
      expect(await soulBoundToken.supportsInterface(0x54bd1f8f)).to.equal(true);
      expect(await creatorToken.supportsInterface(0x54bd1f8f)).to.equal(false);
    });
    it("Unnamed Collection: Throw Error", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      
      // The test below fails despite having the same reverted reason string
      await expect(await soulBoundToken.mint('', creatorOwner.address, '000000000000000000000001')).to.be.revertedWith('Invalid Collection name');


    });
    it("Named Collection: Check collection name", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      const id = await soulBoundToken.mint('Cheddar Cheese', creatorOwner.address, '000000000000000000000001');
      const collectionNames = ['Cheddar Cheese'];
      const collectionEditions = [1];
      expect(await soulBoundToken.getCollections()).to.eql([collectionNames, collectionEditions]);
      expect(await soulBoundToken.editionCountByCollectionName('Cheddar Cheese')).to.equal(1);
    });
  });

  // Testing the minting transaction of tokens
  describe("Transaction", function () {

    it("Creator mints token", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      const id = await soulBoundToken.mint('test', creatorOwner.address, '000000000000000000000001');
      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
    });
    it("Try to transfer token: Throw Error", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      await soulBoundToken.mint('test', creatorOwner.address, '000000000000000000000003');
      await expect(creatorToken['safeTransferFrom(address,address,uint256)'](creatorOwner.address, addr1.address, 1)).to.be.revertedWith('This token is soulbound');

      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
    });
    it("Create multiple tokens, check token owners", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      await soulBoundToken.mint('test', creatorOwner.address, '000000000000000000000001');
      await soulBoundToken.mint('test', addr1.address, '00000000000000002');
      await soulBoundToken.mint('test', addr2.address, '000000000000000000000003');

      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
      expect(await creatorToken['ownerOf(uint256)'](2)).to.equal(addr1.address)
      expect(await creatorToken['ownerOf(uint256)'](3)).to.equal(addr2.address)

    });
  });

  // Testing get functions
  describe("External Facing Functions", function () {

    it("Extension with minted tokens: Get Edition Count, tokenIds, tokenowners", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      const id1 = await soulBoundToken.mint('test', creatorOwner.address, '000000000000000000000001');
      const id2 = await soulBoundToken.mint('test', addr1.address, '00000000000000002');
      const id3 = await soulBoundToken.mint('test', addr2.address, '000000000000000000000003');
      expect(await soulBoundToken.editionCountByCollectionName('test')).to.equal(3);
      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
      expect(await creatorToken['ownerOf(uint256)'](2)).to.equal(addr1.address)


      const tokenIds = await soulBoundToken.getTokenIds();
      let tokens = tokenIds.map((number) => (number.toString()));
      const ids = ['1', '2', '3'];
      expect(tokens).to.eql(ids);

      const addresses = [creatorOwner.address, addr1.address, addr2.address]
      expect(await soulBoundToken.getTokenOwnersForCollection('test')).to.eql(addresses);
      expect(await soulBoundToken.editionCountByCollectionName('test')).to.equal(3);

    });
    it("Extension with no minted tokens: Get Edition Count, tokenIds, tokenowners", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      expect(await soulBoundToken.editionCountByCollectionName('test')).to.equal(0)
      expect(await soulBoundToken['getTokenIds()']()).to.eql([])
      expect(await soulBoundToken.getTokenOwnersForCollection('test')).to.eql([])
      expect(await soulBoundToken.getCollections()).to.eql([[], []]);

    });
    it("Multiple collections: Verify Edition Count, Collection Names", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      const id1 = await soulBoundToken.mint("test", creatorOwner.address, '000000000000000000000001');
      const id2 = await soulBoundToken.mint("test1", addr1.address, '00000000000000002');
      const id3 = await soulBoundToken.mint("test2", addr2.address, '000000000000000000000003');
      
      expect(await soulBoundToken.editionCountByCollectionName('test')).to.equal(1)
      expect(await soulBoundToken.editionCountByCollectionName('test1')).to.equal(1)
      expect(await soulBoundToken.editionCountByCollectionName('test2')).to.equal(1)
      const collectionName = ['test', 'test1', 'test2'];
      expect(await soulBoundToken.getCollections()).to.eql([collectionName, [1, 1, 1]]);

    });
    it("Verify URI", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      const id1 = await soulBoundToken.mint("test", creatorOwner.address, '000000000000000000000001');
      const id2 = await soulBoundToken.mint("test", addr1.address, '00000000000000002');
      const id3 = await soulBoundToken.mint("test", addr2.address, '000000000000000000000003');
      await soulBoundToken.setBaseURI('www.cheddar.com/')
      const tokenIds = await soulBoundToken.getTokenIds();
      expect(await soulBoundToken.tokenURI(creatorToken.address, tokenIds[0])).to.eql('www.cheddar.com/000000000000000000000001')
      expect(await soulBoundToken.tokenURI(creatorToken.address, tokenIds[1])).to.eql('www.cheddar.com/00000000000000002')
      expect(await soulBoundToken.tokenURI(creatorToken.address, tokenIds[2])).to.eql('www.cheddar.com/000000000000000000000003')
    });
  });

});
