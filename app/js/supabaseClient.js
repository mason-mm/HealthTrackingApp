// Creates the browser-safe Supabase client; never put service keys here.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://jorflcfgdaaeqglmmlrz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nc6-ziPm4VKdqZi8iWFqQA_X0ppAPTj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);