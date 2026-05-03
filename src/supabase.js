import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://npxsclxjumvbcsxccttt.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHNjbHhqdW12YmNzeGNjdHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjYyNTAsImV4cCI6MjA4OTYwMjI1MH0.JQOZ-zc45y2Mxbn9_rU4EUFG2POAhVCgbskPScnAUYY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
