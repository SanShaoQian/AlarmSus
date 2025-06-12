import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Please check your .env file and app.config.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to submit a new incident report
export const submitIncidentReport = async (reportData: {
  title: string;
  caption: string;
  emergency_type?: 'police' | 'ambulance' | 'fire' | 'others';
  is_in_danger: boolean;
  location: string;
  report_anonymously: boolean;
  image_url?: string;
  longitude: number;
  latitude: number;
}) => {
  const { data, error } = await supabase
    .from('incident_reports')
    .insert([{
      ...reportData,
      geom: `POINT(${reportData.longitude} ${reportData.latitude})`
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Function to get nearby entities
export const getNearbyEntities = async (longitude: number, latitude: number, distanceMeters: number) => {
  const { data, error } = await supabase.rpc('get_nearby_entities', {
    user_lon: longitude,
    user_lat: latitude,
    search_distance_meters: distanceMeters,
  });

  if (error) {
    console.error('Error fetching nearby entities:', error);
    return null;
  }

  return data;
};

// Function to get forum posts
export const getForumPosts = async () => {
  const { data, error } = await supabase
    .from('incident_reports')
    .select(`
      *,
      comments (
        *,
        replies (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Function to add a comment
export const addComment = async (reportId: number, userId: string, username: string, text: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      incident_report_id: reportId,
      user_id: userId,
      username,
      text
    }])
    .select()
    .single();

  if (error) throw error;

  // Update comment count
  await supabase
    .from('incident_reports')
    .update({ comment_count: supabase.raw('comment_count + 1') })
    .eq('id', reportId);

  return data;
};

// Function to add a reply
export const addReply = async (commentId: number, userId: string, username: string, text: string) => {
  const { data, error } = await supabase
    .from('replies')
    .insert([{
      comment_id: commentId,
      user_id: userId,
      username,
      text
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Function to handle user interactions (alerts, likes, dislikes, shares)
export const handleInteraction = async (
  userId: string,
  reportId: number,
  commentId: number | null,
  interactionType: 'alert' | 'like' | 'dislike' | 'share'
) => {
  const { error } = await supabase
    .from('user_interactions')
    .insert([{
      user_id: userId,
      incident_report_id: reportId,
      comment_id: commentId,
      interaction_type: interactionType
    }])
    .select();

  if (error && error.code === '23505') { // Unique violation
    // Remove the interaction
    await supabase
      .from('user_interactions')
      .delete()
      .match({
        user_id: userId,
        incident_report_id: reportId,
        comment_id: commentId,
        interaction_type: interactionType
      });

    // Update counts using rpc calls
    if (interactionType === 'alert') {
      await supabase.rpc('decrement_alert_count', { report_id: reportId });
    } else if (interactionType === 'share') {
      await supabase.rpc('decrement_share_count', { report_id: reportId });
    } else if (commentId) {
      if (interactionType === 'like') {
        await supabase.rpc('decrement_thumbs_up', { comment_id: commentId });
      } else {
        await supabase.rpc('decrement_thumbs_down', { comment_id: commentId });
      }
    }
  } else if (!error) {
    // Update counts using rpc calls
    if (interactionType === 'alert') {
      await supabase.rpc('increment_alert_count', { report_id: reportId });
    } else if (interactionType === 'share') {
      await supabase.rpc('increment_share_count', { report_id: reportId });
    } else if (commentId) {
      if (interactionType === 'like') {
        await supabase.rpc('increment_thumbs_up', { comment_id: commentId });
      } else {
        await supabase.rpc('increment_thumbs_down', { comment_id: commentId });
      }
    }
  }
};
  