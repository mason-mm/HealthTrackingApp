// Supabase queries for health metrics and daily logs.
import { supabase } from './supabaseClient.js';

// Returns the signed-in user's metric definitions.
export async function fetchUserMetrics() {
  const { data, error } = await supabase
    .from('user_metrics')
    .select('*');
  return { data, error };
}

// Adds a metric definition for the signed-in user.
export async function createUserMetric(name, type, targetValue) {
  const { data, error } = await supabase
    .from('user_metrics')
    .insert([{ name, type, target_value: targetValue || null }])
    .select();
  return { data, error };
}

// Returns the metric values recorded for a specific day.
export async function fetchDailyLogs(dateStr) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('log_date', dateStr);
  return { data, error };
}

// Inserts or updates one metric value for a specific day.
export async function upsertDailyLog(metricId, value, dateStr) {
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert([
      { metric_id: metricId, value: value, log_date: dateStr }
    ], { onConflict: ['user_id', 'metric_id', 'log_date'] })
    .select();
  return { data, error };
}