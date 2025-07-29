// // const axios = require('axios');
// // const crypto = require('crypto');

// // // Generate authentication token
// // const getAuthToken = async () => {
// //   try {
// //     const response = await axios.post(`${process.env.PAYFAST_BASE_URL}/token`, {
// //       merchant_id: process.env.PAYFAST_MERCHANT_ID,
// //       secured_key: process.env.PAYFAST_SECURED_KEY,
// //       grant_type: 'client_credentials',
// //       customer_ip: '127.0.0.1' // Replace with actual IP
// //     }, {
// //       headers: {
// //         'Content-Type': 'application/x-www-form-urlencoded'
// //       }
// //     });
// //     return response.data.token;
// //   } catch (error) {
// //     console.error('Token Error:', error.response?.data || error.message);
// //     throw error;
// //   }
// // };

// // // Initiate payment
// // exports.initiatePayment = async (req, res) => {
// //   try {
// //     const { amount, customerName, customerEmail, customerPhone, description } = req.body;
    
// //     // Get authentication token
// //     const token = await getAuthToken();
    
// //     // Prepare payload
// //     const payload = {
// //       basket_id: `ORDER-${Date.now()}`,
// //       txnamt: amount,
// //       customer_email_address: customerEmail,
// //       customer_mobile_no: customerPhone,
// //       order_date: new Date().toISOString(),
// //       txndesc: description || 'Payment'
// //     };

// //     // Generate secured hash
// //     const hashData = `${payload.basket_id}${payload.txnamt}`;
// //     payload.secured_hash = crypto.createHmac('sha256', process.env.PAYFAST_SECURED_KEY)
// //       .update(hashData)
// //       .digest('hex');

// //     // Make payment request
// //     const response = await axios.post(
// //       `${process.env.PAYFAST_BASE_URL}/transaction`,
// //       payload,
// //       {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/x-www-form-urlencoded'
// //         }
// //       }
// //     );

// //     res.json({
// //       success: true,
// //       paymentUrl: response.data.payment_url || `${process.env.PAYFAST_BASE_URL}/pay?token=${response.data.transaction_id}`,
// //       transactionId: response.data.transaction_id
// //     });

// //   } catch (error) {
// //     console.error('Payment Error:', error.response?.data || error.message);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Payment initiation failed',
// //       details: error.response?.data || error.message
// //     });
// //   }
// // };

// // // Handle callback
// // exports.paymentCallback = (req, res) => {
// //   try {
// //     const payload = req.body;
    
// //     // Verify secured hash if needed
// //     const hashData = `${payload.basket_id}${payload.txnamt}`;
// //     const calculatedHash = crypto.createHmac('sha256', process.env.PAYFAST_SECURED_KEY)
// //       .update(hashData)
// //       .digest('hex');

// //     if (payload.secured_hash !== calculatedHash) {
// //       return res.status(401).send('Invalid signature');
// //     }

// //     // Process payment status
// //     if (payload.status_code === '00') {
// //       console.log('Payment succeeded:', payload.transaction_id);
// //       // Update your database here
// //     } else {
// //       console.log('Payment failed:', payload.status_msg);
// //     }

// //     res.status(200).send('OK');
// //   } catch (error) {
// //     console.error('Callback Error:', error);
// //     res.status(500).send('Internal server error');
// //   }
// // };

// const axios = require("axios");

// // Get Access Token
// const getAccessToken = async (req, res) => {
//   try {
//     const { customer_ip } = req.body;

//     const response = await axios.post(
//       `${process.env.PAYFAST_BASE_URL}/token`,
//       new URLSearchParams({
//         merchant_id: process.env.PAYFAST_MERCHANT_ID,
//         secured_key: process.env.PAYFAST_SECURED_KEY,
//         grant_type: "client_credentials",
//         customer_ip,
//       }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           "cache-control": "no-cache",
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // List Banks
// const listBanks = async (req, res) => {
//   try {
//     const { token, customer_ip } = req.body;

//     const response = await axios.get(
//       `${process.env.PAYFAST_BASE_URL}/list/banks`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         params: { customer_ip },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Validate Customer (Card Payment)
// const validateCustomer = async (req, res) => {
//   try {
//     const {
//       token,
//       basket_id,
//       txnamt,
//       customer_mobile_no,
//       customer_email_address,
//       account_type_id,
//       bank_code,
//       card_number,
//       expiry_month,
//       expiry_year,
//       cvv,
//       order_date,
//       customer_ip,
//     } = req.body;

//     const response = await axios.post(
//       `${process.env.PAYFAST_BASE_URL}/customer/validate`,
//       new URLSearchParams({
//         basket_id,
//         txnamt,
//         customer_mobile_no,
//         customer_email_address,
//         account_type_id,
//         bank_code,
//         card_number,
//         expiry_month,
//         expiry_year,
//         cvv,
//         order_date,
//         customer_ip,
//       }),
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Initiate Transaction
// const initiateTransaction = async (req, res) => {
//   try {
//     const {
//       token,
//       basket_id,
//       txnamt,
//       customer_email_address,
//       account_type_id,
//       customer_mobile_no,
//       card_number,
//       expiry_month,
//       expiry_year,
//       cvv,
//       bank_code,
//       order_date,
//       otp,
//       transaction_id,
//       customer_ip,
//     } = req.body;

//     const response = await axios.post(
//       `${process.env.PAYFAST_BASE_URL}/transaction`,
//       new URLSearchParams({
//         basket_id,
//         txnamt,
//         customer_email_address,
//         account_type_id,
//         customer_mobile_no,
//         card_number,
//         expiry_month,
//         expiry_year,
//         cvv,
//         bank_code,
//         order_date,
//         otp,
//         transaction_id,
//         customer_ip,
//       }),
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   getAccessToken,
//   listBanks,
//   validateCustomer,
//   initiateTransaction,
// };

