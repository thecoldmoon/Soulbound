<h1 align="center">Soulbound Extension</h1>

<br />

This Manifold Extension allows users to create soulbound (non-transferrable) tokens on an existing Manifold ERC-721 contract. 
This is currently works on the goerli testnet.

<br />

# ๐ Manifold Dependencies needed:

[https://github.com/manifoldxyz/studio-app-sdk-react](https://github.com/manifoldxyz/studio-app-sdk-react)
[https://github.com/manifoldxyz/studio-app-sdk](https://github.com/manifoldxyz/studio-app-sdk)

<br />

## โก๏ธ To run on remixd

Run in one tab:
```
npx hardhat node
```
Run in another tab:
```
remixd -s ./ --remix-ide https://remix.ethereum.org
```

Open [https://remix.ethereum.org/](https://remix.ethereum.org/) to view it in the browser. Make sure to connect to localhost

<br />

## ๐งช test

```
npx hardhat test
```

<br />

## ๐ฆพ compile and deploy
```
npx hardhat compile
```
```
npx hardhat run scripts/deploy.js --network goerli
```

# ๐งฌ Project structure

This is the structure of the files in the project:

```sh
    โ
    โโโ frontend                   # see /Soulbound-frontend repo        
    โโโ contracts                  # Primary Contracts
    โ   โโโ ISoulbound.sol         # Extension Interface
    โ   โโโ Soulbound.sol          # Extension 
    โ   โโโ tutorial3.sol          # Mock ERC-721 contract for tests  
    โโโ scripts                    # Deployment Scripts
    โ   โโโ deploy.js        
    โโโ test                       # Automated tests
    โ   โโโ test.js        
    โโโ hardhat.config.js          # Hardhat configs
    โโโ package-lock.json
    โโโ package.json
    โโโ README.md
    โโโ remix-compiler.config.js  # Remix configs
```

