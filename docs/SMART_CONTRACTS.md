# Thundra Smart Contracts - Ethereum Sepolia Testnet

## Deployed Token Contracts

| Token | Contract Address | Network |
|-------|-----------------|---------|
| THDR | `0xb1c3338aBD99BCb7ca0F5f8dBAD4666B2bD9953c` | Sepolia |
| USDT | `0xcd51edf2881de8ebb8a4ddb8f44860b818b78b48` | Sepolia |

## Treasury Wallet (1B THDR + 100M USDT)

| Wallet | Address | Purpose |
|--------|---------|---------|
| Treasury | `0x38bc74e79b6e7d66b594124a6ccc92cef0974404` | Rewards, staking yields, burn & earn payouts |
| Burn | `0x000000000000000000000000000000000000dEaD` | Permanent token burn address |

## Architecture

### On-Chain Operations (All via Treasury Wallet)
- **Rewards**: Treasury sends THDR directly to user wallets on Sepolia
- **Burns**: Treasury transfers tokens to dead address (0x...dEaD)
- **Staking**: User transfers to treasury; treasury returns principal + yield on unstake
- **Burn & Earn**: User burns to dead address; treasury pays original + yield at maturity
- **Transfers**: User-to-user via their own wallet keys (treasury funds gas)
- **Conversions**: User sends to treasury, treasury sends back converted token

### Wallet System
- BIP-39 12-word mnemonic wallets (MetaMask/TrustWallet compatible)
- Gasless UX: Treasury auto-funds ETH for gas when user balance < 0.001 ETH
- Private keys derived from mnemonic stored server-side (encrypted in production)

### APY Rates
| Type | 30 Days | 90 Days | 180 Days | 365 Days |
|------|---------|---------|----------|----------|
| Stake | 5% | 8% | 12% | 15% |
| Burn & Earn | 20% | 28% | 35% | 40% |

## AMM Liquidity Pool Contract (To Deploy)

Deploy this contract on Sepolia using Remix IDE (https://remix.ethereum.org):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ThundraAMM is Ownable, ReentrancyGuard {
    IERC20 public immutable thdr;
    IERC20 public immutable usdt;
    
    uint256 public reserveTHDR;
    uint256 public reserveUSDT;
    uint256 public constant FEE_RATE = 3; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    address public burnWallet;
    address public growthPoolWallet;
    
    event Swap(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);
    event AddLiquidity(address indexed provider, uint256 thdrAmount, uint256 usdtAmount);
    event Burn(address indexed from, uint256 amount);
    
    constructor(
        address _thdr,
        address _usdt,
        address _burnWallet,
        address _growthPoolWallet
    ) Ownable(msg.sender) {
        thdr = IERC20(_thdr);
        usdt = IERC20(_usdt);
        burnWallet = _burnWallet;
        growthPoolWallet = _growthPoolWallet;
    }
    
    function addLiquidity(uint256 thdrAmount, uint256 usdtAmount) external onlyOwner nonReentrant {
        require(thdrAmount > 0 && usdtAmount > 0, "Invalid amounts");
        thdr.transferFrom(msg.sender, address(this), thdrAmount);
        usdt.transferFrom(msg.sender, address(this), usdtAmount);
        reserveTHDR += thdrAmount;
        reserveUSDT += usdtAmount;
        emit AddLiquidity(msg.sender, thdrAmount, usdtAmount);
    }
    
    function swapTHDRforUSDT(uint256 thdrIn) external nonReentrant returns (uint256 usdtOut) {
        require(thdrIn > 0, "Invalid input");
        uint256 fee = (thdrIn * FEE_RATE) / FEE_DENOMINATOR;
        uint256 thdrInAfterFee = thdrIn - fee;
        usdtOut = (thdrInAfterFee * reserveUSDT) / (reserveTHDR + thdrInAfterFee);
        require(usdtOut > 0 && usdtOut < reserveUSDT, "Insufficient liquidity");
        thdr.transferFrom(msg.sender, address(this), thdrIn);
        usdt.transfer(msg.sender, usdtOut);
        thdr.transfer(burnWallet, fee);
        reserveTHDR += thdrInAfterFee;
        reserveUSDT -= usdtOut;
        emit Swap(msg.sender, address(thdr), thdrIn, usdtOut);
        emit Burn(msg.sender, fee);
    }
    
    function swapUSDTforTHDR(uint256 usdtIn) external nonReentrant returns (uint256 thdrOut) {
        require(usdtIn > 0, "Invalid input");
        uint256 fee = (usdtIn * FEE_RATE) / FEE_DENOMINATOR;
        uint256 usdtInAfterFee = usdtIn - fee;
        thdrOut = (usdtInAfterFee * reserveTHDR) / (reserveUSDT + usdtInAfterFee);
        require(thdrOut > 0 && thdrOut < reserveTHDR, "Insufficient liquidity");
        usdt.transferFrom(msg.sender, address(this), usdtIn);
        thdr.transfer(msg.sender, thdrOut);
        reserveUSDT += usdtInAfterFee;
        reserveTHDR -= thdrOut;
        emit Swap(msg.sender, address(usdt), usdtIn, thdrOut);
    }
    
    function getPrice() external view returns (uint256) {
        if (reserveTHDR == 0) return 0;
        return (reserveUSDT * 1e18) / reserveTHDR;
    }
    
    function getReserves() external view returns (uint256, uint256) {
        return (reserveTHDR, reserveUSDT);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
```

### Deployment Steps (Remix IDE)
1. Go to https://remix.ethereum.org
2. Create new file → paste the AMM code above
3. Compiler tab → Select `0.8.20` → Enable optimization → Compile
4. Deploy tab → Environment: "Injected Provider - MetaMask" (Sepolia network)
5. Constructor args: `(THDR_address, USDT_address, 0x000...dEaD, treasury_address)`
6. Click Deploy → Confirm in MetaMask
7. Share the deployed AMM contract address

## Burn Vault

Using the standard Ethereum dead address: `0x000000000000000000000000000000000000dEaD`

Tokens sent to this address are permanently irretrievable.

## Backend Integration

The Edge Function at `supabase/functions/blockchain/index.ts` uses **ethers.js v6** to:
- Generate BIP-39 mnemonic wallets
- Transfer ERC-20 tokens (THDR/USDT) on Sepolia
- Send rewards from treasury to user wallets
- Burn tokens by transferring to dead address
- Manage staking positions (stake/unstake with yield)
- Manage burn & earn positions (burn/claim with yield)
- Auto-fund gas for users from treasury
- Sync on-chain balances to database

System wallet private key is stored as secret `SYSTEM_WALLET_PRIVATE_KEY`.

## Explorer Links

- Token Explorer: https://sepolia.etherscan.io/token/{contract_address}
- Transaction: https://sepolia.etherscan.io/tx/{tx_hash}
- Address: https://sepolia.etherscan.io/address/{address}
