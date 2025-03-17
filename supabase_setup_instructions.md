
# Настройка Supabase для хранения прогресса игры

## Создание проекта в Supabase

1. Зарегистрируйтесь или войдите в [Supabase](https://supabase.com/)
2. Создайте новый проект
3. Запишите `URL` и `anon key` проекта (они понадобятся для настройки приложения)

## Настройка базы данных

1. Откройте SQL-редактор в панели Supabase
2. Выполните следующий SQL-запрос для создания таблицы сохранений:

```sql
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

-- Вызываем функцию для создания таблицы
SELECT create_saves_table();
```

3. Перейдите в раздел "Table Editor" и проверьте, что таблица `game_saves` успешно создана

## Настройка приложения

1. В файле `src/api/gameDataService.ts` обновите следующие константы:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Замените на URL вашего проекта
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Замените на anon key вашего проекта
```

2. Запустите приложение и проверьте сохранение/загрузку игры

## Проверка работы

1. После игры в течение некоторого времени, проверьте таблицу `game_saves` в Supabase
2. Вы должны увидеть записи с данными игры для каждого пользователя
3. При перезагрузке приложения или повторном входе, прогресс должен восстанавливаться из Supabase

## Безопасность

В текущей конфигурации используется анонимный ключ Supabase и открытая политика доступа. Для продакшена рекомендуется:

1. Настроить аутентификацию пользователей
2. Обновить политики RLS для ограничения доступа только к своим данным
3. Использовать JWT-токены вместо анонимного ключа
