// Load dependencies
const { expect, use } = require('chai');
const { solidity } = require("ethereum-waffle");

use(solidity);
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  ether
} = require('@openzeppelin/test-helpers');
const { BigNumber } = require('ethers');

const { ZERO_ADDRESS } = constants;

const { GHOSTMARKET_ERC1155, TOKEN_NAME, TOKEN_SYMBOL, BASE_URI, METADATA_JSON, getLastTokenID, POLYNETWORK_ROLE, expectEqualStringValues, eventTesting, etherAmountAsBigNumberWD } = require('./include_in_tesfiles.js')

// Start test block
describe('GhostMarketERC1155', async function () {
  const data = '0x';
  const mintAmount = 2;
  let minter
  let minterWallet
  let transferToAccount
  let transferToWallet
  let royaltiesAccount
  let royaltiesWallet
  let anotherAccount
  let anotherWallet
  let royaltiesAccount2
  let royaltiesWallet2
  let signer

  beforeEach(async function () {
    let accounts = await ethers.getSigners()
    minter = accounts[0].address
    minterWallet = accounts[0]
    transferToAccount = accounts[1].address
    transferToWallet = accounts[1]
    royaltiesAccount = accounts[2].address
    royaltiesWallet = accounts[2]
    anotherAccount = accounts[3].address
    anotherWallet = accounts[3]
    royaltiesAccount2 = accounts[4].address
    royaltiesWallet2 = accounts[4]
    signer = accounts[5].address
    console.log('minter: ', minter)
    console.log('transferToAccount: ', transferToAccount)
    console.log('royaltiesAccount: ', royaltiesAccount)
    console.log('anotherAccount: ', anotherAccount)
    console.log('royaltiesAccount2: ', royaltiesAccount2)
    const ghostMarketER1155ContractFactory = await ethers.getContractFactory("GhostMarketERC1155");

    // Deploy a new contract before the tests
    this.GhostMarketERC1155 = await upgrades.deployProxy(
      ghostMarketER1155ContractFactory,
      [TOKEN_NAME, TOKEN_SYMBOL, BASE_URI],
      { initializer: "initialize", unsafeAllowCustomTypes: true });
    console.log('Deployed ERC1155 contract', this.GhostMarketERC1155.address);
  });

  it("should have name " + TOKEN_NAME, async function () {
    expect((await this.GhostMarketERC1155.name()).toString()).to.equal(TOKEN_NAME);
  });

  it("should have symbol " + TOKEN_SYMBOL, async function () {
    expect((await this.GhostMarketERC1155.symbol()).toString()).to.equal(TOKEN_SYMBOL);
  });

  it("should support interface _INTERFACE_ID_ERC1155_GHOSTMARKET", async function () {
    expect((await this.GhostMarketERC1155.supportsInterface(ethers.utils.hexlify("0x94407210"))).toString()).to.equal('true');
  });

  it("should support interface _GHOSTMARKET_NFT_ROYALTIES", async function () {
    expect((await this.GhostMarketERC1155.supportsInterface(ethers.utils.hexlify("0xe42093a6"))).toString()).to.equal('true');
  });

  it("should have initial counter = 1", async function () {
    expectEqualStringValues(await this.GhostMarketERC1155.getCurrentCounter(), 1)
  });

  it("should transfer ownership of contract", async function () {
    await this.GhostMarketERC1155.transferOwnership(transferToAccount);
    expect(await this.GhostMarketERC1155.owner()).to.equal(transferToAccount)
  });

  it("should upgrade contract", async function () {
    GhostMarketERC1155_ContractFactory = await ethers.getContractFactory("GhostMarketERC1155");
    GhostMarketER1155_V2_ContractFactory = await ethers.getContractFactory("TestGhostMarketERC1155_V2");

    const ghostMarketERC1155 = await upgrades.deployProxy(
      GhostMarketERC1155_ContractFactory,
      [TOKEN_NAME, TOKEN_SYMBOL, BASE_URI],
      { initializer: "initialize", unsafeAllowCustomTypes: true });


    const mintFeeValue = etherAmountAsBigNumberWD('0.1')
    await ghostMarketERC1155.setGhostmarketMintFee(mintFeeValue)

    //upgrade
    const ghostMarketERC1155_V2 = await upgrades.upgradeProxy(ghostMarketERC1155.address, GhostMarketER1155_V2_ContractFactory);

    //test new function
    expect(await ghostMarketERC1155_V2.getSomething()).eq(10);
    console.log("mint fee v2", (await ghostMarketERC1155_V2.getGhostmarketMintFees()).toString())

    //name and symbol should be the same
    expect((await ghostMarketERC1155_V2.name()).toString()).to.equal(TOKEN_NAME);
    expect((await ghostMarketERC1155_V2.symbol()).toString()).to.equal(TOKEN_SYMBOL);

    // increment already set _ghostmarketMintFees value
    result = await ghostMarketERC1155_V2.incrementMintingFee()
    await ghostMarketERC1155_V2.incrementMintingFee()
    console.log("mint fee 1", (await ghostMarketERC1155_V2._ghostmarketMintFees2()).toString())
    console.log("mint fee 2", mintFeeValue.add(1))

    expectEqualStringValues(await ghostMarketERC1155_V2._ghostmarketMintFees2(), mintFeeValue.add(1))

    await eventTesting(result, ghostMarketERC1155_V2, "NewMintFeeIncremented", {})
  })

  it("should mint token and have base uri", async function () {
    await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
    const tokenId = await getLastTokenID(this.GhostMarketERC1155)
    console.log("uri: ", await this.GhostMarketERC1155.uri(tokenId))
    expect(await this.GhostMarketERC1155.uri(tokenId)).to.equal(BASE_URI);
  });

  it("should mint token and have new base uri", async function () {
    const newUri = 'gggghost/api/{id}.json'
    this.GhostMarketERC1155.setURI(newUri);
    await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
    const tokenId = await getLastTokenID(this.GhostMarketERC1155)
    console.log("uri: ", await this.GhostMarketERC1155.uri(tokenId))
    expect(await this.GhostMarketERC1155.uri(tokenId)).to.equal(newUri);
  });

  describe('mintWithURI', function () {
    it("should grant POLYNETWORK_ROLE to address", async function () {
      await this.GhostMarketERC1155.grantRole(POLYNETWORK_ROLE, transferToAccount);
      const hasPolyRole = (await this.GhostMarketERC1155.hasRole(POLYNETWORK_ROLE, transferToAccount)).toString();
      expect(hasPolyRole).to.equal("true");
    });

    it("should mintWithURI and have given tokenURI", async function () {
      const mintAmount = BigNumber.from(20);
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      const specialuri = "special-uri"
      await this.GhostMarketERC1155.mintWithURI(minter, tokenId, specialuri, mintAmount)
      expect(await this.GhostMarketERC1155.uri(tokenId)).to.equal(specialuri);
    });

    it("should revert if minter using mintWithURI function has not the POLYNETWORK_ROLE", async function () {
      const mintAmount = BigNumber.from(20);
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      let transferToWalletSigner = await this.GhostMarketERC1155.connect(transferToWallet)
      await expectRevert(
        transferToWalletSigner.mintWithURI(minter, tokenId, tokenId, mintAmount, { from: transferToAccount }),
        "mintWithURI: must have POLYNETWORK_ROLE role to mint"
      );
    });
  });

  describe('burn NFT', function () {
    it('should burn a single NFT', async function () {
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
      //confirm its minted
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId), mintAmount)
      await this.GhostMarketERC1155.burn(minter, tokenId, mintAmount)
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId), 0)
    });

    it('should revert if not-owner tries to burn a NFT', async function () {
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
      //confirm its minted
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId), mintAmount)
      let transferToWalletSigner = await this.GhostMarketERC1155.connect(transferToWallet)

      await expectRevert(transferToWalletSigner.burn(transferToAccount, tokenId, mintAmount, { from: transferToAccount }),
        "ERC1155: burn amount exceeds balance"
      );
    });

    it('should burn multiple NFTs', async function () {
      const mintAmount = BigNumber.from(20);
      const mintAmount2 = BigNumber.from(30);
      const burnAmounts = [BigNumber.from(20), BigNumber.from(10)];

      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount2, data, [], "ext_uri", "", "")
      const tokenId2 = await getLastTokenID(this.GhostMarketERC1155)

      //confirm its minted
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId), mintAmount)
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId2), mintAmount2)

      const tokenBatchIds = [tokenId, tokenId2];
      await this.GhostMarketERC1155.burnBatch(
        minter,
        tokenBatchIds,
        burnAmounts,
        { from: minter },
      )
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId), mintAmount.sub(burnAmounts[0]))
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId2), mintAmount2.sub(burnAmounts[1]))
      /*       expect(await this.GhostMarketERC1155.balanceOf(minter, tokenId)).to.be.bignumber.equal((mintAmount - burnAmounts[0]).toString())
            expect(await this.GhostMarketERC1155.balanceOf(minter, tokenId2)).to.be.bignumber.equal((mintAmount2 - burnAmounts[1]).toString()) */
    });

    it('should revert if not-owner tries to burn a NFTs', async function () {
      const mintAmount = BigNumber.from(20);
      const mintAmount2 = BigNumber.from(30);
      const burnAmounts = [BigNumber.from(20), BigNumber.from(10)];
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount2, data, [], "ext_uri", "", "")
      const tokenId2 = await getLastTokenID(this.GhostMarketERC1155)
      //confirm its minted
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId), mintAmount)
      expectEqualStringValues(await this.GhostMarketERC1155.balanceOf(minter, tokenId2), mintAmount2)
      const tokenBatchIds = [tokenId, tokenId2];
      let anotherWalletSigner = await this.GhostMarketERC1155.connect(anotherWallet)

      await expectRevert(anotherWalletSigner.burnBatch(
        minter,
        tokenBatchIds,
        burnAmounts,
        { from: anotherAccount },
      ),
        "ERC1155: caller is not owner nor approved"
      );
    });
  });

  describe('mint with royalty', function () {
    it('should set royalties', async function () {
      const royaltyValue = 100
      const result = await this.GhostMarketERC1155.mintGhost(transferToAccount, mintAmount, data, [{ recipient: royaltiesAccount, value: royaltyValue }], "ext_uri", "", "");
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      const royalties = await this.GhostMarketERC1155.getRoyalties(tokenId)
      expect(royalties.length).to.equal(1);
      expectEqualStringValues(royalties[0].recipient, royaltiesAccount)
      expectEqualStringValues(royalties[0].value, royaltyValue)

    });

    it('should mint tokens with royalty fee and address', async function () {
      const value = 40
      const counter = parseInt((await this.GhostMarketERC1155.getCurrentCounter()).toString())
      const result = await this.GhostMarketERC1155.mintGhost(transferToAccount, mintAmount, data, [{ recipient: minter, value: value }], "ext_uri", "", "");
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      eventTesting(result, this.GhostMarketERC1155, 'TransferSingle', { operator: minter, from: ZERO_ADDRESS, to: transferToAccount, id: tokenId, value: mintAmount });
      expect(parseInt(((await this.GhostMarketERC1155.getCurrentCounter()).toString()))).to.equal(counter + 1);

      const values = await this.GhostMarketERC1155.getRoyaltiesBps(tokenId);
      const royaltyRecepient = await this.GhostMarketERC1155.getRoyaltiesRecipients(tokenId);
      expect(values.length).to.equal(1);
      expectEqualStringValues(values[0], value)
      expectEqualStringValues(royaltyRecepient[0], minter)

      const tokenURI = await this.GhostMarketERC1155.uri(tokenId)
      await eventTesting(result, this.GhostMarketERC1155, "Minted", { toAddress: transferToAccount, tokenId: tokenId, externalURI: "ext_uri", amount: mintAmount })
    });

    it('should revert if royalty is more then 50%', async function () {
      const value = 5001
      await expectRevert(this.GhostMarketERC1155.mintGhost(transferToAccount, mintAmount, data, [{ recipient: minter, value: value }], "ext_uri", "", ""),
        "Royalties value should not be more than 50%"
      );
    });
  });

  it('everyone can mint', async function () {
    this.GhostMarketERC1155.mintGhost(transferToAccount, mintAmount, data, [], "ext_uri", "", { from: royaltiesAccount2 })
  });

  describe('mint NFT with fee', function () {
    it('should mint if setGhostmarketMintFee is set to 0', async function () {
      const value = etherAmountAsBigNumberWD('0');
      await this.GhostMarketERC1155.setGhostmarketMintFee(value)
      let feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "")
      let feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      expect(parseInt(feeAddressEthBalanceAfter)).to.equal(parseInt(feeAddressEthBalanceBefore))
    });

    it('should send fee to contract', async function () {
      const value = etherAmountAsBigNumberWD('0.1');
      await this.GhostMarketERC1155.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value });
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      console.log("feeAddress eth balance before: ", feeAddressEthBalanceBefore)
      console.log("feeAddress eth balance after: ", feeAddressEthBalanceAfter)
      expect(parseInt(feeAddressEthBalanceAfter)).to.equal(parseInt(feeAddressEthBalanceBefore) + parseInt(value))
    });

    it('should send fee to contract from another account then the contract owner', async function () {
      const value = etherAmountAsBigNumberWD('0.1');
      await this.GhostMarketERC1155.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      let royaltiesSigner = await this.GhostMarketERC1155.connect(royaltiesWallet)

      await royaltiesSigner.mintGhost(royaltiesAccount, mintAmount, data, [], "ext_uri", "", "ts", { value: value, from: royaltiesAccount })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      console.log("feeAddress eth balance before: ", feeAddressEthBalanceBefore)
      console.log("feeAddress eth balance after: ", feeAddressEthBalanceAfter)
      expect(parseInt(feeAddressEthBalanceAfter)).to.equal(parseInt(feeAddressEthBalanceBefore) + parseInt(value))
    });
  });

  describe('withdraw from contract', function () {
    it('should withdraw all available balance from contract', async function () {
      const value = etherAmountAsBigNumberWD('0.1');
      await this.GhostMarketERC1155.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      let royaltiesAccountSigner = await this.GhostMarketERC1155.connect(royaltiesWallet)

      await royaltiesAccountSigner.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value, from: royaltiesAccount })
      await royaltiesAccountSigner.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value, from: royaltiesAccount })
      await royaltiesAccountSigner.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value, from: royaltiesAccount })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      await this.GhostMarketERC1155.withdraw(feeAddressEthBalanceAfter)
      expect(await web3.eth.getBalance(this.GhostMarketERC1155.address)).to.equal('0')
    });

    it('should revert if trying to withdraw more then the contract balance', async function () {
      const value = etherAmountAsBigNumberWD('0.1');
      await this.GhostMarketERC1155.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value })
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value })
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      await expectRevert(this.GhostMarketERC1155.withdraw(feeAddressEthBalanceAfter + value),
        "Withdraw amount should be greater then 0 and less then contract balance"
      );
    });

    it('should revert if other then the contract owner tries to withdraw', async function () {
      const value = etherAmountAsBigNumberWD('0.1');
      await this.GhostMarketERC1155.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value })
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value })
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", "ts", { value: value })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC1155.address)
      let royaltiesAccountSigner = await this.GhostMarketERC1155.connect(royaltiesWallet)
      await expectRevert(royaltiesAccountSigner.withdraw(feeAddressEthBalanceAfter, { from: royaltiesAccount }),
        "Ownable: caller is not the owner"
      );
    });

  });

  it("should mint with json string", async function () {
    await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", METADATA_JSON, "")
    const tokenId = await getLastTokenID(this.GhostMarketERC1155)
    expect(await this.GhostMarketERC1155.getMetadataJson(tokenId)).to.equal(METADATA_JSON)
  });

  describe('mint with locked content', function () {
    const mintAmount = BigNumber.from(1);
    const hiddencontent = "top secret"
    const value = etherAmountAsBigNumberWD('0.1');
    it("should set and get locked content for nft", async function () {
      await this.GhostMarketERC1155.mintGhost(transferToAccount, mintAmount, data, [], "ext_uri", "", hiddencontent)
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      let transferToWalletSigner = await this.GhostMarketERC1155.connect(transferToWallet)

      const result = await transferToWalletSigner.getLockedContent(tokenId, { from: transferToAccount })
      await eventTesting(result, this.GhostMarketERC1155, "LockedContentViewed", {
        msgSender: transferToAccount,
        tokenId: tokenId,
        lockedContent: hiddencontent,
      })
    });

    it("should revert if other then token owner tries to fetch locked content", async function () {
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", hiddencontent)
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      //caller is the minter
      await this.GhostMarketERC1155.getLockedContent(tokenId)
      let anotherWalletSigner = await this.GhostMarketERC1155.connect(anotherWallet)
      await expectRevert(anotherWalletSigner.getLockedContent(tokenId, { from: anotherAccount }),
        "Caller must be the owner of the NFT"
      );
    });

    it("should increment locked content view count", async function () {
      const hiddencontent = "top secret"
      await this.GhostMarketERC1155.mintGhost(minter, mintAmount, data, [], "ext_uri", "", hiddencontent)
      const tokenId = await getLastTokenID(this.GhostMarketERC1155)
      const currentCounter = await this.GhostMarketERC1155.getCurrentLockedContentViewTracker(tokenId)
      // call two times the getLockedContent function, counter should increment by 2
      await this.GhostMarketERC1155.getLockedContent(tokenId)
      await this.GhostMarketERC1155.getLockedContent(tokenId)
      expectEqualStringValues(await this.GhostMarketERC1155.getCurrentLockedContentViewTracker(tokenId), currentCounter.add(2))
      //another NFT
      await this.GhostMarketERC1155.mintGhost(transferToAccount, mintAmount, data, [], "ext_uri", "", "top secret2")
      const tokenId2 = await getLastTokenID(this.GhostMarketERC1155)
      const currentCounter2 = await this.GhostMarketERC1155.getCurrentLockedContentViewTracker(tokenId2)
      let transferToWalletSigner = await this.GhostMarketERC1155.connect(transferToWallet)

      await transferToWalletSigner.getLockedContent(tokenId2, { from: transferToAccount })
      expectEqualStringValues(await this.GhostMarketERC1155.getCurrentLockedContentViewTracker(tokenId2), currentCounter2.add(1))
    });
  });
}); 