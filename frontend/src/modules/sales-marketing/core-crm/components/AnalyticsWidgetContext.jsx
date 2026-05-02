import React, { createContext, useContext, useState } from 'react';

const AnalyticsWidgetContext = createContext(null);

export const useAnalyticsWidget = () => useContext(AnalyticsWidgetContext);

export const AnalyticsWidgetProvider = ({ children, initial = {} }) => {
  const defaultSettings = {
    title: initial.title || 'AI Predictive Analytics',
    widthSpan: initial.widthSpan || 1, // grid column span hint (1..3)
    heightPx: initial.heightPx || 240,
    chartType: initial.chartType || 'line', // 'line' | 'bar'
    showLegend: typeof initial.showLegend === 'boolean' ? initial.showLegend : true,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isModalOpen, setModalOpen] = useState(false);

  const saveSettings = (patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  return (
    <AnalyticsWidgetContext.Provider value={{ settings, saveSettings, isModalOpen, setModalOpen }}>
      {children}
    </AnalyticsWidgetContext.Provider>
  );
};

export default AnalyticsWidgetContext;
