import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from 'ethers';

function App()  {
    const [walletAddress, setWalletAddress] = useState("");
    const [leaderboard, setLeaderboard] = useState([]);
    const [totalTransfers] = useState(0);
    const [setCurrentLeader] = useState('No Leader yet');
    const [endWinner, setEndWinner] = useState('No Winner yet');
    const [amount, setAmount] = useState('');
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
  
    useEffect(() => {
      // Function to initialize the provider and contract
      const initialize = async () => {
        try {
          // Connect to the Ethereum network using ethers.js
          const connectedProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(connectedProvider);
  
          // Create a contract instance
          const contractAddress = '0x8DA676Af64fC69eF2a8277a9af6c8fE9655B2FC9'; // Replace with your actual contract address
          const contractAbi =
        [
    {
      "inputs": [],
      "name": "startGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "addressTotalTransfers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGameEndTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLeaderboard",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "getTotalTransfers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getWinner",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "highestTransfer",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "leaderboard",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenContractAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalTransferred",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "winners",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
          const deployedContract = new ethers.Contract(contractAddress, contractAbi, connectedProvider.getSigner());
          setContract(deployedContract);
  
          // Update the leaderboard, current leader, and end winner
          await updateLeaderboard(deployedContract);
          await updateCurrentLeader(deployedContract);
          await updateEndWinner(deployedContract);
        } catch (error) {
          console.error('Error initializing provider and contract', error);
        }
      };
  
      // Check if the browser has Ethereum provider
      if (window.ethereum) {
        initialize();
      } else {
        console.error('Ethereum provider not found');
      }
    }, []);
  
    // Function to update the leaderboard
    const updateLeaderboard = async (contract) => {
      try {
        const leaderboardData = await contract.getLeaderboard();
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error updating leaderboard', error);
      }
    };
  
    // Function to update the current leader
    const updateCurrentLeader = async (contract) => {
      try {
        const currentLeader = await contract.currentLeader();
        setCurrentLeader(currentLeader);
      } catch (error) {
        console.error('Error updating current leader', error);
      }
    };
  
    // Function to update the end winner
    const updateEndWinner = async (contract) => {
      try {
        const endWinner = await contract.getWinner();
        setEndWinner(endWinner[0] || 'No Winner yet');
      } catch (error) {
        console.error('Error updating end winner', error);
      }
    };
  
    // Function to handle the burn form submission
    const handleBurnFormSubmit = async (event) => {
      event.preventDefault();
      try {
        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const amountToBurn = ethers.utils.parseUnits(amount, 0); // Convert to token's decimals
    
        // Burn tokens by calling the contract function
        const burnTransaction = await contractWithSigner.transferTokens(amountToBurn);
        await burnTransaction.wait();
    
        console.log(`Burn ${amount} tokens`);
        setAmount('');
        await updateLeaderboard(contractWithSigner);
        await updateCurrentLeader(contractWithSigner);
      } catch (error) {
        console.error('Error burning tokens', error);
      }
    };
    


  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* MetaMask is installed */
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  return ( 
    <div id="container">
            <div className="navbar-end is-align-items-center">
              <button id="button"
                className="button connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>   
      
      <h1>
        <img
          src="https://ponw.win/assets/images/new-logo-804x804.png"
          alt="Fire Icon"
          className="fire-icon"
        />{' '}
        Proof of No Work Burn Contest
      </h1>
      <h2>How It Works:</h2>
      <ol> 
        <li>Connect your wallet by clicking the orange "Connect Wallet" button</li>
        <li>Select the amount of PoNW tokens you'd like to burn (max 10 billion)</li>
        <li>Click the orange burn button & approve transaction to burn your tokens</li>
        <li>Climb the leaderboard by burning the most tokens until the contest is over</li>
        <li>Winner will receive upto 50 billion $PoNW from PoNWDev's distribution</li>
        <li>In the event of a tie, reward will be split evenly amongst the winners</li>
      </ol>
      
      <form id="burnForm" className="center-text"onSubmit={handleBurnFormSubmit}>
        <label>
          Amount: 
          <input
            type="number"
            min="0"
            max="10000000000"
            value= {amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <button type="submit">Burn</button>
        </label>
        
      </form>

      <p className="center-text">$PoNW You've Burned: {totalTransfers}</p>
      
      <h2>Leaderboard:</h2>
      <table>
        <thead>
        <tr class="leaderboard-header">
            <th>Wallet Address</th>
            <th>Tokens Burned</th>
            <th>Amount Burned</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td>{entry.walletAddress}</td>
              <td>{entry.tokensBurned}</td>
              <td>{entry.amountBurned}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2>Winner:</h2>
      <p className="center-text">{endWinner}</p>

    </div>
  );
}

export default App;
