import {
  Plan,
  Offer,
  Subscription,
  Purchase,
  Entitlement,
  Refund,
} from '../../api/commerce';

export * from './plans.fixture';
export * from './subscriptions.fixture';
export * from './purchases.fixture';
export * from './entitlements.fixture';
export * from './refunds.fixture';

import {
  testPlanPro,
  testPlanBasic,
  testPlanAnnual,
  testOffer,
} from './plans.fixture';
import {
  activeSubscription,
  cancelledSubscription,
  agentSubscription,
} from './subscriptions.fixture';
import {
  completedPurchase,
  selfPurchase,
} from './purchases.fixture';
import {
  paidMembershipEntitlement,
  agentCapabilityEntitlement,
  expiredEntitlement,
  channelAccessEntitlement,
} from './entitlements.fixture';
import {
  processedRefund,
  pendingRefund,
} from './refunds.fixture';

// Parse-validate all fixtures against their schemas at module load.
// If a schema changes without updating fixtures, this will throw at import time.
Plan.parse(testPlanPro);
Plan.parse(testPlanBasic);
Plan.parse(testPlanAnnual);
Offer.parse(testOffer);
Subscription.parse(activeSubscription);
Subscription.parse(cancelledSubscription);
Subscription.parse(agentSubscription);
Purchase.parse(completedPurchase);
Purchase.parse(selfPurchase);
Entitlement.parse(paidMembershipEntitlement);
Entitlement.parse(agentCapabilityEntitlement);
Entitlement.parse(expiredEntitlement);
Entitlement.parse(channelAccessEntitlement);
Refund.parse(processedRefund);
Refund.parse(pendingRefund);
