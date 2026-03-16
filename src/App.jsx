import { useEffect, useMemo, useState } from "react";

import { DummyData } from "./DummyData";
import MiniMap from "./components/MiniMap";
import Chart from "./components/Chart";
import Controls from "./components/Controls";
import EventCard from "./components/EventCard";
import TwoFactorModal from "./components/TwoFactorModal";

/**
 * Barebones React (Vite) frontend to:
 *  - enter password (Bearer token)
 *  - optionally enter site + limit
 *  - fetch from https://tenantactapi.vercel.app/api/fetch
 *  - render events
 *
 * Usage with Vite:
 *  1) `npm create vite@latest tenantact-admin -- --template react`
 *  2) Replace src/App.jsx with this file's contents (or create a new component and import it in App.jsx)
 *  3) `npm i`
 *  4) `npm run dev`
 */
const API_BASE = import.meta.env.VITE_API_BASE; // set in .env file


export default function App() {
  const [password, setPassword] = useState("");
  const [site, setSite] = useState("");
  const [type, setType] = useState("");
  const [path, setPath] = useState("");
  const [limit, setLimit] = useState(20);
  const [events, setEvents] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);

  // load/save password locally so you don't retype during dev
  useEffect(() => {
    const saved = localStorage.getItem("ta_admin_pwd");
    if (saved) setPassword(saved);
  }, []);
  useEffect(() => {
    if (password) localStorage.setItem("ta_admin_pwd", password);
  }, [password]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (site) p.set("site", site);
    if (limit) p.set("limit", String(limit));
    if (type) p.set("type", type)
    if (path) p.set("path", path)
    return p.toString();
  }, [site, limit, type, path]);

  async function fetchEvents(overwritingCode) {
    setLoading(true);
    setError("");
    try {
      const headers = {
        Authorization: `Bearer ${password}`,
        Accept: "application/json",
      };

      const activeCode = overwritingCode || tfaCode;
      if (activeCode) {
        headers["X-2f-Code"] = activeCode;
      }

      const res = await fetch(`${API_BASE}/api/fetch?${query}`, {
        headers,
      });

      if (!res.ok) {
        const text = await res.text();
        
        // Handle 2FA challenges (both 401 and the specific 500 error)
        if (res.status === 401 && text.toLowerCase().includes("2fa")) {
          setShow2FAModal(true);
          setLoading(false);
          return;
        }

        if (text.includes("Token must be 6 digits")) {
          setShow2FAModal(true);
          setLoading(false);
          return;
        }

        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }
      const json = await res.json();
      setEvents(json.events || []);
    } catch (e) {
      setError(e.message || String(e));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //setEvents(DummyData);
  }, [error]);

  return (
    <main className="min-h-screen min-w-screen bg-gray-50 text-gray-900 lg:grid lg:grid-cols-3 lg:gap-4">
      <div className="bg-gray-800 text-white">
        <div className="lg:sticky lg:top-0 lg:flex lg:flex-col lg:min-h-screen">
          <div className="p-4 flex flex-col gap-2">
            <h1 className="text-2xl font-bold">
              TenantAct: Admin Viewer
            </h1>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs uppercase font-medium text-gray-500">Bearer Password</label>
              <input
                className="md:flex-1 rounded-sm	 border px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"
                placeholder="Bearer password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Chart
            events={events}
          />
          <div className="w-full h-64 lg:mt-auto xl:h-96">
            <MiniMap postcode={postcode} />
          </div>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 pb-12 lg:col-span-2 lg:pr-4">
        <Controls
          password={password}
          setPassword={setPassword}
          site={site}
          setSite={setSite}
          type={type}
          setType={setType}
          path={path}
          setPath={setPath}
          limit={limit}
          setLimit={setLimit}
          onFetch={fetchEvents}
          loading={loading}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-sm text-gray-500">
            No events. Try lowering filters or adding data.
          </div>
        )}

        {loading && (
          <div className="text-sm text-gray-500">Loading events…</div>
        )}

        {events.map((ev) => (
          <EventCard key={ev._id} ev={ev} setPostcode={setPostcode} />
        ))}
      </div>

      <TwoFactorModal
        isOpen={show2FAModal}
        onCancel={() => setShow2FAModal(false)}
        onSubmit={(code) => {
          setTfaCode(code);
          setShow2FAModal(false);
          // Pass the code directly to avoid closure/stale state issues
          fetchEvents(code);
        }}
      />
    </main>
  );
}
