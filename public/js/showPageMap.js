mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [72.8691, 19.2856], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

var marker = new mapboxgl.Marker({
    color: "#FF0000",
    draggable: true
}).setLngLat([72.8691, 19.2856])
    .addTo(map);