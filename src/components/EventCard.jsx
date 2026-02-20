function safeStr(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") return val || "—";
  return JSON.stringify(val);
}

export default function EventCard({ ev, setPostcode }) {
  const cd =
    typeof ev.contactDeets === "object" &&
    ev.contactDeets !== null &&
    !ev.contactDeets.alg
      ? ev.contactDeets
      : {};

  function prettyTs(ts) {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  }
  const date = prettyTs(ev?.ts ?? "");
  return (
    <div className="flex flex-col items-start gap-4 p-4 bg-gray-200">
      <div class="flex justify-between gap-4 w-full">
        <h1>
          <div className="text-lg font-bold">{safeStr(cd.name)}</div>
          <div className="text-sm">
            {date} — {safeStr(ev.campaignId)}
          </div>
        </h1>
        <div className="font-mono text-sm text-gray-500">
          {safeStr(ev.site)} | {safeStr(ev.type)} | {safeStr(ev.path)}
        </div>
      </div>
      {cd.name && (
        <table className="table-auto font-mono flex flex-col gap-1 text-gray-700 text-left">
          <tbody>
            <tr>
              <th class="pr-4">Name</th>
              <td>{safeStr(cd.name)}</td>
            </tr>
            <tr>
              <th class="pr-4">Email</th>
              <td>{safeStr(cd.email)}</td>
            </tr>
            <tr>
              <th class="pr-4">Phone</th>
              <td>{safeStr(cd.number || cd.phone)}</td>
            </tr>
            <tr>
              <th class="pr-4">Postcode</th>
              <td>{safeStr(cd.postcode)}</td>
            </tr>
          </tbody>
        </table>
      )}

      {cd.postcode && (
        <button
          className="p-2 border border-gray-800 rounded-sm flex gap-1 items-center hover:bg-gray-800 hover:text-white"
          onClick={() => setPostcode(cd.postcode)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M529.75-508.04q20.63-20.54 20.63-49.65 0-29.12-20.63-49.75-20.63-20.64-49.75-20.64t-49.65 20.64q-20.54 20.63-20.54 49.75 0 29.11 20.54 49.65Q450.88-487.5 480-487.5q29.12 0 49.75-20.54ZM480-181.88Q595.46-286.65 656.67-382.1q61.21-95.44 61.21-166.86 0-108.08-68.19-177.58-68.19-69.5-169.69-69.5t-169.69 69.5q-68.19 69.5-68.19 177.58 0 71.42 61.21 166.86Q364.54-286.65 480-181.88Zm0 74.19Q332.54-237.42 259.35-347.14q-73.19-109.71-73.19-201.82 0-135.04 87.3-218.85 87.31-83.8 206.54-83.8 119.23 0 206.54 83.8 87.3 83.81 87.3 218.85 0 92.11-73.19 201.82Q627.46-237.42 480-107.69Zm0-450Z" />
          </svg>
          <span>Show on Map</span>
        </button>
      )}

      {ev.testimonial ? (
        <details className="mt-3">
          <summary className="cursor-pointer select-none">Testimonial</summary>
          <div className="mt-2 whitespace-pre-wrap break-words bg-gray-300 p-4 text-sm">
            {typeof ev.testimonial === "string"
              ? ev.testimonial
              : JSON.stringify(ev.testimonial, null, 2)}
          </div>
        </details>
      ) : null}
    </div>
  );
}
