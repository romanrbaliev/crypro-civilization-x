
// Добавим forceUpdate в тип GameContextProps
export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  forceUpdate: () => void;  // Добавляем обязательное поле forceUpdate
}
