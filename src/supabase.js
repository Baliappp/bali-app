import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://noyscrourcvnzekqeodu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veXNjcm91cmN2bnpla3Flb2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjQ0MjUsImV4cCI6MjA5ODg0MDQyNX0.GD5fiSPIViXEF0DgZRbEW-okEQZoL4F801NeDM_UAdI";

export const supabase = createClient(supabaseUrl, supabaseKey);
