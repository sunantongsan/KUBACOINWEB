
import { ethers } from 'ethers';
import { BNB_MAINNET, BNB_TESTNET, ERC20_ABI, STANDARD_TOKEN_BYTECODE, FEE_WALLETS, PLATFORM_FEES, ROUTER_ABI } from '../types';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    // We do NOT initialize provider here anymore to avoid race conditions
    // where window.ethereum is not yet injected by the extension.
  }

  async connectWallet(): Promise<{ address: string; chainId: number } | null> {
    // 1. Check specifically at the moment of click
    if (typeof window.ethereum === 'undefined') {
      alert("Metamask is not detected! Please install it or refresh the page.");
      return null;
    }

    try {
      // 2. Initialize provider FRESH every time we connect
      // This fixes issues where the provider might be stale
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // 3. Request Access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      
      return { address, chainId: Number(network.chainId) };
    } catch (error: any) {
      console.error("Connection failed", error);
      // Handle user rejection specifically
      if (error.code === 4001) {
        alert("Connection rejected by user.");
      } else {
        alert("Failed to connect wallet. Please check Metamask.");
      }
      return null;
    }
  }

  async switchNetwork(isTestnet: boolean): Promise<boolean> {
    if (!window.ethereum) return false;
    
    // Ensure provider is ready
    if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
    }

    const config = isTestnet ? BNB_TESTNET : BNB_MAINNET;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }],
      });
      // Refresh provider after network switch
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          });
          return true;
        } catch (addError) {
          console.error(addError);
          return false;
        }
      }
      console.error(switchError);
      return false;
    }
  }

  async getBNBBalance(address: string): Promise<string> {
    if (!window.ethereum) return "0";
    if (!this.provider) this.provider = new ethers.BrowserProvider(window.ethereum);
    
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Get BNB Balance Error:", error);
      return "0";
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!window.ethereum) return "0";
    if (!this.provider) this.provider = new ethers.BrowserProvider(window.ethereum);
    
    try {
      if (!ethers.isAddress(tokenAddress)) return "0";
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      
      // Attempt to get decimals, default to 18 if fails
      let decimals = 18;
      try {
        decimals = await contract.decimals();
      } catch {}
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Get Token Balance Error:", error);
      return "0";
    }
  }

  async deployToken(
    name: string, 
    symbol: string, 
    initialSupply: string, 
    renounceOwnership: boolean, 
    verifyContract: boolean
  ): Promise<string | null> {
    // Ensure fresh connection
    const wallet = await this.connectWallet();
    if (!wallet || !this.signer) throw new Error("Wallet not connected");

    try {
      const serviceFee = ethers.parseEther(PLATFORM_FEES.TOKEN_CREATION_BNB); 
      const adminWallet = FEE_WALLETS.BNB;

      // 1. FEE PAYMENT (Real transaction)
      console.log("Processing Service Fee...");
      const feeTx = await this.signer.sendTransaction({
        to: adminWallet,
        value: serviceFee
      });
      await feeTx.wait(); // Wait for fee to be confirmed
      
      // 2. DEPLOY CONTRACT (Real Contract Factory)
      console.log("Deploying Token Contract...");
      // Validate Bytecode integrity simply
      if (!STANDARD_TOKEN_BYTECODE || (STANDARD_TOKEN_BYTECODE as string) === "0x") {
          throw new Error("Invalid Contract Bytecode. Please contact support.");
      }

      const factory = new ethers.ContractFactory(ERC20_ABI, STANDARD_TOKEN_BYTECODE, this.signer);
      
      // Parse supply to Wei (assuming 18 decimals)
      const supplyWei = ethers.parseUnits(initialSupply, 18); 
      
      const contract = await factory.deploy(name, symbol, supplyWei);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log("Token Deployed at:", address);
      
      return address;

    } catch (error: any) {
      console.error("Deployment Real Error:", error);
      throw error; 
    }
  }
  
  async swapBNBForTokens(amountIn: string, tokenAddress: string, isTestnet: boolean): Promise<string | null> {
    const wallet = await this.connectWallet();
    if (!wallet || !this.signer) throw new Error("Wallet not connected");

    try {
      const config = isTestnet ? BNB_TESTNET : BNB_MAINNET;
      const routerAddress = config.pancakeRouter;
      const wbnbAddress = config.wbnb;

      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, this.signer);
      const amountInWei = ethers.parseEther(amountIn);
      const path = [wbnbAddress, tokenAddress];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins
      const amountOutMin = 0; // Slippage 100% for test

      console.log(`Swapping ${amountIn} BNB via Router: ${routerAddress}`);

      const tx = await routerContract.swapExactETHForTokens(
        amountOutMin,
        path,
        await this.signer.getAddress(),
        deadline,
        { value: amountInWei }
      );

      console.log("Swap Tx Sent:", tx.hash);
      await tx.wait(); 
      return tx.hash;

    } catch (error) {
      console.error("Swap Failed:", error);
      throw error;
    }
  }

  async approveToken(tokenAddress: string, amount: string, isTestnet: boolean): Promise<string | null> {
    const wallet = await this.connectWallet();
    if (!wallet || !this.signer) throw new Error("Wallet not connected");

    try {
       const config = isTestnet ? BNB_TESTNET : BNB_MAINNET;
       const routerAddress = config.pancakeRouter;
       
       const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
       const amountWei = ethers.MaxUint256; // Max approve
       
       console.log(`Approving ${tokenAddress} for Router...`);
       const tx = await tokenContract.approve(routerAddress, amountWei);
       await tx.wait();
       return tx.hash;
    } catch (error) {
       console.error("Approve Failed:", error);
       throw error;
    }
  }

  async addLiquidity(tokenAddress: string, tokenAmount: string, bnbAmount: string, isTestnet: boolean): Promise<string | null> {
    const wallet = await this.connectWallet();
    if (!wallet || !this.signer) throw new Error("Wallet not connected");

    try {
      const config = isTestnet ? BNB_TESTNET : BNB_MAINNET;
      const routerAddress = config.pancakeRouter;
      
      const tokenAmountWei = ethers.parseUnits(tokenAmount, 18); // Assume 18 decimals
      const bnbAmountWei = ethers.parseEther(bnbAmount);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, this.signer);
      
      console.log("Adding Liquidity...");
      const tx = await routerContract.addLiquidityETH(
          tokenAddress,
          tokenAmountWei,
          0, // Slippage 100% allowed for ease of use in V1
          0, 
          await this.signer.getAddress(),
          deadline,
          { value: bnbAmountWei }
      );
      await tx.wait();
      return tx.hash;

    } catch (error) {
      console.error("Add Liquidity Failed:", error);
      throw error;
    }
  }

  async createLaunchpad(tokenAddress: string, hardCap: string): Promise<string | null> {
    const wallet = await this.connectWallet();
    if (!wallet || !this.signer) throw new Error("Wallet not connected");
    
    try {
      const serviceFee = ethers.parseEther(PLATFORM_FEES.LAUNCHPAD_CREATION_BNB); 
      const adminWallet = FEE_WALLETS.BNB;
      
      console.log("Paying Launchpad Fee...");
      const tx = await this.signer.sendTransaction({
        to: adminWallet,
        value: serviceFee
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Launchpad Creation Failed:", error);
      throw error;
    }
  }
}
