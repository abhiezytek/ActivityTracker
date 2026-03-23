export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: '#3b82f6' },
  { value: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { value: 'qualified', label: 'Qualified', color: '#f59e0b' },
  { value: 'proposal', label: 'Proposal', color: '#f97316' },
  { value: 'negotiation', label: 'Negotiation', color: '#ec4899' },
  { value: 'closed_won', label: 'Closed Won', color: '#16a34a' },
  { value: 'closed_lost', label: 'Closed Lost', color: '#dc2626' },
];

export const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'site_visit', label: 'Site Visit' },
];

export const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'agent', label: 'Agent' },
  { value: 'other', label: 'Other' },
];

export const ACTIVITY_OUTCOMES = [
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'callback', label: 'Callback Requested' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'completed', label: 'Completed' },
];

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
];

export const POLICY_STATUSES = [
  { value: 'active', label: 'Active', color: '#16a34a' },
  { value: 'expired', label: 'Expired', color: '#dc2626' },
  { value: 'cancelled', label: 'Cancelled', color: '#64748b' },
  { value: 'pending', label: 'Pending', color: '#d97706' },
];

export const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: '#3b82f6' },
  { id: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { id: 'qualified', label: 'Qualified', color: '#f59e0b' },
  { id: 'proposal', label: 'Proposal Sent', color: '#f97316' },
  { id: 'closed_won', label: 'Closed Won', color: '#16a34a' },
];
