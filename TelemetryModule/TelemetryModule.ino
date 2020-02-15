/* Imports */

#include <Wire.h>
#include <SPI.h>
#include <SD.h>

#include <Streaming.h>
#include <PString.h>
#include <Time.h>
#include <TimeLib.h>
#include <SoftTimers.h>

#include <Adafruit_BMP280.h>
#include <Adafruit_CCS811.h>
#include <Adafruit_MPL3115A2.h>
#include <Adafruit_GPS.h>
#include <Adafruit_BNO055.h>

/* ---------- Sensors ---------- */

// BMP280
Adafruit_BMP280 bmp;
Adafruit_Sensor *bmp_temp = bmp.getTemperatureSensor();
Adafruit_Sensor *bmp_pressure = bmp.getPressureSensor();

// CCS811
Adafruit_CCS811 ccs;

// MPL3115A2
Adafruit_MPL3115A2 baro = Adafruit_MPL3115A2();

// BNO055
Adafruit_BNO055 bno = Adafruit_BNO055();

// SD Card
const uint8_t SELECT_SLVE = 53;

// GPS
Adafruit_GPS GPS(&Serial3);

/* ---------- Variables ---------- */

bool b_useSerial; bool b_useXbee;

bool b_testResult; bool b_xbeeResult; bool b_sdResult; bool b_GPSResult;

bool b_usebmp; bool b_useccs; bool b_usebaro; bool b_usebno;

char c, d;

// Buzzer
const uint8_t BUZZER_PIN = LED_BUILTIN;

//Xbee
const uint32_t XBEE_BAUD = 9600;
const int8_t OFFSET_TIME = -6;
const char DELIMITER[] = ",";

//GPS
bool GPS_SKIP = false;
const uint16_t ADAGPS_BAUD = 9600;

//Logfile
File logfile;

//Buffer
#define MAX_BUFFER 256
uint8_t decoded_buffer[MAX_BUFFER];

//Timers
uint32_t START_TIME, START_TIME_GPS;
SoftTimer timeoutINIT;

//States
enum State {WAIT, ARM, RUN, READY, SHUTDOWN, ERR};
State state = WAIT;


/* ---------- Debug methods ---------- */

bool init_sensors(){

  b_usebmp = init_bmp();
  b_useccs = init_ccs();
  b_usebaro = init_baro();
  b_usebno = init_bno();
  
  bool test = b_usebmp && b_useccs && b_usebaro && b_usebno;
  b_testResult = test;

  return test;
}

void init_serial(){
  Serial.begin(9600);
  b_useSerial = true;
}

/* ---------- Time ---------- */

void init_time() {
  START_TIME = millis();
  START_TIME_GPS = getTime();

  if(b_useXbee){
    Serial1 << "# Initialized GPS Time (ms): " << START_TIME_GPS << endl;
    Serial1 << "# Initialized Millis Start Time (ms): " << START_TIME << endl;
    Serial1 << "# Initalization Time (ms): " << millis() << endl;
  }
  
}

PString getTimestamp(uint16_t memSize = 50, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true) {
  uint32_t elapsedTime = millis() - START_TIME;
  uint32_t inputMillis = elapsedTime + START_TIME_GPS;

  uint16_t hours = inputMillis / 3600000;
  inputMillis -= (3600000 * hours);

  uint8_t minutes = inputMillis / 60000;
  inputMillis -= (60000 * minutes);

  uint8_t seconds = inputMillis / 1000;
  inputMillis -= (1000 * seconds);

  char buffer[memSize];
  PString dataTime(buffer, sizeof(buffer));

  dataTime << hours << ":" << minutes << ":" << seconds << "."
           << inputMillis << DELIMITER << elapsedTime;

  return dataTime;
}

uint32_t getTime() {
  prepareParseGPS();
  uint16_t milliseconds = GPS.milliseconds;
  uint8_t days = GPS.day;
  uint8_t seconds = GPS.seconds;
  uint8_t minutes = GPS.minute;
  int8_t hours = GPS.hour + OFFSET_TIME;

  if (hours < 0) {
    hours = 24 + hours;
    days -= 1;
  }
  if (hours > 23) {
    hours = 24 - hours;
    days += 1;
  }

  setTime(hours, minutes, seconds, days, GPS.month, GPS.year + 2000);
  Serial1 << "# Date (mm/dd/yyyy): " << month() << "/" << day() << "/" << year() << endl;
  return ((hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds);
}

/* ---------- Sensor methods ---------- */

// BMP280
boolean init_bmp(){
  if (!bmp.begin()){

    if (b_useSerial){
      Serial << "# BMP280 failed to initalize" << endl;
    }
    if (b_useXbee){
      Serial1 << "# BMP280 failed to initalize" << endl;
    }

    return false;
  }

  /* Default settings from datasheet. */
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     /* Operating Mode. */
                  Adafruit_BMP280::SAMPLING_X2,     /* Temp. oversampling */
                  Adafruit_BMP280::SAMPLING_X16,    /* Pressure oversampling */
                  Adafruit_BMP280::FILTER_X16,      /* Filtering. */
                  Adafruit_BMP280::STANDBY_MS_500); /* Standby time. */

  return true;
}

void request_bmp(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true){
  char buffer[memSize];
  PString dataBMP(buffer, sizeof(buffer));

  sensors_event_t temp_event;
  bmp_temp->getEvent(&temp_event);

  dataBMP << "!!" << DELIMITER << getTimestamp() << DELIMITER << temp_event.temperature << endl;
  write_to_locations(serialPrint,sdPrint,xbeePrint,dataBMP);
}

//CCS811
boolean init_ccs(){
  if (!ccs.begin()) {

    if (b_useSerial) {
      Serial << "# CCS811 failed to initalize" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# CCS811 failed to initalize" << endl;
    }

    return false;
  }

  while (!ccs.available());
  return true;
}

void request_ccs(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true) {
  if (ccs.available()){
    char buffer[memSize];
    PString dataCCS(buffer, sizeof(buffer));

    dataCCS << "@@" << DELIMITER << getTimestamp()  << DELIMITER << ccs.geteCO2() << DELIMITER << ccs.getTVOC() << endl;
    write_to_locations(serialPrint,sdPrint,xbeePrint,dataCCS);
  }
}

//MPL3115A2
boolean init_baro(){
  if (!baro.begin()) {

    if (b_useSerial) {
      Serial << "# MPL3115A2 failed to initalize" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# MPL3115A2 failed to initalize" << endl;
    }

    return false;
  }
  
  return true;
}

void request_baro(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true) {
  char buffer[memSize];
  PString dataBARO(buffer, sizeof(buffer));

  dataBARO << "##" << DELIMITER << baro.getPressure()  << DELIMITER << baro.getAltitude() << endl;
  write_to_locations(serialPrint,sdPrint,xbeePrint,dataBARO);
}

//BNO055
boolean init_bno(){
  if (!bno.begin()) {

    if (b_useSerial) {
      Serial << "# BNO055 failed to initalize" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# BNO055 failed to initalize" << endl;
    }
    
    return false;
  }

  bno.setExtCrystalUse(true);
  return true;
}

void request_bno(uint16_t memSize = 210, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true) {
  char buffer[memSize];
  PString dataBNO(buffer, sizeof(buffer));

  imu::Quaternion quat = bno.getQuat();
  dataBNO << "%%" << DELIMITER << getTimestamp() << DELIMITER << quat.w() << DELIMITER << quat.x()
          << DELIMITER << quat.y() << DELIMITER << quat.z() << DELIMITER;

  imu::Vector<3> mag = bno.getVector(Adafruit_BNO055::VECTOR_MAGNETOMETER);
  dataBNO << mag.x() << DELIMITER << mag.y() << DELIMITER << mag.z() << DELIMITER;

  imu::Vector<3> gyro = bno.getVector(Adafruit_BNO055::VECTOR_GYROSCOPE);
  dataBNO << gyro.x() << DELIMITER << gyro.y() << DELIMITER << gyro.z() << DELIMITER;

  imu::Vector<3> accel = bno.getVector(Adafruit_BNO055::VECTOR_ACCELEROMETER);
  dataBNO << accel.x() << DELIMITER << accel.y() << DELIMITER << accel.z() << endl;

  write_to_locations(serialPrint,sdPrint,xbeePrint,dataBNO);
}

//GPS
void init_gps() {
  
  GPS.begin(ADAGPS_BAUD);
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
  GPS.sendCommand(PGCMD_ANTENNA);

  delay(1000);
  // while (!Serial3) {}
  Serial3.println(PMTK_Q_RELEASE);
  
  b_GPSResult = true;
}

void prepareParseGPS(){
   char g = GPS.read();
   //Serial.write(g);
   if (GPS.newNMEAreceived()) {
     if (!GPS.parse(GPS.lastNMEA())) {
        return;
     }
  }
}

void request_gps(uint16_t memSize = 200, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true) {
  if (Serial3.available()) {
    
    char buffer[memSize];
    PString dataGPS(buffer, sizeof(buffer));
    
    dataGPS << "$$" << DELIMITER << getTimestamp() << DELIMITER << GPS.hour << DELIMITER << GPS.minute << DELIMITER << GPS.seconds << DELIMITER
            << GPS.milliseconds << DELIMITER << GPS.day << DELIMITER << GPS.month << DELIMITER
            << GPS.year << DELIMITER << (uint8_t)GPS.fix << DELIMITER << (uint8_t)GPS.fixquality << DELIMITER
            << GPS.latitude << DELIMITER << (int32_t)GPS.lat << DELIMITER << GPS.longitude << DELIMITER
            << (int32_t)GPS.lon << DELIMITER << GPS.speed << DELIMITER << GPS.angle << DELIMITER
            << GPS.altitude << DELIMITER << GPS.satellites << endl;

    write_to_locations(serialPrint,sdPrint,xbeePrint,dataGPS);
  }
}

//Xbee
void init_xbee() {
  Serial1.begin(XBEE_BAUD);

  while (!Serial1) {
    // Wait for the Xbee
  }

  b_useXbee = true;
}

//SD
void init_sd() {
  if (!SD.begin(SELECT_SLVE)) {
    return;
  }

  char filename[] = "FLIGHT00.CSV";
  for (uint8_t i = 0; i < 100; i++) {
    filename[6] = i / 10 + '0';
    filename[7] = i % 10 + '0';
    if (!SD.exists(filename)) {
      logfile = SD.open(filename, FILE_WRITE);
      break;
    }
  }

  if (!logfile) {
    return;
  }

  if (b_useSerial) {
    Serial << "# Logging to: " << filename << endl;
  }
  if (b_useXbee) {
    Serial1 << "# Logging to: " << filename << endl;
  }

  b_sdResult = true;
}


void write_to_locations(bool serialPrint, bool sdPrint, bool xbeePrint, PString data){
  if (serialPrint == true) {
      Serial << data;
    }

    if (sdPrint == true) {
      logfile << data;
    }

    if (xbeePrint == true) {
      Serial1 << data;
    }
}

/* ---------- Main methods ---------- */

void init_all() {
  
  init_serial();
  init_xbee();
  init_sd();
  init_gps();
  init_sensors();

  if(b_useSerial){
    Serial << "# Sensors init exited with " + String(b_testResult) << endl;
    Serial << "# Xbee init exited with " + String(b_xbeeResult) << endl;
    Serial << "# SD init exited with " + String(b_sdResult) << endl;
    Serial << "# GPS init exited with " + String(b_GPSResult) << endl;
  }
  if(b_useXbee){
    Serial1 << "# Sensors init exited with " + String(b_testResult) << endl;
    Serial1 << "# Xbee init exited with " + String( b_xbeeResult) << endl;
    Serial1 << "# SD init exited with " + String(b_sdResult) << endl;
    Serial1 << "# GPS init exited with " + String(b_GPSResult) << endl;
  }
}

void read_all_data(){
   if(b_GPSResult){
    request_gps();
   }

   if(b_usebmp){
    request_bmp();
   }

   if(b_useccs){
    request_ccs();
   }

   if(b_usebaro){
    request_baro();
   }

   if(b_usebno){
    request_bno();
   }
}

void setup() {
  init_all();
}

void runWait() {
  if (!GPS_SKIP && !GPS.fix){
    Serial1 << "# GPS Finding Fix" << endl;
    digitalWrite(BUZZER_PIN, HIGH);
    delay(3000);
    digitalWrite(BUZZER_PIN, LOW);

    while (!GPS.fix) {
      prepareParseGPS();
      if (Serial1.available()) {
        c = Serial1.read();
        if ( c == '~' ) {
          GPS_SKIP = true;
          Serial1 << "# GPS fix skipped" << endl;
          break;
        }
      }
    }
  }
  if (Serial3.available()){
    Serial1 << "# GPS fix located" << endl;
  }  

  while (true) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);

    if (Serial1.available()) {
      c = Serial1.read();
      if ( c == '+' ) {
          break;
      }
    }
  }
}

State nextState(State state) {
  State nextstate = state;
  if (Serial1.available()) {
    c = Serial1.read();
  } else {
    c = '*';
  }

  //Serial1.println(c);
  
  if (Serial.available()) {
    d = Serial.read();
  } else {
    d = d;
  }

  switch (state){
    case WAIT:
      switch (c){
        case '+':
          //Serial.println(c);
          nextstate = ARM;
          break;
        case '-':
          GPS_SKIP = false;
          nextstate = WAIT;
          break;
        default:
          nextstate = WAIT;
          break;
      }
    case ARM:
      nextstate = READY;
      break;
    case READY:
      if (c == '-'){
        GPS_SKIP = false;
        nextstate = WAIT;
        break;
      }
      else if (d == 's'){

        if(b_useXbee){
          Serial1.println("# STARTUP RECEIVED");
        }
        
        nextstate = RUN;
        break;
      }
      else if (timeoutINIT.hasTimedOut()){
        nextstate = ARM;
        break;
      }
      else {
        nextstate = READY;
        break;
      }
    case RUN:
      if (c == '-'){
        GPS_SKIP = false;
        nextstate = WAIT;
        break;      
      } else {
        nextstate = RUN;
        break;
      }
  }
  return nextstate;
}

void loop() {
  /*
  switch (state){
    case WAIT:
      runWait();
      if(b_useSerial){
        Serial.println("WAIT");
      }
      break;
    case READY:
      if(b_useSerial){
        Serial.println("READY");
      }
      break;
    case RUN:
      if(b_useSerial){
        Serial.println("RUN");
      }
      read_all_data();
      break;
  }
  state = nextState(state);
  */
  read_all_data();
}
