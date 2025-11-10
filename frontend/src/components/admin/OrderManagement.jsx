import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchAllOrders();
  }, [filter, searchTerm, currentPage]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:3003/api/order/admin/orders?${queryParams}`, {
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

  const updateOrderStatus = async (orderId, status, notes) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3003/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderStatus: status,
          adminNotes: notes
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Order status updated successfully');
        setStatusUpdateModal(false);
        setAdminNotes('');
        setSelectedStatus('');
        fetchAllOrders(); // Refresh orders
        if (showOrderDetails) {
          fetchOrderDetails(orderId); // Refresh order details if open
        }
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Network error. Please try again.');
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3003/api/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderDetails(true);
      } else {
        alert(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
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

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.orderStatus);
    setAdminNotes(order.adminNotes || '');
    setStatusUpdateModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openOrderDetails = (order) => {
    fetchOrderDetails(order._id);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="order-management-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order-management-container">
      <div className="order-management-header">
        <h1>Order Management</h1>
        <p>Manage and evaluate all customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="order-filters-section">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>
          
          <div className="filter-dropdown">
            <label htmlFor="status-filter">Filter by Status:</label>
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
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchAllOrders} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Orders Table */}
      {orders.length === 0 && !loading ? (
        <div className="no-orders">
          <h2>No orders found</h2>
          <p>{filter !== 'all' || searchTerm ? 'No orders match your search criteria.' : 'No orders available.'}</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="order-row">
                  <td className="order-number">
                    <strong>#{order.orderNumber}</strong>
                  </td>
                  <td className="customer-info">
                    <div>
                      <strong>{order.userId?.name || 'N/A'}</strong>
                      <br />
                      <small>{order.userId?.email || 'N/A'}</small>
                    </div>
                  </td>
                  <td className="order-date">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="order-total">
                    <strong>₹{order.totalAmount?.toLocaleString()}</strong>
                  </td>
                  <td className="payment-info">
                    <div>
                      <span className="payment-method">{order.paymentMethod}</span>
                      <br />
                      <small className={`payment-status ${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </small>
                    </div>
                  </td>
                  <td className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {getStatusText(order.orderStatus)}
                    </span>
                  </td>
                  <td className="order-actions">
                    <button 
                      className="view-btn"
                      onClick={() => openOrderDetails(order)}
                    >
                      View
                    </button>
                    <button 
                      className="update-btn"
                      onClick={() => handleStatusUpdate(order)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total)
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.orderNumber}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowOrderDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="order-details-content">
              <div className="order-info-grid">
                <div className="info-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.userId?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                </div>
                
                <div className="info-section">
                  <h3>Order Information</h3>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount?.toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
                  <p><strong>Order Status:</strong> {getStatusText(selectedOrder.orderStatus)}</p>
                </div>
              </div>
              
              <div className="info-section">
                <h3>Shipping Address</h3>
                {selectedOrder.shippingAddress ? (
                  <p>
                    {selectedOrder.shippingAddress.fullName}<br />
                    {selectedOrder.shippingAddress.addressLine1}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                    {selectedOrder.shippingAddress.country}
                  </p>
                ) : (
                  <p>{selectedOrder.deliveryLocation}</p>
                )}
              </div>
              
              <div className="info-section">
                <h3>Products ({selectedOrder.products.length})</h3>
                <div className="products-list">
                  {selectedOrder.products.map((product, index) => (
                    <div key={index} className="product-item">
                      <span><strong>{product.productId?.name || 'Product'}</strong></span>
                      <span>Qty: {product.quantity} × ₹{product.price?.toLocaleString()}</span>
                      <span><strong>₹{(product.price * product.quantity)?.toLocaleString()}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.adminNotes && (
                <div className="info-section">
                  <h3>Admin Notes</h3>
                  <p className="admin-notes">{selectedOrder.adminNotes}</p>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="update-btn"
                onClick={() => {
                  setShowOrderDetails(false);
                  handleStatusUpdate(selectedOrder);
                }}
              >
                Update Status
              </button>
              <button 
                className="close-btn"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setStatusUpdateModal(false)}>
          <div className="modal-content status-update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button 
                className="close-btn"
                onClick={() => setStatusUpdateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="status-update-content">
              <p><strong>Order:</strong> #{selectedOrder.orderNumber}</p>
              <p><strong>Current Status:</strong> {getStatusText(selectedOrder.orderStatus)}</p>
              
              <div className="form-group">
                <label htmlFor="order-status">New Status:</label>
                <select 
                  id="order-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="admin-notes">Admin Notes:</label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                  rows="4"
                  className="notes-textarea"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="save-btn"
                onClick={() => updateOrderStatus(selectedOrder._id, selectedStatus, adminNotes)}
              >
                Update Status
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setStatusUpdateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
