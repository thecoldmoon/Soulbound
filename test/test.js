const { expect } = require("chai");

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
    const soulBoundToken = await SBtoken.deploy(creatorToken.address);

    await soulBoundToken.deployed();

    console.log("Soulbound Contract deployed to:", soulBoundToken.address);

    // Fixtures can return anything you consider useful for your tests
    return { creatorToken, creatorOwner, soulBoundToken, soulBoundOwner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Register Extension", async function () {

      const { creatorToken, soulBoundToken} = await loadFixture(deployCreatorFixture);
      await creatorToken['registerExtension(address,string)'](soulBoundToken.address, '');
      await soulBoundToken.setApproveTransfer(creatorToken.address, true);
      const extensionsAvailable = await creatorToken.getExtensions()

      expect(extensionsAvailable[0]).to.equal(soulBoundToken.address);
    });
  });

  // You can nest describe calls to create subsections.
  describe("Transaction", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.
    // If the callback function is async, Mocha will `await` it.

    async function deployExtensionFixture() {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployCreatorFixture);
      await creatorToken['registerExtension(address,string)'](soulBoundToken.address, '');
      await soulBoundToken.setApproveTransfer(creatorToken.address, true);

      return { creatorToken, creatorOwner, soulBoundToken, addr1, addr2}
    }

    it("Creator mints token", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      const id = await soulBoundToken['mint(address)'](creatorOwner.address);
      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
    });
    it("Try to transfer token", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);
      await soulBoundToken['mint(address)'](creatorOwner.address);
      await expect(creatorToken['safeTransferFrom(address,address,uint256)'](creatorOwner.address, addr1.address, 1)).to.be.revertedWith('This token is soulbound');

      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
    });
    it("Create multiple tokens, get array", async function () {
      const { creatorToken, creatorOwner, soulBoundToken, addr1, addr2} = await loadFixture(deployExtensionFixture);

      await soulBoundToken['mint(address)'](creatorOwner.address);
      await soulBoundToken['mint(address)'](addr1.address);
      await soulBoundToken['mint(address)'](addr2.address);

      expect(await creatorToken['ownerOf(uint256)'](1)).to.equal(creatorOwner.address)
      expect(await creatorToken['ownerOf(uint256)'](2)).to.equal(addr1.address)
      expect(await creatorToken['ownerOf(uint256)'](3)).to.equal(addr2.address)

      const addresses = [creatorOwner.address, addr1.address, addr2.address]
      expect(await soulBoundToken.getTokenOwners()).to.eql(addresses)

    });
  });

});
