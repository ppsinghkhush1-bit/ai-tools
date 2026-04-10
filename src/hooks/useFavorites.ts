import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'nexusai_session_id';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('tool_id')
        .eq('session_id', sessionId);
      setFavorites(new Set(data?.map(f => f.tool_id) || []));
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(toolId: string) {
    if (favorites.has(toolId)) {
      setFavorites(prev => { const next = new Set(prev); next.delete(toolId); return next; });
      await supabase.from('favorites').delete()
        .eq('tool_id', toolId).eq('session_id', sessionId);
    } else {
      setFavorites(prev => new Set([...prev, toolId]));
      await supabase.from('favorites').insert({ tool_id: toolId, session_id: sessionId });
    }
  }

  return { favorites, loading, toggleFavorite };
}
