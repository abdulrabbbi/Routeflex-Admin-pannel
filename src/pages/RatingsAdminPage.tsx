import React from "react";
import { FiRefreshCcw, FiSearch  } from "react-icons/fi";
import RatingsTable from "../components/ratings/RatingsTables";
import { useRatings } from "../hooks/useRatings";

const RatingsAdminPage: React.FC = () => {
  const {
    data,           
    loading,
    error,
    refresh,
    q, setQ,
    minScore, setMinScore,
    maxScore, setMaxScore,
    sort, setSort,

    page, setPage,
    totalPages,
  } = useRatings({ page: 1, limit: 10, sort: "-createdAt" });

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        {/* Header / filters */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">Ratings</h1>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search comments…"
                className="h-9 w-56 rounded-lg bg-gray-50 pl-9 pr-3 text-sm outline-none ring-1 ring-gray-200"
              />
            </div>

            <select
              className="h-9 rounded-lg bg-white text-sm ring-1 ring-gray-200 px-2"
              value={String(minScore ?? "")}
              onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
              title="Min score"
            >
              <option value="">Min ★</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select
              className="h-9 rounded-lg bg-white text-sm ring-1 ring-gray-200 px-2"
              value={String(maxScore ?? "")}
              onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : undefined)}
              title="Max score"
            >
              <option value="">Max ★</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select
              className="h-9 rounded-lg bg-white text-sm ring-1 ring-gray-200 px-2"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              title="Sort"
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="-score">Top rated</option>
              <option value="score">Lowest rated</option>
            </select>

            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              <FiRefreshCcw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5">
          <RatingsTable
            items={data || []}
            loading={loading}
            onRefresh={refresh}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p: number) => Math.max(1, p - 1))}
            onNext={() => setPage((p: number) => Math.min(totalPages || 1, p + 1))}
          />
        </div>
      </div>
    </div>
  );
};

export default RatingsAdminPage;
