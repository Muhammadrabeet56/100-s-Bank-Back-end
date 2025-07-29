const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY, {
  apiVersion: '2024-06-20'
});
const axios = require('axios');

// Cache for exchange rates with 24-hour expiration
const exchangeRateCache = {
  usdToPkr: null,
  lastUpdated: null
};

async function getUsdToPkrRate() {
  // Return cached rate if it's still fresh (less than 24 hours old)
  if (exchangeRateCache.usdToPkr && 
      exchangeRateCache.lastUpdated && 
      Date.now() - exchangeRateCache.lastUpdated < 24 * 60 * 60 * 1000) {
    return exchangeRateCache.usdToPkr;
  }

  try {
    // Try a more reliable free tier API
    const response = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=PKR');
    const rate = response.data.rates.PKR;
    
    if (rate) {
      exchangeRateCache.usdToPkr = rate;
      exchangeRateCache.lastUpdated = Date.now();
      return rate;
    }
  } catch (error) {
    console.warn('Primary exchange rate API failed, trying fallback:', error.message);
  }

  // Fallback to another API
  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    const rate = response.data.rates.PKR;
    
    if (rate) {
      exchangeRateCache.usdToPkr = rate;
      exchangeRateCache.lastUpdated = Date.now();
      return rate;
    }
  } catch (error) {
    console.warn('Fallback exchange rate API failed:', error.message);
  }

  // Final fallback - use a reasonable default but warn
  console.warn('Using default USD to PKR rate of 280');
  return 280;
}

exports.getPaymentLinkAnalytics = async (req, res) => {
  try {
    // 1. Verify test mode
    if (!process.env.STRIPE_TEST_SECRET_KEY?.includes('_test_')) {
      throw new Error('Server must use Stripe test key in development');
    }

    // 2. Get current exchange rate
    const usdToPkrRate = await getUsdToPkrRate();
    console.log(`Using USD to PKR rate: ${usdToPkrRate}`);

    // 3. Get Stripe account balance with proper currency handling
    const balance = await stripe.balance.retrieve();
    
    // Convert all balances to USD equivalent first, then to PKR
    const balanceDetails = {
      available: { usd: 0, pkr: 0 },
      pending: { usd: 0, pkr: 0 }
    };

    balance.available.forEach(b => {
      if (b.currency === 'usd') {
        balanceDetails.available.usd += b.amount;
        balanceDetails.available.pkr += b.amount * usdToPkrRate;
      } else if (b.currency === 'pkr') {
        balanceDetails.available.usd += b.amount / usdToPkrRate;
        balanceDetails.available.pkr += b.amount;
      }
      // Add other currencies as needed
    });

    balance.pending.forEach(b => {
      if (b.currency === 'usd') {
        balanceDetails.pending.usd += b.amount;
        balanceDetails.pending.pkr += b.amount * usdToPkrRate;
      } else if (b.currency === 'pkr') {
        balanceDetails.pending.usd += b.amount / usdToPkrRate;
        balanceDetails.pending.pkr += b.amount;
      }
    });

    // 4. Get all payment links with their names
    const paymentLinks = await stripe.paymentLinks.list({
      limit: 100,
      active: true,
      expand: ['data.line_items']
    });

    // Create a map of payment link IDs to their details
    const paymentLinkMap = {};
    paymentLinks.data.forEach(link => {
      paymentLinkMap[link.id] = {
        name: link.line_items?.data[0]?.price?.product || 'Unnamed Product',
        url: link.url,
        currency: link.line_items?.data[0]?.price?.currency || 'usd'
      };
    });

    // 5. Get payments for all links with proper currency handling
    const allPayments = [];
    
    for (const link of paymentLinks.data) {
      const payments = await stripe.paymentIntents.list({
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 60 // Last 60 days
        },
        expand: ['data.customer', 'data.payment_method', 'data.charges.data.balance_transaction'],
      });
      
      payments.data.forEach(payment => {
        payment.paymentLink = {
          id: link.id,
          ...paymentLinkMap[link.id]
        };
        allPayments.push(payment);
      });
    }

    // 6. Process payment data with proper currency conversion
    const paymentDetails = await Promise.all(allPayments.map(async (payment) => {
      // Get the original payment amount in its native currency
      const originalAmount = payment.amount;
      const originalCurrency = payment.currency.toLowerCase();
      
      // Get customer details
      let customer = null;
      if (payment.customer) {
        customer = typeof payment.customer === 'string' 
          ? await stripe.customers.retrieve(payment.customer)
          : payment.customer;
      }

      // Get payment method details
      let paymentMethod = null;
      if (payment.payment_method) {
        const pm = typeof payment.payment_method === 'string'
          ? await stripe.paymentMethods.retrieve(payment.payment_method)
          : payment.payment_method;
        
        if (pm?.card) {
          paymentMethod = {
            type: 'card',
            details: {
              last4: pm.card.last4,
              brand: pm.card.brand,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
              country: pm.card.country
            }
          };
        } else if (pm?.type) {
          paymentMethod = {
            type: pm.type,
            details: pm[pm.type] || {}
          };
        }
      }

      // Get fee and net amount with proper currency conversion
      let fee = 0;
      let netAmount = 0;
      let feeCurrency = 'usd';
      let netCurrency = 'usd';

      if (payment.charges?.data[0]?.balance_transaction) {
        const bt = typeof payment.charges.data[0].balance_transaction === 'string'
          ? await stripe.balanceTransactions.retrieve(payment.charges.data[0].balance_transaction)
          : payment.charges.data[0].balance_transaction;
        
        fee = bt.fee;
        netAmount = bt.net;
        feeCurrency = bt.currency;
        netCurrency = bt.currency;
      }

      // Convert all values to both USD and PKR for reporting
      const convertToDisplayValues = (amount, currency) => {
        const isUsd = currency === 'usd';
        const isPkr = currency === 'pkr';
        
        return {
          original: amount / 100,
          original_currency: currency,
          usd: isUsd ? amount / 100 : isPkr ? amount / 100 / usdToPkrRate : null,
          pkr: isPkr ? amount / 100 : isUsd ? amount / 100 * usdToPkrRate : null
        };
      };

      return {
        payment_id: payment.id,
        amount: convertToDisplayValues(originalAmount, originalCurrency),
        fee: convertToDisplayValues(fee, feeCurrency),
        net_amount: convertToDisplayValues(netAmount, netCurrency),
        status: payment.status,
        created: new Date(payment.created * 1000).toISOString(),
        payment_link: payment.paymentLink,
        customer: {
          id: customer?.id,
          name: customer?.name || payment.charges?.data[0]?.billing_details?.name || 'Anonymous',
          email: customer?.email || payment.charges?.data[0]?.billing_details?.email || 'No email',
          phone: customer?.phone || payment.charges?.data[0]?.billing_details?.phone,
          address: customer?.address || payment.charges?.data[0]?.billing_details?.address
        },
        payment_method: paymentMethod
      };
    }));

    // 7. Calculate summary analytics with proper currency aggregation
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const analytics = paymentDetails.reduce((acc, payment) => {
      const paymentDate = new Date(payment.created);
      const period = paymentDate >= thisMonthStart ? 'thisMonth' : 
                     paymentDate >= lastMonthStart ? 'lastMonth' : null;

      if (!period) return acc;

      // Sum amounts in their original currencies
      acc[period].count++;
      
      // Track amounts by original currency
      const currency = payment.amount.original_currency;
      if (!acc[period].currencies[currency]) {
        acc[period].currencies[currency] = { amount: 0, count: 0 };
      }
      
      acc[period].currencies[currency].amount += payment.amount.original;
      acc[period].currencies[currency].count++;
      
      // Add converted values
      acc[period].amount_usd += payment.amount.usd || 0;
      acc[period].amount_pkr += payment.amount.pkr || 0;
      acc[period].fees_usd += payment.fee.usd || 0;
      acc[period].fees_pkr += payment.fee.pkr || 0;
      acc[period].net_usd += payment.net_amount.usd || 0;
      acc[period].net_pkr += payment.net_amount.pkr || 0;

      return acc;
    }, { 
      thisMonth: { 
        count: 0, 
        amount_usd: 0, 
        amount_pkr: 0, 
        fees_usd: 0, 
        fees_pkr: 0, 
        net_usd: 0, 
        net_pkr: 0,
        currencies: {} 
      }, 
      lastMonth: { 
        count: 0, 
        amount_usd: 0, 
        amount_pkr: 0, 
        fees_usd: 0, 
        fees_pkr: 0, 
        net_usd: 0, 
        net_pkr: 0,
        currencies: {} 
      }
    });

    res.status(200).json({
      success: true,
      testMode: true,
      data: {
        exchange_rate: usdToPkrRate,
        account_balance: {
          available: {
            usd: balanceDetails.available.usd / 100,
            pkr: balanceDetails.available.pkr / 100
          },
          pending: {
            usd: balanceDetails.pending.usd / 100,
            pkr: balanceDetails.pending.pkr / 100
          }
        },
        summary: {
          thisMonth: {
            ...analytics.thisMonth,
            currencies: Object.entries(analytics.thisMonth.currencies).map(([currency, data]) => ({
              currency,
              ...data
            }))
          },
          lastMonth: {
            ...analytics.lastMonth,
            currencies: Object.entries(analytics.lastMonth.currencies).map(([currency, data]) => ({
              currency,
              ...data
            }))
          }
        },
        payments: paymentDetails
      },
      suggestions: [
        'Use test card 4242 4242 4242 4242 for testing',
        'Currency conversions use the current rate and may not match historical rates',
        'For exact amounts, refer to the original currency values'
      ]
    });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({
      success: false,
      testMode: true,
      error: error.message,
      suggestion: 'Check if Stripe test keys are properly configured'
    });
  }
};