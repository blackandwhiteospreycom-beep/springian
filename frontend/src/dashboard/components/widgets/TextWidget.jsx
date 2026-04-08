import React from 'react';

const TextWidget = ({ config }) => {
  const { content = 'Edit this text...', fontSize = 'medium' } = config;

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  return (
    <div className="text-widget h-full">
      <div className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${sizeClasses[fontSize] || sizeClasses.medium}`}>
        {content}
      </div>
    </div>
  );
};

export default TextWidget;
