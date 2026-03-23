import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivities, createActivity, updateActivity, deleteActivity, getLeadActivities } from '../api/activities';
import { toast } from 'react-toastify';

export const useActivities = (params = {}) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => getActivities(params).then(r => r.data),
    keepPreviousData: true,
  });
};

export const useLeadActivities = (leadId) => {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: () => getLeadActivities(leadId).then(r => r.data),
    enabled: Boolean(leadId),
  });
};

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      qc.invalidateQueries(['activities']);
      qc.invalidateQueries(['lead-activities']);
      qc.invalidateQueries(['dashboard']);
      toast.success('Activity logged successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to log activity'),
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      qc.invalidateQueries(['activities']);
      toast.success('Activity deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete activity'),
  });
};
