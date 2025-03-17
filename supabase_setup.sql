
-- Создание функции для создания таблицы сохранений
CREATE OR REPLACE FUNCTION create_saves_table()
RETURNS void AS $$
BEGIN
  -- Проверяем существует ли таблица
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'game_saves'
  ) THEN
    -- Создаем таблицу
    CREATE TABLE public.game_saves (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id TEXT UNIQUE NOT NULL,
      game_data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Создаем индекс для быстрого поиска по user_id
    CREATE INDEX game_saves_user_id_idx ON public.game_saves(user_id);
    
    -- Настраиваем RLS (Row Level Security)
    ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
    
    -- Создаем политику для публичного доступа (так как используем anon key)
    -- В реальном продакшен проекте вы должны настроить более строгие политики
    CREATE POLICY "Публичный доступ к сохранениям" 
    ON public.game_saves 
    USING (true) 
    WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;
