import { useState, useEffect, useCallback } from 'react';
import apiClient from './axiosConfig';

export const useBackgroundJob = () => {
  const [activeJobs, setActiveJobs] = useState(new Map());
  const [jobResults, setJobResults] = useState(new Map());

  // Fungsi untuk menambahkan job baru
  const addJob = useCallback((jobId, type, description) => {
    setActiveJobs(prev => new Map(prev).set(jobId, {
      id: jobId,
      type,
      description,
      status: 'waiting',
      progress: 0,
      startTime: Date.now()
    }));
  }, []);

  // Fungsi untuk update status job
  const updateJobStatus = useCallback((jobId, status, progress = 0, result = null, error = null) => {
    setActiveJobs(prev => {
      const newMap = new Map(prev);
      const job = newMap.get(jobId);
      if (job) {
        newMap.set(jobId, {
          ...job,
          status,
          progress,
          result,
          error,
          endTime: status === 'completed' || status === 'failed' ? Date.now() : job.endTime
        });
      }
      return newMap;
    });

    // Simpan hasil job
    if (result) {
      setJobResults(prev => new Map(prev).set(jobId, result));
    }
  }, []);

  // Fungsi untuk menghapus job
  const removeJob = useCallback((jobId) => {
    setActiveJobs(prev => {
      const newMap = new Map(prev);
      newMap.delete(jobId);
      return newMap;
    });
  }, []);

  // Fungsi untuk mengecek status job dari server
  const checkJobStatus = useCallback(async (jobId) => {
    try {
      const response = await apiClient.get(`/background/job-status/${jobId}`);
      const { status, progress, result, failedReason } = response.data.data;
      
      updateJobStatus(jobId, status, progress, result, failedReason);
      
      return { status, progress, result, failedReason };
    } catch (error) {
      console.error('Error checking job status:', error);
      updateJobStatus(jobId, 'error', 0, null, error.message);
      return { status: 'error', error: error.message };
    }
  }, [updateJobStatus]);

  // Fungsi untuk polling status job
  const pollJobStatus = useCallback((jobId, interval = 2000) => {
    const poll = async () => {
      const { status } = await checkJobStatus(jobId);
      
      if (status === 'completed' || status === 'failed' || status === 'error') {
        return; // Stop polling
      }
      
      // Continue polling
      setTimeout(() => poll(), interval);
    };
    
    poll();
  }, [checkJobStatus]);

  // Fungsi untuk submit data ke background queue
  const submitToBackground = useCallback(async (endpoint, data, type, description) => {
    try {
      const response = await apiClient.post(`${endpoint}`, data);
      
      if (response.data.success) {
        const jobId = response.data.jobId;
        addJob(jobId, type, description);
        
        // Mulai polling untuk status job
        pollJobStatus(jobId);
        
        return {
          success: true,
          jobId,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Gagal menambahkan ke antrian');
      }
    } catch (error) {
      console.error('Error submitting to background:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }, [addJob, pollJobStatus]);

  // Cleanup jobs yang sudah selesai setelah 5 menit
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActiveJobs(prev => {
        const newMap = new Map(prev);
        for (const [jobId, job] of newMap.entries()) {
          if ((job.status === 'completed' || job.status === 'failed' || job.status === 'error') && 
              job.endTime && (now - job.endTime) > 5 * 60 * 1000) {
            newMap.delete(jobId);
          }
        }
        return newMap;
      });
    }, 60000); // Check setiap menit

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    activeJobs: Array.from(activeJobs.values()),
    jobResults,
    addJob,
    updateJobStatus,
    removeJob,
    checkJobStatus,
    pollJobStatus,
    submitToBackground
  };
}; 