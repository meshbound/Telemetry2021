/* ---------- Variables ---------- */

bool b_useSerial; bool b_useXbee;

//Xbee
const uint32_t XBEE_BAUD = 9600;


/* ---------- Init methods ---------- */

void init_serial(){
  Serial.begin(9600);
  b_useSerial = true;
}


//Xbee
void init_xbee() {
  Serial1.begin(XBEE_BAUD);

  while (!Serial1) {
    // Wait for the Xbee
  }

  b_useXbee = true;
}



/* ---------- Main methods ---------- */

void read_out(){

    if(Serial1.available() > 0){
        Serial << Serial1.read() << endl;
    }
}


void init_all() {
  
  init_serial();
  init_xbee();

  if(b_useSerial){
    Serial << "# Xbee init exited with " + String(b_xbeeResult) << endl;
  }
}

void setup() {
  init_all();
}

void loop() {
  read_out();
}
