
import React from 'react';

const BuildingsPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Здания</h2>
      <div className="space-y-2">
        {/* Здесь будет список зданий */}
        <p className="text-sm text-gray-500">Доступные здания будут отображаться здесь</p>
      </div>
    </div>
  );
};

export default BuildingsPanel;
