import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lfjgwbmhjgwuvqdnpbyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmamd3Ym1oamd3dXZxZG5wYnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mjc2NjAsImV4cCI6MjA2NDEwMzY2MH0.2E27dNMiWsnly7N_iTv-A7HgDL5OpWpqENvghcEqOdE';
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
