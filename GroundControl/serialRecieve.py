import serial
import csv
import time 
import os

SERIAL_PORT = "COM3"
BAUD_RATE = 9600

ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
path = "C:/Users/jackc/OneDrive/Documents/GitHub/Telemetry2020/GroundControl/Data/"

ser.write(str.encode("-")) # "-" skips the fix for the GPS
time.sleep(1)
ser.write(str.encode("+")) # telemetry module will not transmit data until "+" is sent

try:
    os.remove("{}imu.csv".format(path))
except:
    pass

try: 
    os.remove("{}bme.csv".format(path))
except:
    pass

try: 
    os.remove("{}ccs.csv".format(path))
except:
    pass

try: 
    os.remove("{}baro.csv".format(path))
except:
    pass

while True:
    incoming = ser.readline().strip().decode("utf-8").split(",")
    tag = incoming[0]

    # IMU
    if tag == "%%":
        with open('{}imu.csv'.format(path), 'a') as imuCSVFile:
            writer = csv.writer(imuCSVFile)
            writer.writerow(incoming)
            imuCSVFile.close()

    # BME
    elif tag == "!!":
        with open('{}bme.csv'.format(path), 'a') as bmeCSVFile:
            writer = csv.writer(bmeCSVFile)
            writer.writerow(incoming)
            bmeCSVFile.close()
    # CCSi
    elif tag == "@@":
        with open('{}ccs.csv'.format(path), 'a') as ccsCSVFile:
            writer = csv.writer(ccsCSVFile)
            writer.writerow(incoming)
            ccsCSVFile.close()

    elif tag == "##":
        with open('{}baro.csv'.format(path), 'a') as baroCSVFile:
            writer = csv.writer(baroCSVFile)
            writer.writerow(incoming)
            baroCSVFile.close()

ser.close()
