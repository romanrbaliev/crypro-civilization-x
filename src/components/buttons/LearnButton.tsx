
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Brain } from 'lucide-react';

const LearnButton: React.FC = () => {
  const { dispatch } = useGame();
  
  const handleLearn = () => {
    dispatch({ 
      type: 'INCREMENT_RESOURCE', 
      payload: { 
        resourceId: 'knowledge', 
        amount: 1 
      } 
    });
  };
  
  return (
    <Button 
      onClick={handleLearn}
      className="w-full py-8 text-lg"
      size="lg"
    >
      <Brain className="mr-2 h-5 w-5" /> Изучить крипту
    </Button>
  );
};

export default LearnButton;
