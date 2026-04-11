
mapboxgl.accessToken = mapToken;

const coordinates = listing?.geometry?.coordinates;
const hasValidCoordinates =
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every((value) => Number.isFinite(value));

if (hasValidCoordinates) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 8,
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h5>${listing.location}</h5><p>Exact location provided will be after the booking.</p>`
      )
    )
    .addTo(map);
} else {
  const mapContainer = document.getElementById("map");

  if (mapContainer) {
    mapContainer.innerHTML =
      "<p style='margin:0;padding:1rem;color:#666;'>Location coordinates are unavailable for this listing.</p>";
  }
}
