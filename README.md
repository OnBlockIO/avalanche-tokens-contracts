# GhostMarket NFT ERC721 & ERC1155 Contracts
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



