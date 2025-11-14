import React, { useState } from 'react';

const SubscriptionPlan = ({ subscription, onPlanChange }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    monthly: [
      {
        name: 'Professional',
        price: '$199',
        period: '/month',
        description: 'Perfect for individual grant writers and small teams',
        features: [
          'Up to 25 active grants',
          'Basic AI Writing Assistant', 
          'Standard Support',
          'Grant Tracking & Deadlines',
          'Client Management',
          'Basic Reports'
        ],
        current: false,
        recommended: false
      },
      {
        name: 'Business',
        price: '$249',
        period: '/month',
        description: 'Ideal for growing grant teams and agencies',
        features: [
          'Unlimited Active Grants',
          'Advanced AI Writing Assistant',
          'Priority Support',
          'Custom Templates',
          'API Access',
          'Advanced Analytics',
          'Team Collaboration'
        ],
        current: true,
        recommended: true
      },
      {
        name: 'Enterprise',
        price: '$499',
        period: '/month',
        description: 'For large organizations and grant consulting firms',
        features: [
          'Everything in Business',
          'Dedicated Account Manager',
          'Custom Integrations',
          'White-label Solutions',
          'Training Sessions',
          'SLA Guarantee',
          'Advanced Security'
        ],
        current: false,
        recommended: false
      }
    ],
    yearly: [
      {
        name: 'Professional',
        price: '$1,990',
        period: '/year',
        description: 'Perfect for individual grant writers and small teams',
        features: [
          'Up to 25 active grants',
          'Basic AI Writing Assistant',
          'Standard Support', 
          'Grant Tracking & Deadlines',
          'Client Management',
          'Basic Reports'
        ],
        current: false,
        recommended: false,
        savings: 'Save 17%'
      },
      {
        name: 'Business',
        price: '$2,490',
        period: '/year',
        description: 'Ideal for growing grant teams and agencies',
        features: [
          'Unlimited Active Grants',
          'Advanced AI Writing Assistant',
          'Priority Support',
          'Custom Templates',
          'API Access',
          'Advanced Analytics',
          'Team Collaboration'
        ],
        current: true,
        recommended: true,
        savings: 'Save 17%'
      },
      {
        name: 'Enterprise',
        price: '$4,990',
        period: '/year',
        description: 'For large organizations and grant consulting firms',
        features: [
          'Everything in Business',
          'Dedicated Account Manager', 
          'Custom Integrations',
          'White-label Solutions',
          'Training Sessions',
          'SLA Guarantee',
          'Advanced Security'
        ],
        current: false,
        recommended: false,
        savings: 'Save 17%'
      }
    ]
  };

  const currentPlans = plans[billingCycle];

  return (
    <div className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Subscription Plan</h2>
        <div className="billing-toggle">
          <button 
            className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="current-plan-overview">
        <div className="plan-badge current">
          <span>Current Plan</span>
        </div>
        <div className="current-plan-details">
          <h3>{subscription.plan} Plan</h3>
          <p className="plan-price">{subscription.price}</p>
          <p className="plan-renewal">Renews on {new Date(subscription.renewalDate).toLocaleDateString()}</p>
          <div className="plan-maintenance">
            <span className="maintenance-label">Maintenance Fee:</span>
            <span className="maintenance-price">$150/month</span>
          </div>
          <div className="plan-status active">
            <span className="status-dot"></span>
            Active
          </div>
        </div>
      </div>

      {/* Total Cost Breakdown */}
      <div className="cost-breakdown">
        <h4>Total Monthly Cost</h4>
        <div className="cost-items">
          <div className="cost-item">
            <span className="cost-label">Plan Subscription:</span>
            <span className="cost-value">${subscription.plan === 'Professional' ? '199' : subscription.plan === 'Business' ? '249' : '499'}</span>
          </div>
          <div className="cost-item">
            <span className="cost-label">Maintenance Fee:</span>
            <span className="cost-value">$150</span>
          </div>
          <div className="cost-item total">
            <span className="cost-label">Total:</span>
            <span className="cost-value">
              ${subscription.plan === 'Professional' ? '349' : subscription.plan === 'Business' ? '399' : '649'}/month
            </span>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="usage-stats">
        <h4>Usage This Month</h4>
        <div className="usage-grid">
          <div className="usage-item">
            <div className="usage-label">Active Grants</div>
            <div className="usage-bar">
              <div 
                className="usage-progress" 
                style={{ width: `${(subscription.usage.grants / (subscription.plan === 'Professional' ? 25 : 100)) * 100}%` }}
              ></div>
            </div>
            <div className="usage-value">
              {subscription.usage.grants} / {subscription.plan === 'Professional' ? '25' : 'Unlimited'}
            </div>
          </div>
          <div className="usage-item">
            <div className="usage-label">AI Credits</div>
            <div className="usage-bar">
              <div 
                className="usage-progress" 
                style={{ width: `${(subscription.usage.aiCredits / 1000) * 100}%` }}
              ></div>
            </div>
            <div className="usage-value">{subscription.usage.aiCredits} / 1,000</div>
          </div>
          <div className="usage-item">
            <div className="usage-label">Storage Used</div>
            <div className="usage-bar">
              <div 
                className="usage-progress" 
                style={{ width: `${(subscription.usage.storage / 50) * 100}%` }}
              ></div>
            </div>
            <div className="usage-value">{subscription.usage.storage} GB / 50 GB</div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="available-plans">
        <h4>Available Plans</h4>
        <div className="plans-grid">
          {currentPlans.map((plan, index) => (
            <div key={index} className={`plan-card ${plan.current ? 'current-plan' : ''} ${plan.recommended ? 'recommended' : ''}`}>
              {plan.recommended && <div className="plan-badge recommended">Recommended</div>}
              {plan.current && <div className="plan-badge current">Current Plan</div>}
              
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              {plan.savings && <div className="plan-savings">{plan.savings}</div>}
              
              <div className="plan-maintenance-small">
                + $150/month maintenance
              </div>
              
              <p className="plan-description">{plan.description}</p>
              
              <ul className="plan-features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <i className="fas fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="plan-total">
                Total: ${plan.name === 'Professional' ? '349' : plan.name === 'Business' ? '399' : '649'}/month
              </div>
              
              <button 
                className={`plan-button ${plan.current ? 'current' : ''} ${plan.recommended ? 'recommended' : ''}`}
                onClick={() => !plan.current && onPlanChange(plan.name)}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="billing-history">
        <h4>Billing History</h4>
        <div className="billing-table">
          <div className="billing-row header">
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Receipt</div>
          </div>
          <div className="billing-row">
            <div>Nov 15, 2024</div>
            <div>Business Plan + Maintenance</div>
            <div>$399.00</div>
            <div><span className="status-paid">Paid</span></div>
            <div><button className="btn-link">Download</button></div>
          </div>
          <div className="billing-row">
            <div>Oct 15, 2024</div>
            <div>Business Plan + Maintenance</div>
            <div>$399.00</div>
            <div><span className="status-paid">Paid</span></div>
            <div><button className="btn-link">Download</button></div>
          </div>
          <div className="billing-row">
            <div>Sep 15, 2024</div>
            <div>Business Plan + Maintenance</div>
            <div>$399.00</div>
            <div><span className="status-paid">Paid</span></div>
            <div><button className="btn-link">Download</button></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;