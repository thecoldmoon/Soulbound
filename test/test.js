const { expect } = require("chai");
const BigNumber = require('bignumber.js');
// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Soulbound Contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployCreatorFixture() {
    // CREATE A CREATOR CONTRACT
    const Token = await ethers.getContractFactory("TUTORIAL3");
    const [creatorOwner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    const creatorToken = await Token.deploy();

    await creatorToken.deployed();
    console.log("Creator Contract deployed to:", creatorToken.address);

    // CREATE SOULBOUND CONTRACT
    const SBtoken = await ethers.getContractFactory("SoulBound");
    const [soulBoundOwner, addr3, addr4] = await ethers.getSigners();
    const soulBoundToken = await SBtoken.deploy(creatorToken.address, "Cheddar Cheese");

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
    });
    it("Unnamed Extension: Throw Error", async function () {
      const Token = await ethers.getContractFactory("TUTORIAL3");
      const [creatorOwner, addr1, addr2] = await ethers.getSigners();
      const creatorToken = await Token.deploy();

      await creatorToken.deployed();
      console.log("Creator Contract deployed to:", creatorToken.address);

      // CREATE SOULBOUND CONTRACT
      const SBtoken = await ethers.getContractFactory("SoulBound");
      await expect(SBtoken.deploy(creatorToken.address, "")).to.be.revertedWith("Invalid Collection Name");


    });
    it("Named Extension: Check extension, collection name construction", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployCreatorFixture);

      expect(await soulBoundToken.extensionName()).to.equal('SoulBound');
      expect(await soulBoundToken.collectionName()).to.equal('Cheddar Cheese');
    });
  });

  // Testing the minting transaction of tokens
  describe("Transaction", function () {

    it("Creator mints token", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      const id = await soulBoundToken.mint(creatorOwner.address, '000000000000000000000001');
      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
    });
    it("Try to transfer token: Throw Error", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      await soulBoundToken.mint(creatorOwner.address, '000000000000000000000003');
      await expect(creatorToken['safeTransferFrom(address,address,uint256)'](creatorOwner.address, addr1.address, 1)).to.be.revertedWith('This token is soulbound');

      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
    });
    it("Create multiple tokens, check token owners", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      await soulBoundToken.mint(creatorOwner.address, '000000000000000000000001');
      await soulBoundToken.mint(addr1.address, '00000000000000002');
      await soulBoundToken.mint(addr2.address, '000000000000000000000003');

      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
      expect(await creatorToken['ownerOf(uint256)'](2)).to.equal(addr1.address)
      expect(await creatorToken['ownerOf(uint256)'](3)).to.equal(addr2.address)

    });
  });

  // Testing get functions
  describe("External Facing Functions", function () {

    it("Extension with minted tokens: Get Edition Count, tokenIds, tokenowners", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      const id1 = await soulBoundToken.mint(creatorOwner.address, '000000000000000000000001');
      const id2 = await soulBoundToken.mint(addr1.address, '00000000000000002');
      const id3 = await soulBoundToken.mint(addr2.address, '000000000000000000000003');
      expect(await soulBoundToken['editionCount()']()).to.equal(3);
      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
      expect(await creatorToken['ownerOf(uint256)'](2)).to.equal(addr1.address)


      const tokenIds = await soulBoundToken.getTokenIds();
      let tokens = tokenIds.map((number) => (number.toString()));
      const ids = ['1', '2', '3'];
      expect(tokens).to.eql(ids);

      const addresses = [creatorOwner.address, addr1.address, addr2.address]
      expect(await soulBoundToken.getTokenOwners()).to.eql(addresses)

    });
    it("Extension with no minted tokens: Get Edition Count, tokenIds, tokenowners", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      expect(await soulBoundToken.editionCount()).to.equal(0)
      expect(await soulBoundToken['getTokenIds()']()).to.eql([])
      expect(await soulBoundToken.getTokenOwners()).to.eql([])

    });
    it("Verify URI", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      const id1 = await soulBoundToken.mint(creatorOwner.address, '000000000000000000000001');
      const id2 = await soulBoundToken.mint(addr1.address, '00000000000000002');
      const id3 = await soulBoundToken.mint(addr2.address, '000000000000000000000003');
      await soulBoundToken.setBaseURI('www.cheddar.com/')
      const tokenIds = await soulBoundToken.getTokenIds();
      expect(await soulBoundToken.tokenURI(creatorToken.address, tokenIds[0])).to.eql('www.cheddar.com/000000000000000000000001')
      expect(await soulBoundToken.tokenURI(creatorToken.address, tokenIds[1])).to.eql('www.cheddar.com/00000000000000002')
      expect(await soulBoundToken.tokenURI(creatorToken.address, tokenIds[2])).to.eql('www.cheddar.com/000000000000000000000003')
    });
  });

});
