import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartLayout from './CartLayout.jsx';
import CartItem from './CartItem.jsx';
import CartSummary from './CartSummary.jsx';
import EmptyCart from './EmptyCart.jsx';
import LoadingCart from './LoadingCart.jsx';
import CartError from './CartError.jsx';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

function Cart() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && token) fetchCart();
        else setLoading(false);
    }, [user, token]);

    const fetchCart = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/cart/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (id, qty) => {
        if (!user || !token) return alert('Please login');
        if (qty < 1) return removeItem(id);
        
        try {
            const { data } = await axios.put(`${API_URL}/cart/item/${id}`, { quantity: qty }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update cart');
        }
    };

    const removeItem = async (id) => {
        if (!user || !token) return alert('Please login');
        try {
            const { data } = await axios.delete(`${API_URL}/cart/item/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleCheckout = () => {
        if (!user) return navigate('/login');
        if (!cart.items.length) return alert('Cart is empty');
        navigate('/checkout');
    };

    if (loading) return <LoadingCart />;

    return (
        <CartLayout itemCount={cart.items.length}>
            {error && <CartError error={error} />}

            {!cart.items.length ? (
                <EmptyCart onStartShopping={() => navigate('/products')} />
            ) : (
                <>
                    <div className="space-y-4 mb-6">
                        {cart.items.map(item => (
                            <CartItem 
                                key={item.productId?._id || item.productId} 
                                item={item} 
                                onUpdateQty={updateQty} 
                                onRemove={removeItem} 
                            />
                        ))}
                    </div>

                    <CartSummary 
                        totalAmount={cart.totalAmount}
                        onContinueShopping={() => navigate('/products')}
                        onCheckout={handleCheckout}
                    />
                </>
            )}
        </CartLayout>
    );
}

export default Cart;
