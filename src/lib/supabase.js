import { createClient } from '@supabase/supabase-js';

// As credenciais devem ser adicionadas em um arquivo .env.local na raiz do projeto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
