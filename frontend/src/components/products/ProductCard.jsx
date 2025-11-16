import React from 'react';

const ProductCard = ({ product, addToCart }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
    <div className="relative">
      <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
        <div className="text-6xl">
          {product.type === 'biogas' ? '🔥' : '🌱'}
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
          product.type === 'biogas' ? 'bg-orange-500' : 'bg-green-500'
        }`}>
          {product.type === 'biogas' ? 'Biogas' : 'Fertilizer'}
        </span>
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
        {product.name}
      </h3>

      {product.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {product.capacity && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium mr-2">Capacity:</span>
            <span>{product.capacity}</span>
          </div>
        )}
        {product.warrantyPeriod && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium mr-2">Warranty:</span>
            <span>{product.warrantyPeriod}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-2xl font-bold text-gray-900">
          ₹{product.price.toLocaleString('en-IN')}
        </div>
        <button
          onClick={() => addToCart(product)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;