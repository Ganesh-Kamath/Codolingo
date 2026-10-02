import { createClient } from '@supabase/supabase-js';
import type { UserProfile, MistakeRecord } from '../types';

// These should be configured in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- User Progress API ---

export const fetchUserProgress = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('userId', userId)
    .single();

  if (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
  return data as UserProfile;
};

export const updateUserProgress = async (userId: string, progress: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('user_progress')
    .update(progress)
    .eq('userId', userId);

  if (error) {
    console.error('Error updating user progress:', error);
  }
};

export const fetchUserMistakes = async (userId: string): Promise<MistakeRecord[]> => {
  const { data, error } = await supabase
    .from('user_mistakes')
    .select('*')
    .eq('userId', userId);

  if (error) {
    console.error('Error fetching user mistakes:', error);
    return [];
  }
  return data as MistakeRecord[];
};

export const upsertMistake = async (userId: string, mistake: MistakeRecord) => {
  const { error } = await supabase
    .from('user_mistakes')
    .upsert({ ...mistake, userId });

  if (error) {
    console.error('Error upserting mistake:', error);
  }
};
