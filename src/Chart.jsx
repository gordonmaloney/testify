import React from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";

const Chart = ({ events }) => {
	if (!events || events.length === 0) return <p>No events found.</p>;

	const countsByDay = {};

	// Count events per ISO day
	events.forEach((item) => {
		const isoDate = new Date(item.ts).toISOString().split("T")[0];
		countsByDay[isoDate] = (countsByDay[isoDate] || 0) + 1;
	});

	// Sort dates and find min/max range
	const sortedDates = Object.keys(countsByDay).sort(
		(a, b) => new Date(a) - new Date(b)
	);

	const start = new Date(sortedDates[0]);
	const end = new Date(sortedDates[sortedDates.length - 1]);

	// Helper to increment day
	const addDays = (d, n) => {
		const copy = new Date(d);
		copy.setDate(copy.getDate() + n);
		return copy;
	};

	// Fill missing days + format date
	const chartData = [];
	for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
		const iso = d.toISOString().split("T")[0];
		const count = countsByDay[iso] || 0;

		const label = d.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
		});

		chartData.push({ date: iso, label, count });
	}

	return (
		<div
			style={{
				width: "100%",
				height: 350,
				padding: "1rem",
				borderRadius: "12px",
				border: "1px solid #e5e7eb",
				background: "#ffffff",
				boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
			}}
		>
			<h3 style={{ marginBottom: "0.75rem" }}>Events per day</h3>

			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={chartData}
					margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" vertical={false} />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 12 }}
						tickMargin={8}
						interval="preserveStartEnd"
					/>
					<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
					<Tooltip
						formatter={(value) => [`${value} events`, "Count"]}
						labelFormatter={(label, payload) =>
							payload?.[0]?.payload?.date || label
						}
					/>
					<Bar dataKey="count" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default Chart;
