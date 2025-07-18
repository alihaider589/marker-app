import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../lib/supabase';

export interface Pin {
  id?: string;
  latitude: number;
  longitude: number;
  note: string;
  created_at?: string;
}

export function usePins() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user from Redux store
  const { user } = useSelector((state: any) => state.auth);

  // Load pins from database
  const loadPins = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPins(data || []);
    } catch (err: any) {
      console.error('Error loading pins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new pin
  const addPin = async (latitude: number, longitude: number, note: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const newPin = {
        user_id: user.id,
        latitude,
        longitude,
        note: note.trim(),
      };

      const { data, error } = await supabase
        .from('pins')
        .insert([newPin])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setPins(prevPins => [data, ...prevPins]);
      return data;
    } catch (err: any) {
      console.error('Error adding pin:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a pin
  const deletePin = async (pinId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('pins')
        .delete()
        .eq('id', pinId)
        .eq('user_id', user.id); // Ensure user can only delete their own pins

      if (error) throw error;

      // Remove from local state
      setPins(prevPins => prevPins.filter(pin => pin.id !== pinId));
    } catch (err: any) {
      console.error('Error deleting pin:', err);
      setError(err.message);
      throw err;
    }
  };

  // Update a pin (for future use)
  const updatePin = async (pinId: string, updates: Partial<Pin>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('pins')
        .update(updates)
        .eq('id', pinId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPins(prevPins => 
        prevPins.map(pin => pin.id === pinId ? data : pin)
      );
      return data;
    } catch (err: any) {
      console.error('Error updating pin:', err);
      setError(err.message);
      throw err;
    }
  };

  // Load pins when user changes
  useEffect(() => {
    if (user?.id) {
      loadPins();
    } else {
      setPins([]);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    pins,
    loading,
    error,
    addPin,
    deletePin,
    updatePin,
    refreshPins: loadPins,
    clearError: () => setError(null),
  };
} 