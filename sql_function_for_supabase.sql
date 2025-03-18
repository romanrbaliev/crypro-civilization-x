
-- Функция для создания таблицы сохранений, если её не существует
CREATE OR REPLACE FUNCTION public.create_saves_table()
RETURNS void AS $$
BEGIN
  -- Проверяем существует ли таблица game_saves
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'game_saves'
  ) THEN
    -- Создаем таблицу для сохранений
    CREATE TABLE public.game_saves (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      game_data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Добавляем индекс для быстрого поиска по user_id
    CREATE INDEX idx_game_saves_user_id ON public.game_saves(user_id);
  END IF;
  
  -- Проверяем существует ли таблица referral_data
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'referral_data'
  ) THEN
    -- Создаем таблицу для реферальной системы
    CREATE TABLE public.referral_data (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      referral_code TEXT NOT NULL UNIQUE,
      referred_by TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Добавляем индексы
    CREATE INDEX idx_referral_data_user_id ON public.referral_data(user_id);
    CREATE INDEX idx_referral_data_referral_code ON public.referral_data(referral_code);
  END IF;
  
  -- Проверяем существует ли таблица referral_helpers
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'referral_helpers'
  ) THEN
    -- Создаем таблицу для системы помощников
    CREATE TABLE public.referral_helpers (
      id SERIAL PRIMARY KEY,
      helper_id TEXT NOT NULL,
      employer_id TEXT NOT NULL,
      building_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Добавляем индексы
    CREATE INDEX idx_referral_helpers_helper_id ON public.referral_helpers(helper_id);
    CREATE INDEX idx_referral_helpers_employer_id ON public.referral_helpers(employer_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Также добавим функцию для выполнения произвольного SQL
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
