// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://lrwlqhiwcbhrnqoisprs.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2xxaGl3Y2Jocm5xb2lzcHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MzA4MDYsImV4cCI6MjA2ODIwNjgwNn0.Ee8Shi9_Jk3iG9JBVZs8wF8mv1_IYHjyjAKoeggOiNI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
