/* Imports */

#include <Wire.h>
#include <SPI.h>
#include <SD.h>

#include <Streaming.h>
#include <PString.h>
#include <Time.h>
#include <TimeLib.h>
#include <SoftTimers.h>

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
const uint8_t SELECT_SLVE = 53;

// GPS
Adafruit_GPS GPS(&Serial3);

/* ---------- Variables ---------- */

bool b_useSerial = false; bool b_useXbee = false;

bool b_testResult = false; bool b_xbeeResult = false; bool b_sdResult = false; bool b_GPSResult = false;

bool b_usebme = false; bool b_useccs = false; bool b_usebaro = false; bool b_usebno = false;

char c, d;

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

bool init_sensors() {

  b_usebme = init_bme();
  b_useccs = init_ccs();
  b_usebaro = init_baro();
  b_usebno = init_bno();

  bool test = b_usebme && b_useccs && b_usebaro && b_usebno;
  b_testResult = test;

  return test;
}

void init_serial() {
  Serial.begin(9600);
  b_useSerial = true;
}

void verify(bool value, int repeat) {
  if (value) {
    for (int i = 0; i < repeat; i++) {
      tone(BUZZER_PIN, 1000);
      delay(500);
      noTone(BUZZER_PIN);
      delay(500);
    }
  } else {
    for (int i = 0; i < repeat; i++) {
      tone(BUZZER_PIN, 500);
      delay(500);
      noTone(BUZZER_PIN);
      delay(500);
    }
  }
}

/* ---------- Time ---------- */

void init_time() {
  START_TIME = millis();
  START_TIME_GPS = getTime();

  if (b_useXbee) {
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

// BME280
boolean init_bme() {
  if (!bme.begin()) {

    if (b_useSerial) {
      Serial << "# BME280 failed to initalize" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# BME280 failed to initalize" << endl;
    }

    return false;
  }

  return true;
}

void request_bme(uint16_t memSize = 100, bool serialPrint = true, bool sdPrint = true, bool xbeePrint = true) {
  char buffer[memSize];
  PString dataBME(buffer, sizeof(buffer));

  dataBME << "!!" << DELIMITER << getTimestamp() << DELIMITER << bme.readTemperature() << DELIMITER << bme.readHumidity() << endl;
  write_to_locations(serialPrint, sdPrint, xbeePrint, dataBME);
}

//CCS811
boolean init_ccs() {
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
  if (ccs.available()) {
    char buffer[memSize];
    PString dataCCS(buffer, sizeof(buffer));

    dataCCS << "@@" << DELIMITER << getTimestamp()  << DELIMITER << ccs.geteCO2() << DELIMITER << ccs.getTVOC() << endl;
    write_to_locations(serialPrint, sdPrint, xbeePrint, dataCCS);
  }
}

//MPL3115A2
boolean init_baro() {
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

  dataBARO << "##" << DELIMITER  << getTimestamp() << DELIMITER << baro.getPressure() << DELIMITER << baro.getAltitude() << endl;
  write_to_locations(serialPrint, sdPrint, xbeePrint, dataBARO);
}

//BNO055
boolean init_bno() {
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

  write_to_locations(serialPrint, sdPrint, xbeePrint, dataBNO);
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

void prepareParseGPS() {
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
 
    write_to_locations(serialPrint, sdPrint, xbeePrint, dataGPS);
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


void write_to_locations(bool serialPrint, bool sdPrint, bool xbeePrint, PString data) {
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

  verify(b_testResult, 1);
  verify(b_GPSResult, 1);
  verify(b_xbeeResult, 1);
  verify(b_sdResult, 1);

  if (b_useSerial) {
    Serial << "# Sensors init exited with " + String(b_testResult) << endl;
    Serial << "# Xbee init exited with " + String(b_xbeeResult) << endl;
    Serial << "# SD init exited with " + String(b_sdResult) << endl;
    Serial << "# GPS init exited with " + String(b_GPSResult) << endl;
  }
  if (b_useXbee) {
    Serial1 << "# Sensors init exited with " + String(b_testResult) << endl;
    Serial1 << "# Xbee init exited with " + String( b_xbeeResult) << endl;
    Serial1 << "# SD init exited with " + String(b_sdResult) << endl;
    Serial1 << "# GPS init exited with " + String(b_GPSResult) << endl;
  }
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

  if (b_usebaro) {
    request_baro();
  }

  if (b_usebno) {
    request_bno();
  }

}

void setup() {
  init_all();
}

void runWait() {
  if (!GPS_SKIP && !GPS.fix) {

    if (b_useSerial) {
      Serial << "# GPS Finding Fix" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# GPS Finding Fix" << endl;
    }

    tone(BUZZER_PIN, 1100);
    delay(2000);
    noTone(BUZZER_PIN);


    while (!GPS.fix) {
      prepareParseGPS();

      if (Serial1.available()) {

        if (b_useSerial) {
          Serial << "req" << endl;
        }
        if (b_useXbee) {
          Serial1 << "req" << endl;
        }

        c = Serial1.read();
        if ( c == '-' ) {
          GPS_SKIP = true;

          if (b_useSerial) {
            Serial << "# GPS fix skipped" << endl;
          }

          if (b_useXbee) {
            Serial1 << "# GPS fix skipped" << endl;
          }

          break;
        }
      } else if (Serial.available()) {

        if (b_useSerial) {
          Serial << "req" << endl;
        }
        if (b_useXbee) {
          Serial1 << "req" << endl;
        }

        c = Serial.read();
        if ( c == '-' ) {
          GPS_SKIP = true;

          if (b_useSerial) {
            Serial << "# GPS fix skipped" << endl;
          }

          if (b_useXbee) {
            Serial1 << "# GPS fix skipped" << endl;
          }

          break;
        }
      }

    }
  }

  if (Serial3.available()) {
    if (b_useSerial) {
      Serial << "# GPS fix located" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# GPS fix located" << endl;
    }
  }

  while (true) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);

    if (b_useSerial) {
      Serial << "# Awaiting pass char" << endl;
    }
    if (b_useXbee) {
      Serial1 << "# Awaiting pass char" << endl;
    }
    
    if (Serial1.available()) {
      c = Serial1.read();
      if ( c == '+' ) {
        break;
      }
    } else if (Serial.available()) {
      c = Serial.read();
      if ( c == '+' ) {
        break;
      }
    }
  }
}

State nextState(State state) {
  State nextstate = state;

  /*
    if (Serial.available()) {
    Serial << "req" << endl;
    c = Serial.read();
    } else if (Serial1.available()){
    Serial1 << "req" << endl;
    c = Serial1.read();
    }
    else {
    c = '*';
    }
  */

  switch (state) {
    case WAIT:
      switch (c) {
        case '+':
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
      if (c == '-') {
        GPS_SKIP = false;
        nextstate = WAIT;
        break;
      }
      else if (c == '+'){
        if (b_useSerial) {
          Serial << "# STARTUP RECEIVED" << endl;
        }
        if (b_useXbee) {
          Serial1 << "# STARTUP RECEIVED" << endl;
        }
        nextstate = RUN;
        break;
      }
      else if (timeoutINIT.hasTimedOut()) {
        nextstate = ARM;
        break;
      }
      else {
        nextstate = READY;
        break;
      }
    case RUN:
      if (c == '-') {
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

  switch (state) {
    case WAIT:
      runWait();
      if (b_useSerial) {
        Serial.println("WAIT");
      }
      if (b_useXbee) {
        Serial1.println("WAIT");
      }

      break;
    case READY:
      if (b_useSerial) {
        Serial.println("READY");
      }
      if (b_useXbee) {
        Serial1.println("READY");
      }

      break;
    case RUN:
      if (b_useSerial) {
        Serial.println("RUN");
      }
      if (b_useXbee) {
        Serial1.println("RUN");
      }

      read_all_data();
      break;
  }

  Serial.println(state);
  state = nextState(state);
}
