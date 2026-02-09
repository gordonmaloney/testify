import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const LAT_LONG = [55.95060378138244, -3.192680273777517]


const MiniMap = ({ postcode }) => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [latLng, setLatLng] = useState(LAT_LONG)

		useEffect(() => {
			fetchPostcode()
		}, [postcode])



    const fetchPostcode = async () => {
			setLoading(true);
			setError('');

			if (!postcode) {
				return
			}

			// Normalise postcode for API
			const cleaned = postcode
				?.toUpperCase()
				.replace(/\s+/g, "") // remove spaces
				.trim();

			try {
				const res = await fetch(
					`https://api.postcodes.io/postcodes/${cleaned}`,
					{
						headers: {
							Accept: "application/json",
						},
					}
				);

				if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
				const json = await res.json();
				if (!json?.result?.latitude || !json?.result?.longitude) {
					throw new Error(`No latlng found for ${cleaned}`)
				}
				setLatLng([json.result.latitude, json.result.longitude])
			} catch (err) {
				setLatLng(LAT_LONG)
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

	return (
		<MapContainer
			center={latLng}
			zoom={11}
			style={{ height: "100%", width: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

		{!loading && !error && (
			<Marker
				key='event-location'
				position={latLng}
			>

			</Marker>
		)}
		</MapContainer>
	);
};

export default MiniMap;
