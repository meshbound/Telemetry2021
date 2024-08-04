void init_serial(){
  Serial.begin(9600);
}

void init_xbee() {
  Serial1.begin(9600);
  while (!Serial1) {
    delay(100);
  }
}

void read_out(){
  if(Serial1.available()){
     delay(100);
     Serial1.write('+');
     Serial.println(Serial1.read());
  }
}


void init_all) { 
  init_serial();
  init_xbee();
  Serial.println("# Xbee successfully initalized");
}

void setup() {
  init_all();
}

void loop() {
  read_out();
}
