/* ---------- Variables ---------- */

bool b_useSerial; bool b_useXbee;

/* ---------- Init methods ---------- */

void init_serial(){
  Serial.begin(9600);
  b_useSerial = true;
}


//Xbee
void init_xbee() {
  Serial1.begin(9600);

  while (!Serial1) {
    // Wait for the Xbee
  }

  b_useXbee = true;
}



/* ---------- Main methods ---------- */

void read_out(){
  
  if(Serial1.available()){
     delay(100);  //delay to allow byte to arrive in input buffer
     Serial1.write('+');
     Serial.println(Serial1.read());
     Serial.print("test");
  }
}


void init_all() {
  
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
