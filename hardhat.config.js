/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: { version: "0.8.7", settings: { optimizer: { enabled: true, runs: 1 } }},
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/uRb42IGNhtGy_uJfyAYb5QU9r65i2BR5',
      accounts: [`ee85e3716848c5c7e52f34487a3f557fbc21fca6c9af8b73f940ea61fc754131`]
    }
  }
};