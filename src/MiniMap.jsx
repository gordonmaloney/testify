import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";




const MiniMap = ({ postcode }) => {

    const [fetched, setFetched] = useState(false)

      const [data, setData] = useState(null);
			const [loading, setLoading] = useState(false);
			const [error, setError] = useState(null);

			// 🔹 Normalise postcode for API
			const cleaned = postcode
				?.toUpperCase()
				.replace(/\s+/g, "") // remove spaces
				.trim();


    const fetchPostcode = async () => {
                    				if (!cleaned) return;

					setLoading(true);
					setError(null);

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
                        setData(json);
                        setFetched(true)
					} catch (err) {
						setError(err.message);
					} finally {
						setLoading(false);
					}
				};

    
    
    
    
    if (!fetched) {
        return <button
        onClick={() => 				fetchPostcode()
}
        >Show on map</button>
    }
    
    if (fetched && !data) {
        return<>Loading...</>
    }


	return (
		<div>
			<MapContainer
				center={[data?.result.latitude, data?.result.longitude]}
				zoom={13}
				style={{ height: "250px", width: "250px" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				<Marker
					key='test'
					position={[data?.result.latitude, data?.result.longitude]}
				>
					
				</Marker>
			</MapContainer>
		</div>
	);
};

export default MiniMap;
