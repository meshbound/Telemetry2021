/* Imports */

#include <Wire.h>
#include <SPI.h>
#include <SD.h>

#include <Streaming.h>
#include <PString.h>
#include <TimeLib.h>

#include <Adafruit_BME280.h>
#include <Adafruit_CCS811.h>
#include <Adafruit_MPL3115A2.h>
#include <Adafruit_GPS.h>
#include <Adafruit_BNO055.h>

/* ---------- Sensors ---------- */

// BME280
Adafruit_BME280 bme;

// CCS811
Adafruit_CCS811 ccs;

// MPL3115A2
Adafruit_MPL3115A2 baro = Adafruit_MPL3115A2();

// BNO055
Adafruit_BNO055 bno = Adafruit_BNO055();

// SD Card
const uint8_t SELECT_SLVE = 10;

// GPS
Adafruit_GPS GPS(&Serial2);

// Payload UART Serial3

/* ---------- Variables ---------- */

bool b_useSerial = true; bool b_useXbee = false; bool b_usePayload = false;

bool b_testResult = false; bool b_xbeeResult = false; bool b_sdResult = false; bool b_GPSResult = false;
bool b_usebme = false; bool b_useccs = false; bool b_usebaro = false; bool b_usebno = false;

char c;

// Buzzer
const uint8_t BUZZER_PIN = 6;

//Xbee
const uint32_t XBEE_BAUD = 9600;
const int8_t OFFSET_TIME = -6;
const char DELIMITER[] = ",";

//GPS
bool GPS_SKIP = false;
const uint16_t ADAGPS_BAUD = 9600;

//Logfile
char filename[] = "FLIGHT00.CSV";

//Buffer
#define MAX_BUFFER 256
uint8_t decoded_buffer[MAX_BUFFER];

//Timers
uint32_t START_TIME, START_TIME_GPS;

//States
enum State {WAIT, ARM, READY, RUN};
State state = WAIT;


/* ---------- Debug methods ---------- */

bool init_sensors() {

  b_usebme = init_bme();
  b_useccs = init_ccs();
  b_usebaro = init_baro();
  b_usebno = init_bno();

  bool test = b_usebme && b_useccs && b_usebaro && b_usebno;
  b_testResult = test;

  return test;
}

void init_payload(){
  Serial3.begin(9600);
}

void init_serial() {
  Serial.begin(9600);
}

void verify(bool value) {
  if (value) {
    tone(BUZZER_PIN, 1000);
  } else {
    tone(BUZZER_PIN, 500);
  }
  delay(500);
  noTone(BUZZER_PIN);
  delay(500);
}

void send_message(String message){
  if (b_useSerial) {
    Serial << message << endl;
  }
  if (b_useXbee) {
    Serial2 << message << endl;
  }
}

/* ---------- Time ---------- */

void init_time() {
  START_TIME = millis();
  START_TIME_GPS = get_time();
  
  send_message("# Initialized GPS Time (ms): " + String(START_TIME_GPS));
  send_message("# Initialized Millis Start Time (ms): " + String(START_TIME));
  send_message("# Initalization Time (ms): " + String(millis()));

}

PString get_timestamp(uint16_t memSize = 50) {
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

uint32_t get_time() {
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
  Serial2 << "# Date (mm/dd/yyyy): " << month() << "/" << day() << "/" << year() << endl;
  return ((hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds);
}

/* ---------- Sensor methods ---------- */

// BME280
boolean init_bme() {
  if (!bme.begin()) {
    send_message("# BME280 failed to initalize");
    return false;
  }
  return true;
}

void request_bme(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool payloadPrint = false, bool xbeePrint = true) {
  char buffer[memSize];
  PString dataBME(buffer, sizeof(buffer));

  dataBME << "!!" << DELIMITER << get_timestamp() << DELIMITER << bme.readTemperature() << DELIMITER << bme.readHumidity() << endl;
  write_to_locations(serialPrint, sdPrint, xbeePrint, payloadPrint, dataBME);
}

//CCS811
boolean init_ccs() {
  if (!ccs.begin()) {
    send_message("# CCS811 failed to initalize");
    return false;
  }
  return true;
}

void request_ccs(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool payloadPrint = false, bool xbeePrint = true) {
  if (ccs.available()) {
    char buffer[memSize];
    PString dataCCS(buffer, sizeof(buffer));

    dataCCS << "@@" << DELIMITER << get_timestamp()  << DELIMITER << ccs.geteCO2() << DELIMITER << ccs.getTVOC() << endl;
    write_to_locations(serialPrint, sdPrint, xbeePrint, payloadPrint, dataCCS);
  }
}

//MPL3115A2
boolean init_baro() {
  if (!baro.begin()) {
    send_message("# MPL3115A2 failed to initalize");
    return false;
  }
  return true;
}

void request_baro(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool payloadPrint = true, bool xbeePrint = true) {
  char buffer[memSize];
  PString dataBARO(buffer, sizeof(buffer));

  dataBARO << "##" << DELIMITER  << get_timestamp() << DELIMITER << baro.getPressure() << DELIMITER << baro.getAltitude() << endl;
  write_to_locations(serialPrint, sdPrint, xbeePrint, payloadPrint, dataBARO);
}

//BNO055
boolean init_bno() {
  if (!bno.begin()) {
    send_message("# BNO055 failed to initalize");
    return false;
  }
  bno.setExtCrystalUse(true);
  return true;
}

void request_bno(uint16_t memSize = 210, bool serialPrint = true, bool sdPrint = true, bool payloadPrint = true, bool xbeePrint = true) {
  char buffer[memSize];
  PString dataBNO(buffer, sizeof(buffer));

  imu::Quaternion quat = bno.getQuat();
  dataBNO << "%%" << DELIMITER << get_timestamp() << DELIMITER << quat.w() << DELIMITER << quat.x()
          << DELIMITER << quat.y() << DELIMITER << quat.z() << DELIMITER;

  imu::Vector<3> mag = bno.getVector(Adafruit_BNO055::VECTOR_MAGNETOMETER);
  dataBNO << mag.x() << DELIMITER << mag.y() << DELIMITER << mag.z() << DELIMITER;

  imu::Vector<3> gyro = bno.getVector(Adafruit_BNO055::VECTOR_GYROSCOPE);
  dataBNO << gyro.x() << DELIMITER << gyro.y() << DELIMITER << gyro.z() << DELIMITER;

  imu::Vector<3> accel = bno.getVector(Adafruit_BNO055::VECTOR_ACCELEROMETER);
  dataBNO << accel.x() << DELIMITER << accel.y() << DELIMITER << accel.z() << endl;

  write_to_locations(serialPrint, sdPrint, xbeePrint, payloadPrint, dataBNO);
}

//GPS
void init_gps() {

  GPS.begin(ADAGPS_BAUD);
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
  GPS.sendCommand(PGCMD_ANTENNA);

  delay(1000);
  Serial1.println(PMTK_Q_RELEASE);

  b_GPSResult = true;
}

void prepareParseGPS() {
  char g = GPS.read();
  if (GPS.newNMEAreceived()) {
    if (!GPS.parse(GPS.lastNMEA())) {
      return;
    }
  }
}

void request_gps(uint16_t memSize = 200, bool serialPrint = true, bool sdPrint = true, bool payloadPrint = false, bool xbeePrint = true) {
  if (Serial1.available()) {

    char buffer[memSize];
    PString dataGPS(buffer, sizeof(buffer));

    dataGPS << "$$" << DELIMITER << get_timestamp() << DELIMITER << GPS.hour << DELIMITER << GPS.minute << DELIMITER << GPS.seconds << DELIMITER
            << GPS.milliseconds << DELIMITER << GPS.day << DELIMITER << GPS.month << DELIMITER
            << GPS.year << DELIMITER << (uint8_t)GPS.fix << DELIMITER << (uint8_t)GPS.fixquality << DELIMITER
            << GPS.latitude << DELIMITER << (int32_t)GPS.lat << DELIMITER << GPS.longitude << DELIMITER
            << (int32_t)GPS.lon << DELIMITER << GPS.speed << DELIMITER << GPS.angle << DELIMITER
            << GPS.altitude << DELIMITER << GPS.satellites << endl;
 
    write_to_locations(serialPrint, sdPrint, xbeePrint, payloadPrint, dataGPS);
  }
}

//Xbee
void init_xbee() {
  Serial2.begin(XBEE_BAUD);

  while (!Serial2) {
    // Wait for the Xbee
  }

  b_useXbee = true;
}

//SD
void init_sd() {
  if (!SD.begin(SELECT_SLVE)) {
    return;
  }
  
  for (uint8_t i = 0; i < 100; i++) {
    filename[6] = i / 10 + '0';
    filename[7] = i % 10 + '0';
    if (!SD.exists(filename)) {
      break;
    }
  }

  File logfile = SD.open(filename, FILE_WRITE);
  if (!logfile) {
    return;
  }
  logfile.close();
  
  send_message("# Logging to: " + String(filename));
  
  b_sdResult = true;
}


void write_to_locations(bool serialPrint, bool sdPrint, bool xbeePrint, bool payloadPrint, PString data) {
  if (serialPrint && b_useSerial) {
    Serial << data;
  }
  if (sdPrint && b_sdResult) {
    File logfile = SD.open(filename, FILE_WRITE);
    logfile << data;
    logfile.close();
  }
  if (xbeePrint && b_useXbee) {
    Serial2 << data;
  }
  if(payloadPrint && b_usePayload){
    Serial3 << data;
  }
}

/* ---------- Main methods ---------- */

void init_all() {

  if(b_useSerial){
    init_serial();
  }
  if(b_useXbee){
    init_xbee();
  }
  if(b_usePayload){
    init_payload();
  }
  
  init_sd();
  init_gps();
  init_sensors();

  send_message("# Sensors init exited with " + String(b_testResult));
  verify(b_testResult);

  send_message("# GPS init exited with " + String(b_GPSResult));
  verify(b_GPSResult);

  send_message("# Xbee init exited with " + String( b_xbeeResult));
  verify(b_xbeeResult);

  send_message("# SD init exited with " + String(b_sdResult));
  verify(b_sdResult);
  
}

void read_all_data() {
  
  if(b_GPSResult){
    request_gps();
  }
  
  if (b_usebme) {
    request_bme();
  }

  if (b_useccs) {
    request_ccs();
  }

  if (b_usebno) {
    request_bno();
  }

  if (b_usebaro) {
    request_baro();
  }

}

void setup() {
  init_all();
}

void runWait() {
  if (!GPS_SKIP || !GPS.fix) {

    send_message("# GPS Finding Fix");

    while (GPS.fix != 1) {
    
      prepareParseGPS();

      tone(BUZZER_PIN, 500);
      delay(500);
      noTone(BUZZER_PIN);
      delay(500);

      send_message("req");
      delay(2000);
      
      if (Serial2.available() > 0) {
        c = Serial2.read();
        if ( c == '-' ) {
          GPS_SKIP = true;
          send_message("# GPS fix skipped");
          break;
        }
      } 
      if (Serial.available() > 0) {
        c = Serial.read();
        if ( c == '-' ) {
          GPS_SKIP = true;
          send_message("# GPS fix skipped");
          break;
        }
      }
    }    
  }

  if (Serial1.available() > 0) {
    send_message("# GPS fix located");
  }

  while (true) {
    
    tone(BUZZER_PIN, 1100);
    delay(500);
    noTone(BUZZER_PIN);
    delay(500);

    send_message("apc");
    delay(2000);
    
    if (Serial2.available() > 0) {
      c = Serial2.read();
      if ( c == '+' ) {
        break;
      }
    }
    if (Serial.available() > 0) {
      c = Serial.read();
      if ( c == '+' ) {
        break;
      }
    }
  }
}

State nextState(State state) {
  
  State nextstate = state;

  switch (state) {
    case WAIT:
      if(c == '+'){
        nextstate = ARM;
      }else{
        nextstate = WAIT;
      }
      break;
    case ARM:
      send_message("# ARMED");
      nextstate = READY;
      break;
    case READY:
      send_message("# STARTUP RECEIVED");
      nextstate = RUN;
      break;
    case RUN:
      nextstate = RUN;
      break;
  }
  return nextstate;
}

void loop() {
  
  switch (state) {
    case WAIT:
      runWait();
      send_message("WAIT");
      break;
    case READY:
      send_message("READY");
      break;
    case RUN:
      send_message("RUN");
      read_all_data();
      break;
  }
  state = nextState(state);
}
