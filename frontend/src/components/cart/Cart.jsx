import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../../api.js';
import CartLayout from './CartLayout.jsx';
import CartItem from './CartItem.jsx';
import CartSummary from './CartSummary.jsx';
import EmptyCart from './EmptyCart.jsx';
import LoadingCart from './LoadingCart.jsx';
import CartError from './CartError.jsx';

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
            const data = await getCart();
            setCart(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (id, qty) => {
        if (!user || !token) {
            setError('Please login to update cart');
            return;
        }
        if (qty < 1) return removeItem(id);

        try {
            const data = await updateCartItem(id, qty);
            setCart({ ...data.data });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update cart');
        }
    };

    const removeItem = async (id) => {
        if (!user || !token) {
            setError('Please login to remove items');
            return;
        }
        try {
            const data = await removeFromCart(id);
            setCart({ ...data.data });
            setError(null);
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
                                onUpdateQuantity={updateQty}
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
