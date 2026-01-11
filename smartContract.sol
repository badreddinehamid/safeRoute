// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrajectoryValidation {

    /* ===================== CONSTANTS ===================== */

    uint public constant COLLISION_DISTANCE = 7; // units in your coordinate system
    uint public constant TIME_SLOT = 1;           // seconds per slot

    /* ===================== EVENTS ===================== */

    event TrajectorySubmitted(
        uint indexed carId,
        bool accepted,
        uint startSlot,
        uint endSlot
    );

    /* ===================== STRUCTS ===================== */

    struct Coordinate {
        int latitude;
        int longitude;
    }

    struct Trajectory {
        uint carId;
        uint startSlot;
        uint endSlot;
        Coordinate[] path;
    }

    /* ===================== STORAGE ===================== */

    Trajectory[] private validatedTrajectories;

    /* ===================== MAIN FUNCTION ===================== */

    function submitTrajectory(
        uint carId,
        uint startTime,
        uint endTime,
        Coordinate[] calldata path
    ) external returns (bool) {

        require(path.length > 0, "Empty path");

        uint startSlot = startTime / TIME_SLOT;
        uint endSlot = endTime / TIME_SLOT;
        require(endSlot > startSlot, "Invalid time window");

        // Collision check
        if (isCollision(startSlot, endSlot, path)) {
            emit TrajectorySubmitted(carId, false, startSlot, endSlot);
            return false;
        }

        // Store trajectory
        validatedTrajectories.push();
        Trajectory storage stored =
            validatedTrajectories[validatedTrajectories.length - 1];

        stored.carId = carId;
        stored.startSlot = startSlot;
        stored.endSlot = endSlot;

        for (uint i = 0; i < path.length; i++) {
            stored.path.push(path[i]);
        }

        emit TrajectorySubmitted(carId, true, startSlot, endSlot);
        return true;
    }

    /* ===================== COLLISION LOGIC ===================== */

    function isCollision(
        uint newStart,
        uint newEnd,
        Coordinate[] calldata newPath
    ) internal view returns (bool) {

        for (uint i = 0; i < validatedTrajectories.length; i++) {
            Trajectory storage existing = validatedTrajectories[i];

            // Time overlap check
            if (newStart < existing.endSlot && existing.startSlot < newEnd) {

                // Spatial check (sampled to save gas)
                for (uint m = 0; m < newPath.length; m += 2) {
                    for (uint n = 0; n < existing.path.length; n += 2) {

                        if (
                            distance(newPath[m], existing.path[n])
                                <= COLLISION_DISTANCE
                        ) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /* ===================== MATH ===================== */

    function distance(
        Coordinate memory a,
        Coordinate memory b
    ) internal pure returns (uint) {

        int dx = a.latitude - b.latitude;
        int dy = a.longitude - b.longitude;

        return sqrt(uint(dx * dx + dy * dy));
    }

    function sqrt(uint x) internal pure returns (uint y) {
        if (x == 0) return 0;
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /* ===================== VIEW HELPERS ===================== */

    function getTrajectoryCount() external view returns (uint) {
        return validatedTrajectories.length;
    }

    function getTrajectoryMeta(uint index)
        external
        view
        returns (uint carId, uint startSlot, uint endSlot, uint pathLength)
    {
        require(index < validatedTrajectories.length, "Index out of bounds");
        Trajectory storage t = validatedTrajectories[index];
        return (t.carId, t.startSlot, t.endSlot, t.path.length);
    }

    function getTrajectoryCoordinate(
        uint trajIndex,
        uint coordIndex
    ) external view returns (int latitude, int longitude) {

        require(trajIndex < validatedTrajectories.length, "Invalid trajectory");
        Trajectory storage t = validatedTrajectories[trajIndex];

        require(coordIndex < t.path.length, "Invalid coordinate");
        Coordinate storage c = t.path[coordIndex];

        return (c.latitude, c.longitude);
    }
}
