# GhostMarket NFT ERC721 & ERC1155 Contracts
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

Contracts can be deployed with the following commands

#### locally

```
hardhat deploy  

```

#### to network
```
hardhat --network <network_name> deploy
```

deploy individually to testnet:

```
hardhat --network testnet deploy --tags GhostMarketERC1155
```

For local deployment ganache-cli can be optionally used with the keys from:  

```
.secrets.json
```

## Testing

tests can be run with:

```
hardhat test
```

## Verifying contracts

```
hardhat --network <network_name> sourcify
```
example:
```
hardhat --network testnet sourcify
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



