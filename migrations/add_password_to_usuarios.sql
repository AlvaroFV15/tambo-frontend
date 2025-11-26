ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS password text;
