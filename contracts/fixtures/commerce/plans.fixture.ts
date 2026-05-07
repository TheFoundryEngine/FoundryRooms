import type { Plan, Offer, PlanTier } from '../../api/commerce';

export const testPlanPro: Plan = {
  id: 'b1000001-0000-0000-0000-000000000001',
  name: 'Pro Plan',
  tier: 'pro',
  billingInterval: 'monthly',
  priceAmount: 1999,  // $19.99 in cents
  currency: 'USD',
  description: 'Full access to all community features and premium content',
  features: ['unlimited_channels', 'advanced_analytics', 'priority_support'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const testPlanBasic: Plan = {
  id: 'b1000002-0000-0000-0000-000000000002',
  name: 'Basic Plan',
  tier: 'basic',
  billingInterval: 'monthly',
  priceAmount: 499,   // $4.99 in cents
  currency: 'USD',
  description: 'Access to standard community features',
  features: ['standard_channels', 'basic_analytics'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const testPlanAnnual: Plan = {
  id: 'b1000003-0000-0000-0000-000000000003',
  name: 'Pro Annual',
  tier: 'pro',
  billingInterval: 'annual',
  priceAmount: 19900, // $199.00 in cents
  currency: 'USD',
  description: 'Annual pro plan at a discount',
  features: ['unlimited_channels', 'advanced_analytics', 'priority_support', 'annual_discount'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const testOffer: Offer = {
  id: 'c2000001-0000-0000-0000-000000000001',
  planId: 'b1000001-0000-0000-0000-000000000001',
  name: 'Launch Promo',
  discountPercent: 20,
  trialDays: 14,
  validFrom: '2024-01-01T00:00:00Z',
  validUntil: '2024-03-31T23:59:59Z',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const testPlanTiers: PlanTier[] = ['free', 'basic', 'pro', 'enterprise'];
