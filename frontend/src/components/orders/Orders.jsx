import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [filter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filter !== 'all' && { status: filter })
      });

      const response = await fetch(`http://localhost:3003/api/order/my?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Network error. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3003/api/order/${orderId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Order cancelled successfully');
        fetchOrders(); // Refresh orders
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Network error. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return '#ffc107';
      case 'Delivered':
        return '#28a745';
      case 'Cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Processing':
        return '⏳ Processing';
      case 'Delivered':
        return '✅ Delivered';
      case 'Cancelled':
        return '❌ Cancelled';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return '✅ Paid';
      case 'pending':
        return '⏳ Pending';
      case 'failed':
        return '❌ Failed';
      case 'cancelled':
        return '❌ Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      {/* Filter Options */}
      <div className="order-filters">
        <label htmlFor="status-filter">Filter by status:</label>
        <select 
          id="status-filter"
          value={filter} 
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchOrders} className="retry-btn">Retry</button>
        </div>
      )}
      
      {orders.length === 0 && !loading ? (
        <div className="no-orders">
          <h2>No orders found</h2>
          <p>{filter !== 'all' ? 'No orders match the selected filter.' : 'Start shopping to see your orders here!'}</p>
          <button onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-title">
                    <h3>Order #{order.orderNumber}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-statuses">
                    <span 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {getStatusText(order.orderStatus)}
                    </span>
                    <span className="payment-status">
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="order-info">
                    <h4>Order Details</h4>
                    <p><strong>Total:</strong> {order.formattedTotal || `₹${order.totalAmount?.toLocaleString()}`}</p>
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    <p><strong>Delivery Location:</strong> {order.deliveryLocation}</p>
                    {order.deliveryDate && (
                      <p><strong>Delivered:</strong> {formatDate(order.deliveryDate)}</p>
                    )}
                    {order.estimatedDelivery && !order.deliveryDate && (
                      <p><strong>Estimated Delivery:</strong> {formatDate(order.estimatedDelivery)}</p>
                    )}
                  </div>
                  
                  <div className="order-products">
                    <h4>Products ({order.products.length})</h4>
                    {order.products.map((product, index) => (
                      <div key={index} className="order-product">
                        <p><strong>{product.productId?.name || 'Product'}</strong></p>
                        <p>Quantity: {product.quantity}</p>
                        <p>Price: ₹{product.price?.toLocaleString()}</p>
                        <p>Subtotal: ₹{(product.price * product.quantity)?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => viewOrderDetails(order._id)}
                  >
                    View Details
                  </button>
                  {order.orderStatus === 'Processing' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(currentPage - 1)}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button 
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
        Continue Shopping
      </button>
    </div>
  );
};

export default Orders;
