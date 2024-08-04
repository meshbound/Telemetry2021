od_alt = new Odometer({
  el:$('#altitude_od')[0],
  value:600,
  format:'(,ddd).dd'
});

console.log(values['altitude'])
setInterval(function() {
  od_alt.update(values['Altitude']);
}, 100);
