# GhostMarket Avalanche NFT ERC721 & ERC1155 Contracts
## Deployed Contracts:

#### GhostMarketERC721
https://snowtrace.io/address/0x068bef92987d16ef682ff017b822ca1211401eaf

#### GhostMarketERC1155
https://snowtrace.io/address/0xdcdab251151c345ad527851eca783521ea3209e0

#### ProxyAdmin
https://snowtrace.io/address/0xf1c82f5ddb4f1a6a8f3eed2eb25fc39fc6d33fb3

#### TransparentUpgradeableProxy
https://snowtrace.io/address/0xf41db445d7eaf45536985ce185ce131fa4b42e68

#### TransparentUpgradeableProxy
https://snowtrace.io/address/0x26d583e2cda958b13cc319fad124aa729f8a196e

## Audit

Coming soon...

## Technical Information

Upgradable ERC721 & ERC1155 Contract.

Using OpenZeppelin contracts.

### Compiling contracts
```
hardhat compile
```

### Deploying Proxy

Using hardhat to deploy proxy contracts

Contracts can be deployed

#### locally

```
hardhat run scripts/deployERC721.js  

hardhat run scripts/deployERC1155.js
```

#### to network
```
hardhat run --network <network_name> scripts/<deploy_script>.js
```
For local deployment ganache must be started and private keys saved into

```
.secrets.json
```

secrets.json structure:

```
{
    "AVALANCHE_TESTNET_PRIVATE_KEY": ["key1","key1"],
    "AVALANCHE_MAINNET_PRIVATE_KEY": ["key1","key1"],
    "LOCAL_PRIVATE_KEYS": ["key1","key1"],
}
```

## Testing

tests can be run with:

```
./runGhostMarketERC721_tests.sh
```

default network is `test` or a network parameter can be added

```
./runGhostMarketERC721_tests.sh avalanchetestnet
```

## Verifying contracts

```
hardhat verify --network <network_name> <0x_contract_address>
```

Check if verification was a success:

[testnet](https://cchain.explorer.avax-test.network/)

[mainnet](https://cchain.explorer.avax.network/)

### running individual tests

choose a test file
```
hardhat test test/<testname>.js
```

with the .only flag individual test can be run  
```
it.only("should run this test") async function () {
  ...
}
```



