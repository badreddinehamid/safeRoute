# Contract Address Setup Guide

## Quick Setup Steps

1. **Deploy your contract to Ganache:**
   - Make sure Ganache is running on `http://127.0.0.1:7545`
   - Deploy your `TrajectoryValidation` contract
   - Copy the deployed contract address (it will look like `0x1234...5678`)

2. **Update the contract address in the code:**
   - Open the file: `src/config/networks.ts`
   - Find the `ganache` configuration (around line 17-24)
   - Replace this line:
     ```typescript
     contractAddress: '0x0000000000000000000000000000000000000000', // Replace with your deployed contract address
     ```
   - With your actual contract address:
     ```typescript
     contractAddress: '0xYourActualContractAddressHere', // Your deployed contract address
     ```

3. **Save and refresh:**
   - Save the file
   - Refresh your browser
   - The contract address should now appear correctly

## Example

If your deployed contract address is `0x5FbDB2315678afecb367f032d93F642f64180aa3`, your configuration should look like:

```typescript
ganache: {
  chainId: 1337,
  name: 'Ganache Local',
  rpcUrl: 'http://127.0.0.1:7545',
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Your actual address
  currencySymbol: 'ETH',
  isLocal: true,
},
```

## Alternative: Set Address Manually in UI

If you don't want to edit the code file, you can also:
1. Connect your wallet
2. Go to the Wallet Connection panel
3. Click "Set Manually" next to Contract Address
4. Enter your contract address
5. Click "Update Address"

Note: This is temporary and will reset when you refresh the page. To make it permanent, update the config file.

