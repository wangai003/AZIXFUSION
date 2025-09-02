import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import { axiosi } from '../config/axios';

export default function BecomeVendorPage() {
  const [sellerType, setSellerType] = useState('');
  const [message, setMessage] = useState('');
  const user = useSelector(selectLoggedInUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosi.post('/users/become-vendor', { sellerType });
      setMessage('You are now a vendor!');
      // Optionally redirect to dashboard
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to become vendor');
    }
  };

  if (!user) return <div>Please log in first.</div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Seller Type:
        <select value={sellerType} onChange={e => setSellerType(e.target.value)} required style={{ marginLeft: 8 }}>
          <option value="">Select...</option>
          <option value="service">Service</option>
          <option value="product">Product</option>
        </select>
      </label>
      <button type="submit" style={{ padding: '8px 16px' }}>Become a Vendor</button>
      {message && <div style={{ marginTop: 16 }}>{message}</div>}
    </form>
  );
} 