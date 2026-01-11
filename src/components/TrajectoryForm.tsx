/**
 * Form component for submitting new trajectories
 * Using Material-UI components
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Box,
  Stack,
  Divider,
} from '@mui/material';
import {
  Send,
  EditLocation,
  Keyboard,
  CheckCircle,
} from '@mui/icons-material';

interface TrajectoryFormProps {
  onSubmit: (
    carId: string,
    startTime: number,
    endTime: number,
    path: Array<{ latitude: number; longitude: number }>
  ) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  drawnPath?: Array<{ latitude: number; longitude: number }>;
  onPathDrawn: (path: Array<{ latitude: number; longitude: number }>) => void;
  setDrawingMode: (enabled: boolean) => void;
}

export default function TrajectoryForm({
  onSubmit,
  isSubmitting,
  submitError,
  drawnPath: externalDrawnPath = [],
  onPathDrawn,
  setDrawingMode,
}: TrajectoryFormProps) {
  const [carId, setCarId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [manualCoordinates, setManualCoordinates] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);

  const drawnPath = externalDrawnPath;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!carId.trim()) {
      return;
    }

    const carIdNum = parseInt(carId.trim(), 10);
    if (isNaN(carIdNum) || carIdNum < 0) {
      return;
    }

    const startTimestamp = new Date(startTime).getTime();
    const endTimestamp = new Date(endTime).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return;
    }

    if (startTimestamp >= endTimestamp) {
      return;
    }

    let path: Array<{ latitude: number; longitude: number }> = [];

    if (useManualInput) {
      try {
        const coords = manualCoordinates
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            const [lat, lng] = line.split(',').map((s) => parseFloat(s.trim()));
            if (isNaN(lat) || isNaN(lng)) {
              throw new Error(`Invalid coordinate: ${line}`);
            }
            return { latitude: lat, longitude: lng };
          });

        if (coords.length === 0) {
          return;
        }

        path = coords;
      } catch (error: any) {
        return;
      }
    } else {
      if (drawnPath.length === 0) {
        return;
      }
      path = drawnPath;
    }

    await onSubmit(carId, startTimestamp, endTimestamp, path);

    setCarId('');
    setStartTime('');
    setEndTime('');
    setManualCoordinates('');
    setDrawingMode(false);
    onPathDrawn([]);
  };

  return (
    <Card sx={{ overflow: 'visible' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <EditLocation color="primary" sx={{ fontSize: 18 }} />
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Submit Trajectory
          </Typography>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0.5, fontSize: '0.75rem' }}>
            <Typography variant="caption">{submitError}</Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={1.5}>
            <TextField
              label="Car ID"
              type="number"
              value={carId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCarId(e.target.value)}
              required
              fullWidth
              size="small"
              inputProps={{ min: 0, step: 1 }}
              helperText="Positive number"
              placeholder="e.g., 1, 2, 3..."
            />

            <TextField
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <Divider sx={{ my: 0.5 }} />

            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ fontSize: '0.75rem', mb: 0.5 }}>Path Input</FormLabel>
              <RadioGroup
                value={useManualInput ? 'manual' : 'draw'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const isManual = e.target.value === 'manual';
                  setUseManualInput(isManual);
                  setDrawingMode(!isManual);
                }}
                row
                sx={{ gap: 1 }}
              >
                <FormControlLabel
                  value="draw"
                  control={<Radio size="small" />}
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EditLocation sx={{ fontSize: 16 }} />
                      <Typography variant="caption">Draw</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="manual"
                  control={<Radio size="small" />}
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Keyboard sx={{ fontSize: 16 }} />
                      <Typography variant="caption">Manual</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {!useManualInput ? (
              <Box
                sx={{
                  p: 1,
                  bgcolor: 'info.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'info.main',
                }}
              >
                {drawnPath.length > 0 ? (
                  <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CheckCircle color="success" sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        <strong>{drawnPath.length}</strong> points
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        onPathDrawn([]);
                        setDrawingMode(true);
                      }}
                      sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                    >
                      Clear
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Click "Draw" then click on map
                  </Typography>
                )}
              </Box>
            ) : (
              <TextField
                label="Coordinates"
                multiline
                rows={3}
                value={manualCoordinates}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualCoordinates(e.target.value)}
                fullWidth
                size="small"
                placeholder="40.7128,-74.0060&#10;40.7130,-74.0058"
                helperText="lat,lon"
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem', '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              color="info"
              fullWidth
              size="small"
              disabled={isSubmitting}
              startIcon={<Send sx={{ fontSize: 16 }} />}
              sx={{ py: 0.75, mt: 0.5 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
