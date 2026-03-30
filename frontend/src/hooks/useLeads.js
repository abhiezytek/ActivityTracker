import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../api/leads';
import { toast } from 'react-toastify';

export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => getLeads(params).then(r => r.data),
    placeholderData: keepPreviousData,
  });
};

export const useLead = (id) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id).then(r => r.data),
    enabled: Boolean(id),
  });
};

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create lead'),
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLead(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead'] });
      toast.success('Lead updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update lead'),
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete lead'),
  });
};
