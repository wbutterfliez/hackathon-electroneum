"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { blockchainService } from '@/services/blockchain';

// Define interfaces for our data types
interface Transaction {
  from: string;
  to: string;
  value: string;
  hash: string;
  date?: string;
}

interface PriceData {
  date: string;
  price: number;
}

interface WalletData {
  address: string;
  balance: number;
  lastUpdated: string;
  transactions: Transaction[];
  priceHistory: PriceData[];
}

const ETNDashboard: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData>({
    address: '',
    balance: 0,
    lastUpdated: new Date().toLocaleString(),
    transactions: [],
    priceHistory: []
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isConnected && walletData.address) {
      loadWalletData();
    }
  }, [isConnected, walletData.address]);

  const connectWallet = async () => {
    try {
      const address = await blockchainService.connectWallet();
      setWalletData(prev => ({ ...prev, address }));
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const loadWalletData = async () => {
    try {
      const [balance, transactions, priceHistory] = await Promise.all([
        blockchainService.getBalance(walletData.address),
        blockchainService.getTransactions(walletData.address),
        blockchainService.getPriceHistory()
      ]);

      setWalletData(prev => ({
        ...prev,
        balance,
        transactions,
        priceHistory,
        lastUpdated: new Date().toLocaleString()
      }));
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const totalSent = walletData.transactions
    .filter(tx => tx.from === walletData.address)
    .reduce((acc, tx) => acc + parseFloat(tx.value || '0'), 0);

  const totalReceived = walletData.transactions
    .filter(tx => tx.to === walletData.address)
    .reduce((acc, tx) => acc + parseFloat(tx.value || '0'), 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {!isConnected ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <button 
              onClick={connectWallet}
              className="text-blue-500 hover:text-blue-700"
            >
              Connect your Electroneum wallet
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Wallet Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{walletData.balance.toFixed(2)} ETN</div>
                <div className="text-sm text-gray-500">Last updated: {walletData.lastUpdated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Total Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent.toFixed(2)} ETN</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4" />
                  Total Received
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReceived.toFixed(2)} ETN</div>
              </CardContent>
            </Card>
          </div>

          {/* Price Chart */}
          {typeof window !== 'undefined' && (
            <Card>
              <CardHeader>
                <CardTitle>ETN Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart
                    width={800}
                    height={250}
                    data={walletData.priceHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                  </LineChart>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-right p-2">Amount (ETN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.transactions.map((tx, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{tx.date || 'N/A'}</td>
                        <td className="p-2 capitalize">
                          {tx.from === walletData.address ? 'sent' : 'received'}
                        </td>
                        <td className="p-2 text-right">{parseFloat(tx.value).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ETNDashboard;