import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLink, AiOutlineHome, AiOutlineSetting, AiOutlineTeam, 
         AiOutlineBarChart, AiOutlineDashboard, AiOutlineUser, AiOutlineShop,
         AiOutlineMail, AiOutlinePhone, AiOutlineGlobal } from 'react-icons/ai';

const LinkWidget = ({ config }) => {
  const navigate = useNavigate();
  const { url = '#', description = '', icon = 'link', color = '#296374', openInNewTab = false } = config;

  const getIcon = () => {
    const icons = {
      link: <AiOutlineLink size={28} />,
      home: <AiOutlineHome size={28} />,
      settings: <AiOutlineSetting size={28} />,
      team: <AiOutlineTeam size={28} />,
      chart: <AiOutlineBarChart size={28} />,
      dashboard: <AiOutlineDashboard size={28} />,
      user: <AiOutlineUser size={28} />,
      shop: <AiOutlineShop size={28} />,
      mail: <AiOutlineMail size={28} />,
      phone: <AiOutlinePhone size={28} />,
      globe: <AiOutlineGlobal size={28} />,
    };
    return icons[icon] || icons.link;
  };

  const handleClick = (e) => {
    e.preventDefault();
    
    // Check if it's an internal route
    if (url.startsWith('/') && !openInNewTab) {
      navigate(url);
    } else if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="link-widget h-full">
      <button
        onClick={handleClick}
        className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all group cursor-pointer"
      >
        <div
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        >
          {getIcon()}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 text-center line-clamp-2">{description}</p>
        )}
        <span className="text-[10px] sm:text-xs text-gray-400 group-hover:text-primary truncate max-w-full">
          {url}
        </span>
      </button>
    </div>
  );
};

export default LinkWidget;
