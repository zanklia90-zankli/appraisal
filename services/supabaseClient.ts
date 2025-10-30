
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shyhpfaiozagrhejubbk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeWhwZmFpb3phZ3JoZWp1YmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTA1MzAsImV4cCI6MjA3NzM4NjUzMH0._stuR9actxTxze_PpOo283L9j0uUL4FOrg7LWPuhLKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
