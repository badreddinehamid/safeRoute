/**
 * TypeScript types for the TrajectoryValidation smart contract
 */

export interface TrajectoryMeta {
  carId: bigint;
  startSlot: bigint;
  endSlot: bigint;
  pathLength: bigint;
}

export interface TrajectoryCoordinate {
  latitude: bigint;
  longitude: bigint;
}

export interface Trajectory {
  index: number;
  meta: TrajectoryMeta;
  coordinates: TrajectoryCoordinate[];
  accepted?: boolean; // Determined from events
}

export interface TrajectorySubmittedEvent {
  carId: bigint;
  accepted: boolean;
  startSlot: bigint;
  endSlot: bigint;
  blockNumber?: number;
  transactionHash?: string;
}

/**
 * Contract ABI interface
 * This matches your deployed TrajectoryValidation contract
 */
export const TRAJECTORY_VALIDATION_ABI = [
  // Read functions
  'function getTrajectoryCount() view returns (uint256)',
  'function getTrajectoryMeta(uint256 index) view returns (uint256 carId, uint256 startSlot, uint256 endSlot, uint256 pathLength)',
  'function getTrajectoryCoordinate(uint256 trajIndex, uint256 coordIndex) view returns (int256 latitude, int256 longitude)',
  'function COLLISION_DISTANCE() view returns (uint256)',
  'function TIME_SLOT() view returns (uint256)',
  
  // Write functions
  'function submitTrajectory(uint256 carId, uint256 startTime, uint256 endTime, tuple(int256 latitude, int256 longitude)[] path) returns (bool)',
  
  // Events
  'event TrajectorySubmitted(uint256 indexed carId, bool accepted, uint256 startSlot, uint256 endSlot)',
] as const;

