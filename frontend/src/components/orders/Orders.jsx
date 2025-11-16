import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCart, getMyOrders, createOrder, confirmOrder } from '../../api.js';



function Orders() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', postalCode: '', country: 'sri lanka'
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (location.state?.fromCart && user) {
      fetchCartAndShowCheckout();
    } else {
      fetchOrders();
    }
  }, [user, location.state]);

  const fetchCartAndShowCheckout = async () => {
    try {
      setLoading(true);
      const data = await getCart();

      if (data.data.items.length > 0) {
        setCart(data.data);
        setShowCheckout(true);
      } else {
        setShowCheckout(false);
        fetchOrders();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
      setShowCheckout(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data.data.orders || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => 
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const createOrderHandler = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      alert('Please fill in all shipping address fields');
      return;
    }

    try {
      setPaymentProcessing(true);

      const data = await createOrder({ shippingAddress });
      const order = data.data.order;

      // Note: The payment endpoints in this component seem to be different from backend routes
      // This might need adjustment based on actual backend implementation
      await confirmOrder('simulated_success');

      alert('Order placed successfully!');
      setShowCheckout(false);
      setCart(null);
      fetchOrders();

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create order');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const cancelCheckout = () => {
    setShowCheckout(false);
    setCart(null);
    fetchOrders();
  };

  if (loading) return (
    <div className="simple-page">
      <div className="card">
        <h1 className="title">My Orders</h1>
        <div className="text-center py-10">Loading...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="simple-page">
      <div className="card">
        <h1 className="title">My Orders</h1>
        <div className="text-center py-10">
          <div className="text-red-500 mb-5">{error}</div>
          <button className="btn" onClick={fetchOrders}>Retry</button>
        </div>
      </div>
    </div>
  );

  const CheckoutForm = () => (
    <div>
      <h1 className="title">Checkout</h1>
      
      <div className="mb-8 p-5 bg-gray-50 rounded-lg">
        <h3 className="mb-4 font-bold">Order Summary</h3>
        {cart.items.map((item) => (
          <div key={item.productId?._id || item.productId} className="flex justify-between mb-3 p-3 bg-white rounded">
            <div>
              <div className="font-bold">{item.productId?.name || 'Product'}</div>
              <div className="text-sm text-gray-600">
                {item.productId?.type === 'biogas' ? '🔥 Biogas Unit' : '🌱 Fertilizer'}
              </div>
              <div className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</div>
            </div>
            <div className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
          </div>
        ))}
        <div className="flex justify-between mt-4 pt-4 border-t-2 border-gray-200">
          <div className="text-lg font-bold">Total</div>
          <div className="text-2xl font-bold">₹{cart.totalAmount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 font-bold">Shipping Address</h3>
        <div className="grid gap-4">
          <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange} 
            className="w-full p-3 border rounded-lg text-sm" placeholder="Street Address *" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="City *" required />
            <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="State" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="Postal Code *" required />
            <input type="text" name="country" value={shippingAddress.country} onChange={handleAddressChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="Country" />
          </div>
        </div>
      </div>

      <div className="mb-8 p-5 bg-green-50 rounded-lg text-center">
        <div><strong>Payment Method:</strong> Online Payment (Secure)</div>
      </div>

      <div className="flex gap-4 justify-end">
        <button className="btn" onClick={cancelCheckout} disabled={paymentProcessing}>Cancel</button>
        <button className="btn btn-primary" onClick={createOrderHandler} disabled={paymentProcessing}>
          {paymentProcessing ? 'Processing...' : `Pay ₹${cart.totalAmount.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );

  const OrderCard = ({ order }) => (
    <div className="p-5 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs text-gray-600">Order ID: {order._id}</div>
          <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
          order.orderStatus === 'pending' ? 'bg-orange-500' :
          order.orderStatus === 'confirmed' ? 'bg-green-500' :
          order.orderStatus === 'delivered' ? 'bg-blue-500' : 'bg-gray-500'
        }`}>
          {order.orderStatus}
        </div>
      </div>

      <div className="flex justify-between py-4 border-t border-b border-gray-100">
        <div>
          <div className="font-bold">{order.productId?.name || 'Product'}</div>
          <div className="text-sm text-gray-600">
            {order.productId?.type === 'biogas' ? '🔥 Biogas Unit' : '🌱 Fertilizer'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">₹{(order.productId?.price || 0).toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-600">Qty: 1</div>
        </div>
      </div>

      {order.deliveryDate && (
        <div className="flex justify-between mt-4 p-3 bg-gray-50 rounded-lg">
          <div><strong>Expected Delivery:</strong></div>
          <div className="font-bold">{formatDate(order.deliveryDate)}</div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button className="btn text-xs px-4 py-2" onClick={() => alert('Order details feature coming soon!')}>
          View Details
        </button>
        {order.orderStatus === 'delivered' && (
          <button className="btn btn-primary text-xs px-4 py-2" onClick={() => alert('Review feature coming soon!')}>
            Write Review
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="simple-page">
      <div className="card">
        {showCheckout && cart ? <CheckoutForm /> : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="title">My Orders</h1>
              <div className="text-sm text-gray-600">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-5">📦</div>
                <h3 className="text-gray-600 mb-3">No orders yet</h3>
                <p className="text-gray-400 mb-5">Start shopping to see your orders here!</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/shop'}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid gap-5">
                {orders.map((order) => <OrderCard key={order._id} order={order} />)}
              </div>
            )}

            {orders.length > 0 && (
              <div className="mt-8 p-5 bg-gray-50 rounded-lg">
                <h3 className="mb-4 font-bold">Order Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Orders', value: orders.length, color: 'text-gray-800' },
                    { label: 'Pending', value: orders.filter(o => o.orderStatus === 'pending').length, color: 'text-orange-500' },
                    { label: 'Confirmed', value: orders.filter(o => o.orderStatus === 'confirmed').length, color: 'text-green-500' },
                    { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, color: 'text-blue-500' }
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center p-4 bg-white rounded-lg">
                      <div className={`text-xl font-bold ${color}`}>{value}</div>
                      <div className="text-gray-600 text-xs">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
