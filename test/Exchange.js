const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Exchange", () => {
  let deployer, feeAccount, exchange, token1

  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')

    token1 = await Token.deploy('Blockchain token', 'SSS', '1000000')
    // console.log(token1)
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]

    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    await transaction.wait()

    exchange = await Exchange.deploy(feeAccount.address, feePercent)
    // console.log(await exchange.feeAccount())
    // console.log(feeAccount.address)
  })

  describe('Deployment', () => {
    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    beforeEach(async () => {
      // console.log(user1.address, exchange.address, amount.toString())
      //Approve Token
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
      //Deposit Token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
    })

    describe('Success', () => {
      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it('emits a Deposit event', async () => {
        const event = result.events[1]
        expect(event.event).to.equal('Deposit')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).equal(amount)
        expect(args.balance).equal(amount)

      })
    })

    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
        // Don't approve any tokens before depositing
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
      })
    })
  })

  describe('Withdrawing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {
        //Deposit tokens before withdrawing

        //Approve Token
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        //Deposit Token
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

        //Now withdraw Tokens
        transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('withdraw token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      })

      it('emits a Withdraw event', async () => {
        const event = result.events[1]
        expect(event.event).to.equal('Withdraw')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).equal(amount)
        expect(args.balance).equal(0)

      })
    })


    describe('Failure', () => {
      it('fails for insufficient balances', async () => {
        // Don't approve any tokens before depositing
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
      })
    })
  })

  describe('Checking balances', () => {
    let transaction, result
    let amount = tokens(1)

    beforeEach(async () => {
      //Approve Token
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
      //Deposit Token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
    })

    it('returns user balances', async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })
  })
})