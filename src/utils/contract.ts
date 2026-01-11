/**
 * Utility functions for contract interactions
 */

import { Contract, ethers } from 'ethers';
import { TRAJECTORY_VALIDATION_ABI } from '../types/contract';
import type { TrajectoryMeta, TrajectoryCoordinate, Trajectory } from '../types/contract';

/**
 * Create a contract instance
 */
export function getContract(address: string, provider: ethers.Provider | ethers.Signer): Contract {
  return new Contract(address, TRAJECTORY_VALIDATION_ABI, provider);
}

/**
 * Scale coordinate from decimal degrees to contract format (multiply by 1e6 for precision)
 * Contract expects integers, so we scale coordinates
 */
export function scaleCoordinate(value: number): bigint {
  return BigInt(Math.round(value * 1e6));
}

/**
 * Unscale coordinate from contract format to decimal degrees
 */
export function unscaleCoordinate(value: bigint): number {
  return Number(value) / 1e6;
}

/**
 * Convert timestamp to seconds (contract expects seconds)
 */
export function timestampToSeconds(timestamp: number): bigint {
  // If timestamp is in milliseconds, convert to seconds
  if (timestamp > 1e12) {
    return BigInt(Math.floor(timestamp / 1000));
  }
  return BigInt(Math.floor(timestamp));
}

/**
 * Fetch trajectory metadata from contract
 */
export async function fetchTrajectoryMeta(
  contract: Contract,
  index: number
): Promise<TrajectoryMeta> {
  const result = await contract.getTrajectoryMeta(index);
  return {
    carId: result.carId,
    startSlot: result.startSlot,
    endSlot: result.endSlot,
    pathLength: result.pathLength,
  };
}

/**
 * Fetch trajectory coordinate from contract
 */
export async function fetchTrajectoryCoordinate(
  contract: Contract,
  trajIndex: number,
  coordIndex: number
): Promise<TrajectoryCoordinate> {
  const result = await contract.getTrajectoryCoordinate(trajIndex, coordIndex);
  return {
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/**
 * Verify contract is deployed and has code
 */
export async function verifyContract(
  address: string,
  provider: ethers.Provider
): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Check if address is valid
    if (!ethers.isAddress(address)) {
      return { isValid: false, error: 'Invalid contract address format' };
    }

    // Check if there's code at the address
    const code = await provider.getCode(address);
    if (!code || code === '0x') {
      return {
        isValid: false,
        error: 'No contract code found at this address. Make sure the contract is deployed.',
      };
    }

    return { isValid: true };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Failed to verify contract',
    };
  }
}

/**
 * Verify contract has the required functions
 */
export async function verifyContractFunctions(contract: Contract): Promise<{
  isValid: boolean;
  error?: string;
  missingFunctions?: string[];
}> {
  const requiredFunctions = [
    'getTrajectoryCount',
    'getTrajectoryMeta',
    'getTrajectoryCoordinate',
    'submitTrajectory',
  ];

  const missingFunctions: string[] = [];

  for (const funcName of requiredFunctions) {
    try {
      // Try to get the function fragment
      const func = contract.interface.getFunction(funcName);
      if (!func) {
        missingFunctions.push(funcName);
      }
    } catch {
      missingFunctions.push(funcName);
    }
  }

  if (missingFunctions.length > 0) {
    return {
      isValid: false,
      error: `Contract is missing required functions: ${missingFunctions.join(', ')}`,
      missingFunctions,
    };
  }

  return { isValid: true };
}

/**
 * Fetch all trajectories from contract
 */
export async function fetchAllTrajectories(contract: Contract): Promise<Trajectory[]> {
  try {
    const count = await contract.getTrajectoryCount();
    const trajectoryCount = Number(count);
    
    const trajectories: Trajectory[] = [];
    
    for (let i = 0; i < trajectoryCount; i++) {
      const meta = await fetchTrajectoryMeta(contract, i);
      const pathLength = Number(meta.pathLength);
      
      const coordinates: TrajectoryCoordinate[] = [];
      for (let j = 0; j < pathLength; j++) {
        const coord = await fetchTrajectoryCoordinate(contract, i, j);
        coordinates.push(coord);
      }
      
      trajectories.push({
        index: i,
        meta,
        coordinates,
      });
    }
    
    return trajectories;
  } catch (error: any) {
    // Provide more helpful error messages
    if (error.code === 'BAD_DATA' || error.message?.includes('could not decode')) {
      throw new Error(
        'Failed to call contract function. This usually means:\n' +
        '1. The contract address is incorrect\n' +
        '2. The contract is not deployed at this address\n' +
        '3. The contract ABI does not match the deployed contract\n' +
        `Original error: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Format path for contract submission
 */
export function formatPathForContract(
  coordinates: Array<{ latitude: number; longitude: number }>
): Array<{ latitude: bigint; longitude: bigint }> {
  return coordinates.map((coord) => ({
    latitude: scaleCoordinate(coord.latitude),
    longitude: scaleCoordinate(coord.longitude),
  }));
}

