/**
 * Main App component for SafeRoute
 * Using Material-UI components - Single page layout without scrolling
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Grid,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Security,
} from '@mui/icons-material';
import { useWallet } from './hooks/useWallet';
import { useTrajectoryContract } from './hooks/useTrajectoryContract';
import WalletConnectionCompact from './components/WalletConnectionCompact';
import TrajectoryMap from './components/TrajectoryMap';
import TrajectoryForm from './components/TrajectoryForm';
import TrajectoryList from './components/TrajectoryList';
import type { Trajectory, TrajectorySubmittedEvent } from './types/contract';

function App() {
  const { network, isConnected, signer } = useWallet();
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnPath, setDrawnPath] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [trajectoriesWithStatus, setTrajectoriesWithStatus] = useState<Trajectory[]>([]);
  const [recentEvent, setRecentEvent] = useState<TrajectorySubmittedEvent | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const contractAddress = network?.contractAddress || null;

  const {
    trajectories,
    isLoading,
    error,
    isSubmitting,
    submitError,
    loadTrajectories,
    submitTrajectory,
    setupEventListener,
  } = useTrajectoryContract(contractAddress, signer);

  /**
   * Filter trajectories - only show accepted ones (rejected are not stored)
   */
  useEffect(() => {
    const acceptedTrajectories = trajectories.filter(
      (traj) => traj.accepted !== false
    );
    setTrajectoriesWithStatus(acceptedTrajectories);
  }, [trajectories]);

  /**
   * Load trajectories when contract is available
   */
  useEffect(() => {
    if (contractAddress && signer) {
      loadTrajectories();
    }
  }, [contractAddress, signer, loadTrajectories]);

  /**
   * Set up event listener for real-time updates
   */
  useEffect(() => {
    if (!contractAddress || !signer) return;

    const cleanup = setupEventListener((event: TrajectorySubmittedEvent) => {
      setRecentEvent(event);
      setSnackbarOpen(true);
      
      const timeout = event.accepted ? 5000 : 8000;
      setTimeout(() => {
        setRecentEvent(null);
        setSnackbarOpen(false);
      }, timeout);

      if (event.accepted) {
        setTimeout(() => {
          loadTrajectories();
        }, 2000);
      }
    });

    return cleanup;
  }, [contractAddress, signer, setupEventListener, loadTrajectories]);

  const handlePathDrawn = useCallback((path: Array<{ latitude: number; longitude: number }>) => {
    setDrawnPath(path);
    setDrawingMode(false);
  }, []);

  const handleSubmit = useCallback(
    async (
      carId: string,
      startTime: number,
      endTime: number,
      path: Array<{ latitude: number; longitude: number }>
    ) => {
      await submitTrajectory(carId, startTime, endTime, path);
      setDrawnPath([]);
    },
    [submitTrajectory]
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main', flexShrink: 0 }}>
        <Toolbar sx={{ minHeight: '56px !important', py: 1 }}>
          <Security sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            SafeRoute
          </Typography>
          <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, mr: 2 }}>
            Secure Blockchain Trajectory Validation
          </Typography>
          <WalletConnectionCompact />
        </Toolbar>
      </AppBar>

      {/* Main Content - No scrolling, fits in viewport */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!isConnected ? (
          <Container maxWidth="md" sx={{ py: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Alert severity="warning" sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Connect Your Wallet
              </Typography>
              <Typography variant="body2">
                Please connect your Ethereum wallet (MetaMask) to interact with the Trajectory Validation smart contract.
              </Typography>
            </Alert>
          </Container>
        ) : (
          <Container maxWidth={false} sx={{ height: '100%', py: 1, px: 2 }}>
            {/* Real-time Event Notification Snackbar */}
            <Snackbar
              open={snackbarOpen && recentEvent !== null}
              autoHideDuration={recentEvent?.accepted ? 5000 : 8000}
              onClose={() => {
                setSnackbarOpen(false);
                setRecentEvent(null);
              }}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert
                severity={recentEvent?.accepted ? 'success' : 'error'}
                onClose={() => {
                  setSnackbarOpen(false);
                  setRecentEvent(null);
                }}
                icon={recentEvent?.accepted ? <CheckCircle /> : <Cancel />}
                sx={{ minWidth: '400px' }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {recentEvent?.accepted ? 'Trajectory Accepted' : 'Trajectory Rejected'}
                </Typography>
                <Typography variant="body2">
                  Car ID: <strong>{recentEvent && Number(recentEvent.carId)}</strong>
                </Typography>
                {!recentEvent?.accepted && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    This trajectory was rejected by the validation system. Rejected trajectories are not stored in the contract.
                  </Typography>
                )}
              </Alert>
            </Snackbar>

            <Grid container spacing={1.5} sx={{ height: '100%' }}>
              {/* Left Column: Map */}
              <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Paper
                  elevation={2}
                  sx={{
                    height: '100%',
                    overflow: 'hidden',
                    borderRadius: 2,
                    flex: 1,
                  }}
                >
                  <TrajectoryMap
                    trajectories={trajectoriesWithStatus}
                    onPathDrawn={handlePathDrawn}
                    drawingMode={drawingMode}
                  />
                </Paper>
              </Grid>

              {/* Right Column: Form, Contract Status and Trajectory List */}
              <Grid item xs={12} md={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Form - Fixed height, no scroll, fits content */}
                <Box sx={{ flexShrink: 0 }}>
                  <TrajectoryForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    drawnPath={drawnPath}
                    onPathDrawn={handlePathDrawn}
                    setDrawingMode={setDrawingMode}
                  />
                </Box>
                
                {/* Contract Status - Compact, fixed */}
                {error && (
                  <Alert severity="error" sx={{ flexShrink: 0, maxHeight: 100, overflow: 'auto', fontSize: '0.75rem', py: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">
                      Contract Error
                    </Typography>
                    <Typography variant="caption" component="pre" sx={{ fontSize: '0.65rem', mt: 0.5 }}>
                      {error}
                    </Typography>
                  </Alert>
                )}

                {/* Trajectory List - Scrollable, takes remaining space */}
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <TrajectoryList
                    trajectories={trajectoriesWithStatus}
                    isLoading={isLoading}
                    onRefresh={loadTrajectories}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        )}
      </Box>
    </Box>
  );
}

export default App;
