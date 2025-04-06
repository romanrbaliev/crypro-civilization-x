
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigateToGame: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/game');
  }, [navigate]);
  
  return <div>Перенаправление на игру...</div>;
};

export default NavigateToGame;
