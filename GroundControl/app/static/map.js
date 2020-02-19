var map = L.map('map').setView([34.72, -86.59], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

var circle = L.circle([34.7267, -86.5902], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 10
}).addTo(map)
