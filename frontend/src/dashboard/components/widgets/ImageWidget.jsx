import React from 'react';

const ImageWidget = ({ config }) => {
  const { src = '', alt = 'Image', fit = 'cover' } = config;

  const fitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  if (!src) {
    return (
      <div className="image-widget h-full flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No image selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-widget h-full">
      <img
        src={src}
        alt={alt}
        className={`w-full h-full ${fitClasses[fit] || fitClasses.cover}`}
        onError={(e) => {
          e.target.src = '';
          e.target.alt = 'Image failed to load';
        }}
      />
    </div>
  );
};

export default ImageWidget;
