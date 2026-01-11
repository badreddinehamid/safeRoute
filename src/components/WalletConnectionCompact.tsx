/**
 * Compact wallet connection component for header bar
 */

import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  IconButton,
  Tooltip,
  Popover,
} from '@mui/material';
import {
  AccountBalanceWallet,
  CheckCircle,
  Cancel,
  Warning,
  ContentCopy,
  ExpandMore,
} from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { NETWORKS, getNetworkByChainId } from '../config/networks';

export default function WalletConnectionCompact() {
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNetworkSwitch = (chainId: number) => {
    const networkConfig = getNetworkByChainId(chainId);
    switchNetwork(chainId, networkConfig);
    handleMenuClose();
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

  const isLocalNetwork = network?.isLocal || network?.rpcUrl?.includes('localhost') || network?.rpcUrl?.includes('127.0.0.1');
  const hasContractAddress = network?.contractAddress && network.contractAddress !== '0x0000000000000000000000000000000000000000';

  if (!isConnected) {
    return (
      <Button
        variant="contained"
        startIcon={<AccountBalanceWallet />}
        onClick={connectWallet}
        disabled={isConnecting}
        size="small"
        sx={{ ml: 2 }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ ml: 2 }}>
      {/* Account Info */}
      <Chip
        icon={<AccountBalanceWallet />}
        label={account ? formatAddress(account) : 'N/A'}
        color="secondary"
        onClick={handleMenuOpen}
        clickable
        sx={{ fontWeight: 'bold' }}
      />

      {/* Network Info */}
      <Chip
        label={network?.name || 'Unknown'}
        color={isLocalNetwork ? 'warning' : 'default'}
        size="small"
        onClick={handleMenuOpen}
        clickable
      />

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 300, maxWidth: 400, mt: 1 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Account
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontFamily="monospace">
              {account}
            </Typography>
            <Tooltip title="Copy">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(account || '')}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Network
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {network?.name} (Chain ID: {network?.chainId})
          </Typography>
          {network?.contractAddress && hasContractAddress && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary" display="block">
                Contract
              </Typography>
              <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                {network.contractAddress}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Switch Network
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {Object.values(NETWORKS)
              .filter((net) => net.isLocal)
              .map((net) => (
                <MenuItem
                  key={net.chainId}
                  onClick={() => handleNetworkSwitch(net.chainId)}
                  selected={network?.chainId === net.chainId}
                >
                  {net.name}
                </MenuItem>
              ))}
            {Object.values(NETWORKS)
              .filter((net) => !net.isLocal)
              .map((net) => (
                <MenuItem
                  key={net.chainId}
                  onClick={() => handleNetworkSwitch(net.chainId)}
                  selected={network?.chainId === net.chainId}
                >
                  {net.name}
                </MenuItem>
              ))}
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            size="small"
            onClick={() => {
              disconnectWallet();
              handleMenuClose();
            }}
            startIcon={<Cancel />}
          >
            Disconnect
          </Button>
        </Box>
      </Menu>
    </Box>
  );
}

