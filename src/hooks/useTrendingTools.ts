import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export function useTrendingTools() {
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_URL}/trending`);
        const data = await res.json();

        setTrending(data.tools || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrending();
  }, []);

  return trending;
}