
import React from 'react';

const EventsPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">События</h2>
      <div className="space-y-2">
        {/* Здесь будет лог событий */}
        <p className="text-sm text-gray-500">События игры будут отображаться здесь</p>
      </div>
    </div>
  );
};

export default EventsPanel;
