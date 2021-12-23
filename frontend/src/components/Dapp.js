import React, { useState } from 'react'
import styled from 'styled-components'

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from 'ethers'

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import contractAddress from '../contracts/contract-address.json'

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from './NoWalletDetected'
import { ConnectWallet } from './ConnectWallet'
import { Loading } from './Loading'
import { Transfer } from './Transfer'
import { TransactionErrorMessage } from './TransactionErrorMessage'
import { WaitingForTransactionMessage } from './WaitingForTransactionMessage'
import { NoTokensMessage } from './NoTokensMessage'

import { getInput } from "../helpers/GetInput";
import { calculateProof, buildContractCallArgs } from "../helpers/ProofHelper";

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337'
const GOERLI_NETWORK_ID = '5'

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001

const Title = styled.h2``

export class Dapp extends React.Component {
  constructor(props) {
    super(props)

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      forceRefresh: 0,
    }

    this.state = this.initialState
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      )
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    // if (!this.state.tokenData || !this.state.balance) {
    //   return <Loading />
    // }

    const proofs = JSON.parse(window.localStorage.getItem('proofs'))
    const usedProofs = JSON.parse(window.localStorage.getItem('usedProofs'))
    console.log(usedProofs)
    // const usedProofs = JSON.parse(jsonUsedProofs)

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        Hello: {this.state.selectedAddress}
        <button
          onClick={() =>
            this._handleProve(() =>
              this.setState({ forceRefresh: this.forceRefresh + 1 })
            )
          }
        >
          Create Proof
        </button>
        <Title>Proofs:</Title>
        {proofs?.map((proof, index) => (
          <div>
            Proof {proof.address} {index} -{' '}
            <button
              onClick={() =>
                this._handleVerify(index, this.selectedAddress, proof, () =>
                  this.setState({ forceRefresh: this.forceRefresh + 1 })
                )
              }
            >
              Mint NFT
            </button>
          </div>
        ))}
        <Title>Used proofs:</Title>
        {usedProofs?.map((proof, index) => (
          <div>Proof - {proof.address}</div>
        ))}
      </div>
    )
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData()
  }

  async _handleProve(forceRefresh) {
    // ethers signMessage
    // get publicKey and generate chunked pub key
    // generate nullifier from signed message
    console.log('Calculate Proof')

    const input = await getInput(this._provider.getSigner(0))
    console.log(input);

    const proof = await calculateProof(input);
    console.log(proof);

    const merkleRoot = 1234
    const nullifier = 10
    const contractArgs = buildContractCallArgs(proof, merkleRoot, nullifier)
    console.log(contractArgs)

    const address = '123' // change this to address of currently connected Ethereum account

    // save proof to localStorage
    const storedProofs = window.localStorage.getItem('proofs')
    const currentProofs = storedProofs ? JSON.parse(storedProofs) : []
    window.localStorage.setItem(
      'proofs',
      JSON.stringify([
        ...currentProofs,
        contractArgs
      ])
    )
    forceRefresh()
  }

  async _handleVerify(index, account, proof, forceRefresh) {
    // take proof and call smart contract
    const proofs = JSON.parse(window.localStorage.getItem('proofs'))

    window.localStorage.setItem(
      'proofs',
      JSON.stringify(proofs.filter((item) => item.address === account))
    )

    // call smart contract with this proof
    // the item is the smart contract argument, can pass into the smart contract

    // if successful move proof to usedProofs
    const storedProofs = window.localStorage.getItem('usedProofs')
    const usedProofs = storedProofs ? JSON.parse(storedProofs) : []
    window.localStorage.setItem(
      'usedProofs',
      JSON.stringify([...usedProofs, proof])
    )

    forceRefresh()
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable()

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return
    }

    this._initialize(selectedAddress)

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on('accountsChanged', ([newAddress]) => {
      this._stopPollingData()
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState()
      }

      this._initialize(newAddress)
    })

    // We reset the dapp state if the network is changed
    window.ethereum.on('networkChanged', ([networkId]) => {
      this._stopPollingData()
      this._resetState()
    })
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    })

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers()
    // this._getTokenData()
    // this._startPollingData()
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum)
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000)

    // We run it once immediately so we don't have to wait for it
    this._updateBalance()
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval)
    this._pollDataInterval = undefined
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  // async _getTokenData() {
  //   const name = await this._token.name()
  //   const symbol = await this._token.symbol()

  //   this.setState({ tokenData: { name, symbol } })
  // }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress)
    this.setState({ balance })
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError()

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount)
      this.setState({ txBeingSent: tx.hash })

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait()

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error('Transaction failed')
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await this._updateBalance()
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error)
      this.setState({ transactionError: error })
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined })
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined })
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined })
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message
    }

    return error.message
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState)
  }

  // This method checks if Metamask selected network is Localhost:8545 or goerli
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID || window.ethereum.networkVersion === GOERLI_NETWORK_ID) {
      return true
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545 or goerli',
    })

    return false
  }
}
