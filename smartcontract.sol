pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PoNWBurnContest {
    address private constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    IERC20 private tokenContract;
    address public tokenContractAddress = 0x518957cCaF4cdF8ef3C38C2eB051663EfAC70545;
    mapping(address => uint256) public addressTotalTransfers;
    address[] public winners;
    uint256[] public leaderboard;
    uint256 public highestTransfer;
    uint256 public totalTransferred;
    uint256 private startTime;
    uint256 private constant GAME_DURATION = 12 hours; // Game duration: 12 hours
    uint256 private constant MAX_TRANSFER = 10_000_000_000; // Maximum transfer limit: 10 billion tokens
    
    constructor() {
        tokenContract = IERC20(tokenContractAddress);
    }
    
    modifier onlyAfterGameEnd() {
        require(startTime != 0, "Game not started.");
        require(block.timestamp >= startTime + GAME_DURATION, "Game still in progress.");
        _;
    }
    
    function startGame() external {
        require(startTime == 0, "Game already started.");
        startTime = block.timestamp;
    }
    
    function transferTokens(uint256 amount) external {
        require(startTime != 0, "Game not started yet.");
        require(block.timestamp < startTime + GAME_DURATION, "Game has ended.");
        require(amount <= MAX_TRANSFER, "Amount exceeds maximum allowed.");
        require(totalTransferred + amount <= MAX_TRANSFER, "Total transfers exceed maximum limit.");
        require(tokenContract.transferFrom(msg.sender, DEAD_ADDRESS, amount), "Token transfer failed.");
        
        addressTotalTransfers[msg.sender] += amount;
        totalTransferred += amount;
        
        if (amount > highestTransfer) {
            highestTransfer = amount;
            winners = [msg.sender];
        } else if (amount == highestTransfer) {
            winners.push(msg.sender);
        }
        
        updateLeaderboard(msg.sender);
    }
    
    function updateLeaderboard(address player) internal {
        uint256 playerTotalTransfers = addressTotalTransfers[player];
        
        if (leaderboard.length == 0 || leaderboard.length < 10 || playerTotalTransfers >= leaderboard[leaderboard.length - 1]) {
            // Find the correct index to insert the player's total transfers
            uint256 index = 0;
            while (index < leaderboard.length && playerTotalTransfers < leaderboard[index]) {
                index++;
            }
            
            // Insert the player's total transfers at the correct index
            leaderboard.push(0);
            for (uint256 i = leaderboard.length - 1; i > index; i--) {
                leaderboard[i] = leaderboard[i - 1];
            }
            leaderboard[index] = playerTotalTransfers;
            
            // Remove the last entry if the leaderboard exceeds the desired length
            if (leaderboard.length > 10) {
                leaderboard.pop();
            }
        }
    }
    
    function getGameEndTime() public view returns (uint256) {
        if (startTime == 0) {
            return 0;
        }
        return startTime + GAME_DURATION;
    }
    
    function getWinner() public view onlyAfterGameEnd returns (address[] memory) {
        return winners;
    }
    
    function getLeaderboard() public view returns (uint256[] memory) {
        return leaderboard;
    }
    
    function getTotalTransfers(address wallet) public view returns (uint256) {
        return addressTotalTransfers[wallet];
    }
}
