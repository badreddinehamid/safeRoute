/**
 * Component for connecting and managing Ethereum wallet
 * Using Material-UI components
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Box,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  CheckCircle,
  Cancel,
  Warning,
  ContentCopy,
} from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { NETWORKS, getNetworkByChainId } from '../config/networks';

export default function WalletConnection() {
  const {
    account,
    network,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    updateContractAddress,
  } = useWallet();

  const [showManualAddress, setShowManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleNetworkSwitch = (chainId: number) => {
    const networkConfig = getNetworkByChainId(chainId);
    switchNetwork(chainId, networkConfig);
  };

  const handleAddNetwork = (chainId: number) => {
    const networkConfig = getNetworkByChainId(chainId);
    if (networkConfig) {
      addNetwork(networkConfig);
    }
  };

  const handleUpdateContractAddress = () => {
    if (manualAddress.trim()) {
      updateContractAddress(manualAddress.trim());
      setShowManualAddress(false);
      setManualAddress('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isNetworkConfigured = network && NETWORKS[Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === network.chainId) || ''] !== undefined;
  const isLocalNetwork = network?.isLocal || network?.rpcUrl?.includes('localhost') || network?.rpcUrl?.includes('127.0.0.1');
  const hasContractAddress = network?.contractAddress && network.contractAddress !== '0x0000000000000000000000000000000000000000';

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <AccountBalanceWallet color="primary" />
          <Typography variant="h5" fontWeight="bold" color="primary">
            Wallet Connection
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isConnected ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={connectWallet}
            disabled={isConnecting}
            startIcon={<AccountBalanceWallet />}
            sx={{ py: 1.5 }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <Stack spacing={3}>
            {/* Account Info */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Connected Account
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
                  {account ? formatAddress(account) : 'N/A'}
                </Typography>
                {account && (
                  <Tooltip title="Copy address">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(account)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Divider />

            {/* Network Info */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  Network
                </Typography>
                <Box display="flex" gap={1}>
                  {isLocalNetwork && (
                    <Chip
                      label="Local"
                      color="warning"
                      size="small"
                      icon={<Warning />}
                    />
                  )}
                  {!isNetworkConfigured && (
                    <Chip
                      label="Unknown"
                      color="error"
                      size="small"
                      icon={<Cancel />}
                    />
                  )}
                  {isNetworkConfigured && !isLocalNetwork && (
                    <Chip
                      label="Configured"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                    />
                  )}
                </Box>
              </Box>
              <Typography variant="body1" fontWeight="bold">
                {network?.name || 'Unknown Network'}
              </Typography>
              {network && (
                <Typography variant="caption" color="text.secondary">
                  Chain ID: {network.chainId}
                </Typography>
              )}
            </Box>

            {/* Contract Address */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  Contract Address
                </Typography>
                {!hasContractAddress && (
                  <Button
                    size="small"
                    onClick={() => setShowManualAddress(!showManualAddress)}
                    color="info"
                  >
                    {showManualAddress ? 'Cancel' : 'Set Manually'}
                  </Button>
                )}
              </Box>
              {showManualAddress ? (
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={manualAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualAddress(e.target.value)}
                    placeholder="0x..."
                    sx={{ fontFamily: 'monospace' }}
                  />
                  <Button
                    variant="contained"
                    color="info"
                    fullWidth
                    onClick={handleUpdateContractAddress}
                    disabled={!manualAddress.trim()}
                  >
                    Update Address
                  </Button>
                </Stack>
              ) : (
                <Box>
                  {hasContractAddress ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{
                          wordBreak: 'break-all',
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          flex: 1,
                        }}
                      >
                        {network.contractAddress}
                      </Typography>
                      <Tooltip title="Copy address">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(network.contractAddress)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Not configured. Click "Set Manually" to add.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Divider />

            {/* Network Switch */}
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Switch Network</InputLabel>
                <Select
                  value={network?.chainId || ''}
                  onChange={(e: any) => handleNetworkSwitch(Number(e.target.value))}
                  label="Switch Network"
                >
                  {Object.values(NETWORKS)
                    .filter((net) => net.isLocal)
                    .map((net) => (
                      <MenuItem key={net.chainId} value={net.chainId}>
                        {net.name === 'Ganache Local' ? '⭐ ' : ''}{net.name} (Chain ID: {net.chainId})
                      </MenuItem>
                    ))}
                  {Object.values(NETWORKS)
                    .filter((net) => !net.isLocal && net.chainId !== 1 && net.chainId !== 137)
                    .map((net) => (
                      <MenuItem key={net.chainId} value={net.chainId}>
                        {net.name}
                      </MenuItem>
                    ))}
                  {Object.values(NETWORKS)
                    .filter((net) => !net.isLocal && (net.chainId === 1 || net.chainId === 137))
                    .map((net) => (
                      <MenuItem key={net.chainId} value={net.chainId}>
                        {net.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {network && !isNetworkConfigured && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  sx={{ mt: 1 }}
                  onClick={() => handleAddNetwork(network.chainId)}
                >
                  Add Network to MetaMask
                </Button>
              )}
              {network?.chainId === 1337 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                    Ganache Setup:
                  </Typography>
                  <Typography variant="caption" component="div">
                    <Box component="span" display="block">1. Make sure Ganache is running on http://127.0.0.1:7545</Box>
                    <Box component="span" display="block">2. Import a Ganache account into MetaMask</Box>
                    <Box component="span" display="block">3. Update the contract address in the config after deploying</Box>
                  </Typography>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Disconnect */}
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={disconnectWallet}
              startIcon={<Cancel />}
            >
              Disconnect Wallet
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
