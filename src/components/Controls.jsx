import { useEffect, useState } from "react";
import sites from "../data/sites";

export default function Controls({
  password,
  setPassword,
  site,
  setSite,
  type,
  setType,
  path,
  setPath,
  limit,
  setLimit,
  onFetch,
  loading,
}) {
  const [types, setTypes] = useState([])
  const [paths, setPaths] = useState([])

  useEffect(() => {
    setTypes(sites.find(s => s.id === site)?.types ?? [])
  }, [site])
  useEffect(() => {
    setPaths(sites.find(s => s.id === site)?.paths ?? [])
  }, [site])

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="p-4 flex flex-col gap-3 md:flex-row">
        <input
          className="md:flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="password"
          placeholder="Bearer password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        >
          <option value="">All Sites</option>
          {sites.map(site => (
            <option value={site.id} key={site.id}>{site.name}</option>
          ))}
        </select>
        <select
          className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map(type => (
            <option value={type.id} key={type.id}>{type.name}</option>
          ))}
        </select>
        <select
          className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        >
          <option value="">All Paths</option>
          {paths.map(path => (
            <option value={path.id} key={path.id}>{path.name}</option>
          ))}
        </select>
        <input
          className="flex-initial rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="number"
          min={1}
          max={200}
          placeholder="limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value || 0))}
        />
        <button
          onClick={onFetch}
          disabled={loading || !password}
          className="flex-initial rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Fetch"}
        </button>
      </div>
    </div>
  );
}