import { useCallback, useEffect, useState } from "react";
import { getAllRatings, RatingRow } from "../api/rating";

export function useRatings(initial = { page: 1, limit: 10, sort: "-createdAt" as string }) {
  const [page, setPage] = useState(initial.page);
  const [limit, setLimit] = useState(initial.limit);
  const [sort, setSort] = useState(initial.sort);
  const [q, setQ] = useState("");
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [maxScore, setMaxScore] = useState<number | undefined>(undefined);

  const [data, setData] = useState<RatingRow[]>([]);
  const [results, setResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, meta } = await getAllRatings({ page, limit, sort, q, minScore, maxScore });
      setData(items || []);
      setResults(meta?.total ?? items.length);
      setTotalPages(meta?.totalPages ?? 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load ratings.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, q, minScore, maxScore]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const refresh = useCallback(() => fetchList(), [fetchList]);

  return {
    data, results, totalPages, page, setPage, limit, setLimit, sort, setSort,
    q, setQ, minScore, setMinScore, maxScore, setMaxScore,
    loading, error, refresh,
  };
}
