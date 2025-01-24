"use client";

import Web3 from 'web3';
import { ethers } from 'ethers';

export class BlockchainService {
  private web3: Web3;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else {
      this.web3 = new Web3('http://localhost:8545'); // Replace with Electroneum node URL
    }
  }

  initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask or Web3 wallet is not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.web3.eth.getBalance(address);
      return parseFloat(this.web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getTransactions(address: string, limit = 10): Promise<any[]> {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      const transactions = [];

      for (let i = 0; i < limit; i++) {
        const block = await this.web3.eth.getBlock(blockNumber - i, true);
        if (block?.transactions) {
          const filteredTxs = block.transactions.filter(
            (tx: any) => tx.from === address || tx.to === address
          );
          transactions.push(...filteredTxs);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to fetch transactions. Please try again.');
    }
  }

  async getPriceHistory(): Promise<any[]> {
    try {
      const response = await fetch('https://api.example.com/price-history');
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting price history:', error);
      throw new Error('Unable to load price history. Please try again.');
    }
  }

  async sendETN(to: string, amount: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('No signer available');
      }

      const tx = {
        to,
        value: ethers.utils.parseEther(amount),
      };

      const gasEstimate = await this.provider?.estimateGas(tx);
      console.log(`Estimated gas: ${gasEstimate?.toString()}`);

      const transaction = await this.signer.sendTransaction(tx);
      return transaction.hash;
    } catch (error) {
      console.error('Error sending ETN:', error);
      throw new Error('Transaction failed. Please check your balance and try again.');
    }
  }
}

export const blockchainService = new BlockchainService();
