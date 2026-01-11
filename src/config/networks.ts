/**
 * Network configuration mapping Ethereum networks to contract addresses
 * Update these addresses with your deployed contract addresses for each network
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  contractAddress: string;
  blockExplorer?: string;
  currencySymbol?: string;
  isLocal?: boolean; // Flag to identify local networks
}

export const NETWORKS: Record<string, NetworkConfig> = {
  // Local Networks - Ganache (Primary)
  ganache: {
    chainId: 1337,
    name: 'Ganache Local',
    rpcUrl: 'http://127.0.0.1:7545',
    contractAddress: '0xAc846a5c3f552791F2Bf574aC2418A4014B06A79', // Deployed contract address
    currencySymbol: 'ETH',
    isLocal: true,
  },
  hardhat: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your contract address
    currencySymbol: 'ETH',
    isLocal: true,
  },
  // Ethereum Mainnet
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your contract address
    blockExplorer: 'https://etherscan.io',
    currencySymbol: 'ETH',
  },
  // Goerli Testnet
  goerli: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key or use public RPC
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your contract address
    blockExplorer: 'https://goerli.etherscan.io',
    currencySymbol: 'ETH',
  },
  // Sepolia Testnet
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your contract address
    blockExplorer: 'https://sepolia.etherscan.io',
    currencySymbol: 'ETH',
  },
  // Polygon Mainnet
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your contract address
    blockExplorer: 'https://polygonscan.com',
    currencySymbol: 'MATIC',
  },
  // Polygon Mumbai Testnet
  mumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your contract address
    blockExplorer: 'https://mumbai.polygonscan.com',
    currencySymbol: 'MATIC',
  },
};

/**
 * Get network configuration by chain ID
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
}

/**
 * Get network configuration by name
 */
export function getNetworkByName(name: string): NetworkConfig | undefined {
  return NETWORKS[name.toLowerCase()];
}

/**
 * Get MetaMask network parameters for adding a network
 */
export function getAddNetworkParams(network: NetworkConfig) {
  return {
    chainId: `0x${network.chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: {
      name: network.currencySymbol || 'ETH',
      symbol: network.currencySymbol || 'ETH',
      decimals: 18,
    },
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : [],
  };
}

/**
 * Create a custom network config for unknown networks
 */
export function createCustomNetwork(
  chainId: number,
  name: string,
  rpcUrl: string,
  contractAddress: string,
  blockExplorer?: string
): NetworkConfig {
  return {
    chainId,
    name,
    rpcUrl,
    contractAddress,
    blockExplorer,
    currencySymbol: 'ETH',
    isLocal: rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1'),
  };
}

/**
 * Get the default network (Ganache for local development)
 */
export function getDefaultNetwork(): NetworkConfig {
  return NETWORKS.ganache;
}

/**
 * Check if Ganache is running by attempting to connect
 */
export async function checkGanacheConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:7545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

