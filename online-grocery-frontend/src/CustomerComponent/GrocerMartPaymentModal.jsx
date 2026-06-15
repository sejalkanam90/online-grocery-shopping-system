import React, { useState } from 'react';
import toast from 'react-hot-toast';

const GrocerMartPaymentModal = ({ totalAmount, userPhone, walletBalance, onClose, onWalletPayment }) => {
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleUPIPayment = () => {
    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g., name@upi)');
      return;
    }
    setProcessing(true);
    // Real App मध्ये इथे Razorpay चा UPI flow कॉल होईल. सध्या सिम्युलेशन दिले आहे.
    setTimeout(() => {
      setProcessing(false);
      alert(`Simulation: UPI Payment request sent to ${upiId}`);
      onClose();
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '30px', width: '420px',
        padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#059669', margin: 0, fontWeight: '900', fontStyle: 'italic' }}>GrocerMart PAY</h2>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#111827', margin: '10px 0' }}>₹{totalAmount}</div>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Customer: <b>{userPhone}</b></p>
        </div>

        {/* Wallet Option */}
        <div style={{ 
          background: walletBalance >= totalAmount ? '#F0FDF4' : '#FEF2F2', 
          border: `2px solid ${walletBalance >= totalAmount ? '#10B981' : '#FECACA'}`, 
          padding: '20px', borderRadius: '20px', marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#047857', uppercase: 'true' }}>Wallet Balance</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#065F46' }}>₹{walletBalance}</p>
            </div>
            <button
              onClick={onWalletPayment}
              disabled={walletBalance < totalAmount}
              style={{
                backgroundColor: '#10B981', color: 'white', border: 'none',
                padding: '12px 20px', borderRadius: '15px', fontWeight: 'bold',
                cursor: 'pointer', opacity: walletBalance < totalAmount ? 0.4 : 1,
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
              }}
            >
              {walletBalance < totalAmount ? 'Low Balance' : 'Pay Now'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#D1D5DB', fontWeight: 'bold', fontSize: '12px' }}>OR PAY VIA UPI</div>

        {/* UPI Section - Corrected Input Visibility */}
        <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <label style={{ fontSize: '12px', fontWeight: '900', color: '#374151', display: 'block', marginBottom: '10px' }}>Enter UPI ID</label>
          <input
            type="text"
            placeholder="e.g. 9876543210@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #E5E7EB',
              marginBottom: '15px', fontSize: '16px', outline: 'none', boxSizing: 'border-box',
              fontWeight: 'bold', color: '#111827'
            }}
          />
          <button
            onClick={handleUPIPayment}
            disabled={processing || !upiId}
            style={{
              width: '100%', padding: '15px', backgroundColor: '#111827', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              opacity: (processing || !upiId) ? 0.6 : 1
            }}
          >
            {processing ? 'Processing...' : 'Verify & Pay'}
          </button>
        </div>

        <button 
          onClick={onClose}
          style={{ width: '100%', marginTop: '25px', background: 'none', border: 'none', color: '#9CA3AF', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cancel and Return to Cart
        </button>
      </div>
    </div>
  );
};

export default GrocerMartPaymentModal;