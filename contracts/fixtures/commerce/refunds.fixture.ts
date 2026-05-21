import type { Refund } from '../../api/commerce';

export const processedRefund: Refund = {
  id: 'f6000001-0000-0000-0000-000000000001',
  purchaseId: 'e4000001-0000-0000-0000-000000000001',
  amount: 1999,
  currency: 'USD',
  reason: 'Customer requested cancellation within refund window',
  status: 'processed',
  processedAt: '2024-01-05T12:00:00Z',
  createdAt: '2024-01-05T11:00:00Z',
  updatedAt: '2024-01-05T12:00:00Z',
};

export const pendingRefund: Refund = {
  id: 'f6000002-0000-0000-0000-000000000002',
  purchaseId: 'e4000002-0000-0000-0000-000000000002',
  amount: 499,
  currency: 'USD',
  reason: 'Duplicate charge',
  status: 'pending',
  processedAt: null,
  createdAt: '2024-01-10T09:00:00Z',
  updatedAt: '2024-01-10T09:00:00Z',
};
