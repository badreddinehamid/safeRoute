/**
 * Hook for managing Ethereum wallet connection
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getNetworkByChainId, getAddNetworkParams, createCustomNetwork } from '../config/networks';
import type { NetworkConfig } from '../config/networks';

interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  network: NetworkConfig | null;
  currentChainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    account: null,
    provider: null,
    signer: null,
    network: null,
    currentChainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  /**
   * Check if MetaMask is installed
   */
  const checkMetaMask = useCallback(() => {
    if (typeof window.ethereum === 'undefined') {
      setState((prev) => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return false;
    }
    return true;
  }, []);

  /**
   * Connect to MetaMask wallet
   */
  const connectWallet = useCallback(async () => {
    if (!checkMetaMask() || !window.ethereum) return;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      if (!window.ethereum) {
        throw new Error('Ethereum provider not available');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const networkConfig = getNetworkByChainId(chainId);

      // If network is not in our config, create a custom one
      // This allows support for any network, including local ones
      const finalNetwork = networkConfig || createCustomNetwork(
        chainId,
        `Chain ${chainId}`,
        '', // RPC URL not available for unknown networks
        '', // Contract address needs to be set manually
      );

      setState({
        account: accounts[0],
        provider,
        signer,
        network: finalNetwork,
        currentChainId: chainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, [checkMetaMask]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setState({
      account: null,
      provider: null,
      signer: null,
      network: null,
      currentChainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  /**
   * Add a network to MetaMask
   */
  const addNetwork = useCallback(async (network: NetworkConfig) => {
    if (!checkMetaMask() || !window.ethereum) return;

    try {
      const params = getAddNetworkParams(network);
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params],
      });

      // After adding, switch to the network
      await switchNetwork(network.chainId, network);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to add network to MetaMask',
      }));
    }
  }, [checkMetaMask]);

  /**
   * Switch to a different network
   * Automatically adds the network if it doesn't exist in MetaMask
   */
  const switchNetwork = useCallback(async (targetChainId: number, networkConfig?: NetworkConfig) => {
    if (!checkMetaMask() || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });

      // Refresh connection after network switch
      await connectWallet();
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        // Try to add the network if we have its config
        if (networkConfig) {
          try {
            await addNetwork(networkConfig);
          } catch (addError: any) {
            setState((prev) => ({
              ...prev,
              error: addError.message || 'Failed to add network to MetaMask',
            }));
          }
        } else {
          setState((prev) => ({
            ...prev,
            error: `Network with Chain ID ${targetChainId} not found in MetaMask. Please add it manually or select a configured network.`,
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: switchError.message || 'Failed to switch network',
        }));
      }
    }
  }, [checkMetaMask, connectWallet, addNetwork]);

  /**
   * Initialize wallet connection on mount
   */
  useEffect(() => {
    if (!checkMetaMask() || !window.ethereum) return;

    // Check if already connected
    const initWallet = async () => {
      if (!window.ethereum) return;
      
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        // Silent fail on init
      }
    };

    initWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    // Listen for network changes
    const handleChainChanged = () => {
      connectWallet();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [checkMetaMask, connectWallet, disconnectWallet]);

  /**
   * Update contract address for current network (useful for unknown networks)
   */
  const updateContractAddress = useCallback((contractAddress: string) => {
    setState((prev) => {
      if (prev.network) {
        return {
          ...prev,
          network: {
            ...prev.network,
            contractAddress,
          },
        };
      }
      return prev;
    });
  }, []);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    updateContractAddress,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

