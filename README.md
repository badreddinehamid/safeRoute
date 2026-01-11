# 🛡️ SafeRoute

**Secure Blockchain Trajectory Validation for Autonomous Vehicles**

A modern React + TypeScript frontend for validating and visualizing vehicle trajectories on the Ethereum blockchain.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.18.0-007FFF?logo=mui)](https://mui.com/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.9.0-3C3C3D?logo=ethereum)](https://ethers.org/)

---

## ✨ Features

- 🔗 **Wallet Integration** - Connect MetaMask or other Ethereum wallets
- 🌐 **Multi-Network Support** - Works with Ganache, Hardhat, testnets, and mainnets
- 🗺️ **Interactive Map** - Draw trajectories on a Leaflet map or input coordinates manually
- ⚡ **Real-Time Updates** - Instant notifications when trajectories are validated
- 📊 **Trajectory Visualization** - View all validated trajectories with detailed metadata

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Ganache (for local development) or access to an Ethereum network
- Deployed `TrajectoryValidation` smart contract

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/safeRoute.git
cd safeRoute

# Install dependencies
npm install

# Configure contract address in src/config/networks.ts
# Update the contractAddress for your network

# Start development server
npm run dev
```

### Configuration

1. **Start Ganache** on port 7545 (or update RPC URL in `src/config/networks.ts`)
2. **Deploy your contract** and copy the contract address
3. **Update `src/config/networks.ts`**:
   ```typescript
   ganache: {
     chainId: 1337,
     name: 'Ganache Local',
     rpcUrl: 'http://127.0.0.1:7545',
     contractAddress: '0xYourDeployedContractAddress', // Update this
     currencySymbol: 'ETH',
     isLocal: true,
   },
   ```
4. **Import a Ganache account** to MetaMask
5. **Open** `http://localhost:5173` and connect your wallet

---

## 📖 Usage

### Submitting a Trajectory

1. **Connect your wallet** via the header button
2. **Choose input method**:
   - **Draw**: Click "Draw" then click on the map to create a path
   - **Manual**: Click "Manual" and enter coordinates (one per line: `latitude,longitude`)
3. **Fill in the form**:
   - Car ID (positive number)
   - Start Time and End Time
4. **Click Submit** - You'll receive a notification when validated

### Viewing Trajectories

- **Map**: All accepted trajectories are displayed with colored lines
- **List**: Scroll through trajectories on the right to see metadata

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Material-UI** - Component library
- **Ethers.js v6** - Ethereum interaction
- **Leaflet** - Map visualization

---

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

**Your Name** - [@badreddinehamid](https://github.com/badreddinehamid)

---

<div align="center">

⭐ Star this repo if you find it helpful!

</div>
