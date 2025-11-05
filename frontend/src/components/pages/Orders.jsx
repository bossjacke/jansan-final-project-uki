import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please login to view your orders');
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'confirmed':
        return '#4caf50';
      case 'delivered':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="simple-page">
        <div className="card">
          <h1 className="title">My Orders</h1>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading your orders...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simple-page">
        <div className="card">
          <h1 className="title">My Orders</h1>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
            <button className="btn" onClick={fetchOrders}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="title">My Orders</h1>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>No orders yet</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/shop'}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div 
                key={order._id} 
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      Order ID: {order._id}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div style={{
                    background: getStatusColor(order.orderStatus),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {order.orderStatus}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px 0',
                  borderTop: '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {order.productId?.name || 'Product'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {order.productId?.type === 'biogas' ? '🔥 Biogas Unit' : '🌱 Fertilizer'}
                    </div>
                    {order.productId?.capacity && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Capacity: {order.productId.capacity}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ₹{(order.productId?.price || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Qty: 1
                    </div>
                  </div>
                </div>

                {order.deliveryDate && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '15px',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Expected Delivery:</strong>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {formatDate(order.deliveryDate)}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button 
                    className="btn"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                    onClick={() => alert('Order details feature coming soon!')}
                  >
                    View Details
                  </button>
                  {order.orderStatus === 'delivered' && (
                    <button 
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                      onClick={() => alert('Review feature coming soon!')}
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Order Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {orders.length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Total Orders</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Pending</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                  {orders.filter(o => o.orderStatus === 'confirmed').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Confirmed</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: 'white', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196f3' }}>
                  {orders.filter(o => o.orderStatus === 'delivered').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Delivered</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
