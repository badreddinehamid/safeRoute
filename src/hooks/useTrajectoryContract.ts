/**
 * Hook for interacting with the TrajectoryValidation smart contract
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract } from 'ethers';
import {
  getContract,
  fetchAllTrajectories,
  formatPathForContract,
  timestampToSeconds,
  verifyContract,
  verifyContractFunctions,
} from '../utils/contract';
import type { Trajectory, TrajectorySubmittedEvent } from '../types/contract';

interface UseTrajectoryContractState {
  trajectories: Trajectory[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  submitError: string | null;
}

export function useTrajectoryContract(
  contractAddress: string | null,
  signer: any
) {
  const [state, setState] = useState<UseTrajectoryContractState>({
    trajectories: [],
    isLoading: false,
    error: null,
    isSubmitting: false,
    submitError: null,
  });

  const contractRef = useRef<Contract | null>(null);
  const eventListenerRef = useRef<((event: TrajectorySubmittedEvent) => void) | null>(null);

  /**
   * Initialize contract instance and verify it's valid
   */
  useEffect(() => {
    if (!contractAddress || !signer) {
      contractRef.current = null;
      setState((prev) => ({
        ...prev,
        error: contractAddress ? null : 'Contract address not configured',
      }));
      return;
    }

    const initializeContract = async () => {
      try {
        // Get provider from signer
        const provider = signer.provider || (signer as any).provider;
        if (!provider) {
          setState((prev) => ({
            ...prev,
            error: 'Provider not available',
          }));
          return;
        }

        // Verify contract is deployed
        const verification = await verifyContract(contractAddress, provider);
        if (!verification.isValid) {
          setState((prev) => ({
            ...prev,
            error: verification.error || 'Contract verification failed',
          }));
          contractRef.current = null;
          return;
        }

        // Create contract instance
        const contract = getContract(contractAddress, signer);

        // Verify contract has required functions
        const functionsCheck = await verifyContractFunctions(contract);
        if (!functionsCheck.isValid) {
          setState((prev) => ({
            ...prev,
            error: functionsCheck.error || 'Contract functions verification failed',
          }));
          contractRef.current = null;
          return;
        }

        contractRef.current = contract;
        setState((prev) => ({
          ...prev,
          error: null,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to initialize contract',
        }));
        contractRef.current = null;
      }
    };

    initializeContract();
  }, [contractAddress, signer]);

  /**
   * Load all trajectories from contract
   */
  const loadTrajectories = useCallback(async () => {
    if (!contractRef.current) {
      setState((prev) => ({
        ...prev,
        error: 'Contract not initialized. Please check the contract address.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const trajectories = await fetchAllTrajectories(contractRef.current);
      setState((prev) => ({
        ...prev,
        trajectories,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      let errorMessage = error.message || 'Failed to load trajectories';
      
      // Provide more specific error messages
      if (errorMessage.includes('could not decode') || errorMessage.includes('BAD_DATA')) {
        errorMessage = `Contract call failed. Please verify:\n` +
          `1. The contract is deployed at: ${contractAddress}\n` +
          `2. The contract address in src/config/networks.ts is correct\n` +
          `3. The contract ABI matches your deployed contract`;
      }
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [contractAddress]);

  /**
   * Submit a new trajectory
   */
  const submitTrajectory = useCallback(
    async (
      carId: string | number,
      startTime: number,
      endTime: number,
      path: Array<{ latitude: number; longitude: number }>
    ) => {
      if (!contractRef.current) {
        setState((prev) => ({
          ...prev,
          submitError: 'Contract not initialized',
        }));
        return;
      }

      if (path.length === 0) {
        setState((prev) => ({
          ...prev,
          submitError: 'Path cannot be empty',
        }));
        return;
      }

      if (startTime >= endTime) {
        setState((prev) => ({
          ...prev,
          submitError: 'Start time must be before end time',
        }));
        return;
      }

      // Convert carId to uint256 (bigint)
      let carIdBigInt: bigint;
      if (typeof carId === 'string') {
        const parsed = parseInt(carId, 10);
        if (isNaN(parsed) || parsed < 0) {
          setState((prev) => ({
            ...prev,
            submitError: 'Car ID must be a valid positive number',
          }));
          return;
        }
        carIdBigInt = BigInt(parsed);
      } else {
        carIdBigInt = BigInt(carId);
      }

      setState((prev) => ({ ...prev, isSubmitting: true, submitError: null }));

      try {
        const formattedPath = formatPathForContract(path);
        const startTimeSeconds = timestampToSeconds(startTime);
        const endTimeSeconds = timestampToSeconds(endTime);

        const tx = await contractRef.current.submitTrajectory(
          carIdBigInt,
          startTimeSeconds,
          endTimeSeconds,
          formattedPath
        );

        // Wait for transaction to be mined
        await tx.wait();

        // Reload trajectories after successful submission
        await loadTrajectories();

        setState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          submitError: error.message || 'Failed to submit trajectory',
        }));
      }
    },
    [loadTrajectories]
  );

  /**
   * Set up event listener for TrajectorySubmitted events
   */
  const setupEventListener = useCallback(
    (onEvent: (event: TrajectorySubmittedEvent) => void) => {
      if (!contractRef.current) return;

      // Store the callback
      eventListenerRef.current = onEvent;

      // Set up event listener
      const contract = contractRef.current;
      contract.on('TrajectorySubmitted', (carId: bigint, accepted: boolean, startSlot: bigint, endSlot: bigint, event: any) => {
        const trajectoryEvent: TrajectorySubmittedEvent = {
          carId,
          accepted,
          startSlot,
          endSlot,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };

        onEvent(trajectoryEvent);

        // Reload trajectories to get the latest state
        loadTrajectories();
      });

      // Return cleanup function
      return () => {
        contract.removeAllListeners('TrajectorySubmitted');
      };
    },
    [loadTrajectories]
  );

  /**
   * Clean up event listeners on unmount
   */
  useEffect(() => {
    return () => {
      if (contractRef.current) {
        contractRef.current.removeAllListeners('TrajectorySubmitted');
      }
    };
  }, []);

  return {
    ...state,
    loadTrajectories,
    submitTrajectory,
    setupEventListener,
  };
}

