import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Schedule,
  PlayArrow,
  ExpandMore,
  ExpandLess,
  Close,
  Refresh
} from '@mui/icons-material';
import { useBackgroundJob } from '../utils/backgroundJobHook';

const BackgroundJobStatus = () => {
  const { activeJobs, removeJob, checkJobStatus } = useBackgroundJob();
  const [expanded, setExpanded] = React.useState(false);

  if (activeJobs.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
      case 'error':
        return <Error color="error" />;
      case 'active':
        return <PlayArrow color="primary" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'active':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'failed':
        return 'Gagal';
      case 'error':
        return 'Error';
      case 'active':
        return 'Sedang Diproses';
      case 'waiting':
        return 'Menunggu';
      default:
        return status;
    }
  };

  const formatDuration = (startTime, endTime) => {
    const duration = endTime ? endTime - startTime : Date.now() - startTime;
    const seconds = Math.floor(duration / 1000);
    
    if (seconds < 60) {
      return `${seconds} detik`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} menit ${seconds % 60} detik`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} jam ${minutes} menit`;
    }
  };

  const handleRefresh = async (jobId) => {
    await checkJobStatus(jobId);
  };

  const completedJobs = activeJobs.filter(job => job.status === 'completed');
  const failedJobs = activeJobs.filter(job => job.status === 'failed' || job.status === 'error');
  const activeJobsList = activeJobs.filter(job => job.status === 'active' || job.status === 'waiting');

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 400,
        maxHeight: 500,
        zIndex: 1000,
        boxShadow: 3,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Status Pemrosesan
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                activeJobs.forEach(job => removeJob(job.id));
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {activeJobsList.length > 0 && (
            <Chip
              label={`${activeJobsList.length} Aktif`}
              color="primary"
              size="small"
            />
          )}
          {completedJobs.length > 0 && (
            <Chip
              label={`${completedJobs.length} Selesai`}
              color="success"
              size="small"
            />
          )}
          {failedJobs.length > 0 && (
            <Chip
              label={`${failedJobs.length} Gagal`}
              color="error"
              size="small"
            />
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <List dense>
            {activeJobs.map((job) => (
              <ListItem
                key={job.id}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 }
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(job.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap>
                        {job.description}
                      </Typography>
                      <Chip
                        label={getStatusText(job.status)}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {job.type} • {formatDuration(job.startTime, job.endTime)}
                      </Typography>
                      {job.status === 'active' && (
                        <LinearProgress
                          variant="determinate"
                          value={job.progress || 0}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {job.error && (
                        <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
                          {job.error}
                        </Alert>
                      )}
                      {job.result && (
                        <Alert severity="success" sx={{ mt: 1, fontSize: '0.75rem' }}>
                          {job.result.message || 'Berhasil diproses'}
                        </Alert>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRefresh(job.id)}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeJob(job.id)}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>

      {!expanded && activeJobs.length > 0 && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {activeJobsList.length > 0 && `${activeJobsList.length} sedang diproses`}
            {completedJobs.length > 0 && ` • ${completedJobs.length} selesai`}
            {failedJobs.length > 0 && ` • ${failedJobs.length} gagal`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default BackgroundJobStatus; 