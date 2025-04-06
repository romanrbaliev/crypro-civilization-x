
import React from 'react';

const ActionsPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Действия</h2>
      <div className="space-y-2">
        {/* Здесь будут кнопки действий */}
        <p className="text-sm text-gray-500">Доступные действия будут отображаться здесь</p>
      </div>
    </div>
  );
};

export default ActionsPanel;
