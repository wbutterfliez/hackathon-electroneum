import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const EtherApp = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const newSigner = newProvider.getSigner();
      setSigner(newSigner);
      const address = await newSigner.getAddress();
      setWalletAddress(address);

      const balance = await newProvider.getBalance(address);
      setEthBalance(ethers.utils.formatEther(balance));
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const sendTransaction = async () => {
    if (signer && recipient && amount) {
      try {
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.utils.parseEther(amount),
        });
        console.log("Transaction Sent:", tx);
        setRecipient("");
        setAmount("");
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
      const newSigner = newProvider.getSigner();
      setSigner(newSigner);
      newSigner.getAddress().then(setWalletAddress);
    }
  }, []);

  return (
    <div>
      <h1>Ethereum Wallet</h1>
      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <p>ETH Balance: {ethBalance} ETH</p>
          <div>
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="text"
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={sendTransaction}>Send ETH</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtherApp;
