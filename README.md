<h1 align="center">Soulbound Extension</h1>

<br />

This Manifold Extension allows users to create soulbound (non-transferrable) tokens on an existing Manifold ERC-721 contract. 
This is currently works on the goerli testnet.

<br />

# 🚀 Manifold Dependencies needed:

[https://github.com/manifoldxyz/studio-app-sdk-react](https://github.com/manifoldxyz/studio-app-sdk-react)
[https://github.com/manifoldxyz/studio-app-sdk](https://github.com/manifoldxyz/studio-app-sdk)

<br />

## ⚡️ To run on remixd

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

## 🧪 test

```
npx hardhat test
```

<br />

## 🦾 compile and deploy
```
npx hardhat compile
```
```
npx hardhat run scripts/deploy.js --network goerli
```

# 🧬 Project structure

This is the structure of the files in the project:

```sh
    │
    ├── frontend                   # see /Soulbound-frontend repo        
    ├── contracts                  # Primary Contracts
    │   ├── ISoulbound.sol         # Extension Interface
    │   ├── Soulbound.sol          # Extension 
    │   ├── tutorial3.sol          # Mock ERC-721 contract for tests  
    ├── scripts                    # Deployment Scripts
    │   ├── deploy.js        
    ├── test                       # Automated tests
    │   ├── test.js        
    ├── hardhat.config.js          # Hardhat configs
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── remix-compiler.config.js  # Remix configs
```

