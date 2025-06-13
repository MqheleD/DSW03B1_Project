import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yeunseefawttrbpjoypw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldW5zZWVmYXd0dHJicGpveXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjAwOTAsImV4cCI6MjA2MzU5NjA5MH0.UYBhH9DbYBa6mANuDnH3sW30BYaKQ2MYG350ZZhArzU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);