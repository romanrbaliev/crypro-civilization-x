
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
  
  -- Проверяем существование таблицы referral_data
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'referral_data'
  ) THEN
    -- Создаем таблицу реферальных данных
    CREATE TABLE public.referral_data (
      user_id TEXT PRIMARY KEY,
      referral_code TEXT UNIQUE NOT NULL,
      referred_by TEXT REFERENCES public.referral_data(referral_code),
      is_activated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Создаем индексы
    CREATE INDEX referral_data_referral_code_idx ON public.referral_data(referral_code);
    CREATE INDEX referral_data_referred_by_idx ON public.referral_data(referred_by);
    
    -- Настраиваем RLS
    ALTER TABLE public.referral_data ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Публичный доступ к реферальным данным" 
    ON public.referral_data 
    USING (true) 
    WITH CHECK (true);
  ELSE
    -- Если таблица существует, но поле is_activated отсутствует, добавляем его
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'referral_data' 
      AND column_name = 'is_activated'
    ) THEN
      ALTER TABLE public.referral_data ADD COLUMN is_activated BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
  
  -- Проверяем существование таблицы referral_helpers
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'referral_helpers'
  ) THEN
    -- Создаем таблицу помощников рефералов
    CREATE TABLE public.referral_helpers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      employer_id TEXT NOT NULL REFERENCES public.referral_data(user_id),
      helper_id TEXT NOT NULL REFERENCES public.referral_data(user_id),
      building_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Создаем индексы
    CREATE INDEX referral_helpers_employer_id_idx ON public.referral_helpers(employer_id);
    CREATE INDEX referral_helpers_helper_id_idx ON public.referral_helpers(helper_id);
    
    -- Настраиваем RLS
    ALTER TABLE public.referral_helpers ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Публичный доступ к помощникам" 
    ON public.referral_helpers 
    USING (true) 
    WITH CHECK (true);
  END IF;
  
  -- Создаем функцию для генерации уникального реферального кода
  IF NOT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'generate_unique_ref_code'
  ) THEN
    CREATE OR REPLACE FUNCTION public.generate_unique_ref_code()
    RETURNS TEXT
    LANGUAGE plpgsql
    AS $$
    DECLARE
      new_code TEXT;
    BEGIN
      LOOP
        -- Генерируем 8-значный шестнадцатеричный код
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Проверяем, что код уникальный
        EXIT WHEN NOT EXISTS (
          SELECT 1 FROM public.referral_data WHERE referral_code = new_code
        );
      END LOOP;
      
      RETURN new_code;
    END;
    $$;
  END IF;
END;
$$ LANGUAGE plpgsql;
