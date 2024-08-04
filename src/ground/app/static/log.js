// Set up variables
var sensor = 'all';

// setup websocket with callbacks
var ws = new ReconnectingWebSocket('ws://localhost:8080/');

ws.onopen = function() {};

ws.onclose = function() {};

ws.onmessage = function(event) {
  log(event.data);
};


var btn_autoscroll = document.getElementById("autoscroll");
var autoscroll = true;
btn_autoscroll.onclick = function() {
  if (btn_autoscroll.classList.contains('btn-outline-secondary')){
    btn_autoscroll.classList.add('btn-outline-primary');
    btn_autoscroll.classList.remove('btn-outline-secondary');
    autoscroll = true;
  } else {
    btn_autoscroll.classList.remove('btn-outline-primary');
    btn_autoscroll.classList.add('btn-outline-secondary');
    autoscroll = false;
  }
}

$(".nav .nav-item.sidebar-nav").on("click", function(){
   $(".nav").find(".active").removeClass("active");
   $(this).addClass("active");
   console.log($(this).attr('id'))
   document.getElementById('log').textContent = '';
});

// helper function: log message to screen
function log(msg) {
  document.getElementById('log').textContent += msg + '\n';
}

setInterval(function() {
  log(Math.random());
  if (autoscroll){window.scrollTo(0,document.body.scrollHeight);}
}, 100);