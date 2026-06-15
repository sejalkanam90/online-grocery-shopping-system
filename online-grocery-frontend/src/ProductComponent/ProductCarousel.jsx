// src/ProductComponent/ProductCarousel.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCarousel = ({ products, title }) => {
  const navigate = useNavigate();

  const getImageUrl = (image) => {
    return image ? `http://localhost:8085/uploads/${image}` : null;
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">{title || 'Products'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 8).map(product => (
          <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-2">
              {getImageUrl(product.image1) ? (
                <img src={getImageUrl(product.image1)} alt={product.name} className="h-full w-full object-cover rounded" />
              ) : (
                <span className="text-3xl">🛒</span>
              )}
            </div>
            <h3 className="font-medium text-sm truncate">{product.name}</h3>
            <p className="text-green-600 font-bold text-sm">₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;