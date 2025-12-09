import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hhfqagkwosvmyxbcjmvs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZnFhZ2t3b3N2bXl4YmNqbXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTkyODYsImV4cCI6MjA3ODEzNTI4Nn0.vz7LgX2P_epncLt8q0iZGHAnKPdDiOv7sK7JMkPyJI0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
