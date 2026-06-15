// src/ProductComponent/ProductCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const getImageUrl = (image) => {
    return image ? `http://localhost:8085/uploads/${image}` : null;
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
        {getImageUrl(product.image1) ? (
          <img src={getImageUrl(product.image1)} alt={product.name} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <span className="text-4xl">🛒</span>
        )}
      </div>
      <h3 className="font-semibold text-lg truncate">{product.name}</h3>
      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xl font-bold text-green-600">₹{product.price}</span>
        <span className="text-sm text-gray-500">Stock: {product.quantity}</span>
      </div>
    </div>
  );
};

export default ProductCard;