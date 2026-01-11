/**
 * Component for displaying a list of all trajectories
 * Using Material-UI components
 */

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  LocationOn,
  AccessTime,
  Route,
  Timeline,
} from '@mui/icons-material';
import type { Trajectory } from '../types/contract';

interface TrajectoryListProps {
  trajectories: Trajectory[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function TrajectoryList({
  trajectories,
  isLoading,
  onRefresh,
}: TrajectoryListProps) {

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} sx={{ flexShrink: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Trajectories
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh sx={{ fontSize: 16 }} />}
            onClick={onRefresh}
            disabled={isLoading}
            size="small"
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>

        {isLoading && trajectories.length === 0 ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : trajectories.length === 0 ? (
          <Alert severity="info">No trajectories found</Alert>
        ) : (
          <Stack spacing={3}>
            {/* Summary Statistics - Compact */}
            <Paper
              elevation={2}
              sx={{
                p: 1,
                background: 'linear-gradient(135deg, #0A2540 0%, #1F4F7A 100%)',
                color: 'white',
                borderRadius: 1.5,
                mb: 1,
                flexShrink: 0,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CheckCircle sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight="medium" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                    Total Validated
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {trajectories.length}
                </Typography>
              </Box>
            </Paper>

            {/* Trajectories List - Scrollable */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pr: 0.5, minHeight: 0 }}>
              <Stack spacing={2}>
                {trajectories
                  .filter((trajectory) => trajectory.accepted !== false)
                  .sort((a, b) => b.index - a.index)
                  .map((trajectory) => (
                    <Paper
                      key={trajectory.index}
                      elevation={2}
                      sx={{
                        p: 1.5,
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%)',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '3px',
                          height: '100%',
                          background: 'linear-gradient(180deg, #00A6FF 0%, #0A2540 100%)',
                        },
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0A2540 0%, #00A6FF 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                              }}
                            >
                              #{trajectory.index}
                            </Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                              Trajectory #{trajectory.index}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOn fontSize="small" color="primary" sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight="medium">
                              Car ID: <Box component="span" color="primary.main" fontWeight="bold">{Number(trajectory.meta.carId)}</Box>
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Validated"
                          color="success"
                          size="small"
                          icon={<CheckCircle sx={{ fontSize: 14 }} />}
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 24,
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 1, borderColor: 'primary.light', opacity: 0.3 }} />

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: 'rgba(10, 37, 64, 0.05)',
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'rgba(10, 37, 64, 0.1)',
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <AccessTime fontSize="small" color="primary" sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
                                Start
                              </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="bold" color="primary" sx={{ fontSize: '0.7rem' }}>
                              {new Date(Number(trajectory.meta.startSlot) * 1000).toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: 'rgba(10, 37, 64, 0.05)',
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'rgba(10, 37, 64, 0.1)',
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <AccessTime fontSize="small" color="primary" sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
                                End
                              </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="bold" color="primary" sx={{ fontSize: '0.7rem' }}>
                              {new Date(Number(trajectory.meta.endSlot) * 1000).toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: 'rgba(0, 166, 255, 0.05)',
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'rgba(0, 166, 255, 0.2)',
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <Route fontSize="small" sx={{ color: '#00A6FF', fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
                                Points
                              </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: '#00A6FF', fontSize: '0.7rem' }}>
                              {Number(trajectory.meta.pathLength)}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: 'rgba(40, 167, 69, 0.05)',
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'rgba(40, 167, 69, 0.2)',
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <Timeline fontSize="small" color="success" sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
                                Duration
                              </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ fontSize: '0.7rem' }}>
                              {Number(trajectory.meta.endSlot - trajectory.meta.startSlot)}s
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                    </Paper>
                  ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
