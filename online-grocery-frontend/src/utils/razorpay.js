// src/utils/razorpay.js

let scriptLoaded = false;
let loadingPromise = null;

export const loadRazorpayScript = () => {
  if (scriptLoaded) {
    return Promise.resolve(true);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      scriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadingPromise;
};

export const createRazorpayOptions = ({
  orderData,
  amount,
  user,
  description,
  onSuccess,
  onFailure,
}) => ({
  key: orderData.key,
  amount: orderData.amount,
  currency: orderData.currency,
  name: 'GroceryMart',
  description: description || 'Payment',
  order_id: orderData.id,
  prefill: {
    name: user.name || 'User',
    email: user.email || '',
    contact: user.phone?.replace(/\D/g, '').slice(0, 10) || '9999999999'
  },
  theme: { color: '#059669' },
  handler: onSuccess,
  modal: { ondismiss: onFailure }
});