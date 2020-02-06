import serial
import csv
import time 
import os 
SERIALPORT = "/dev/ttyUSB0"
BAUDRATE = 9600

ser = serial.Serial(SERIALPORT, BAUDRATE)


ser.write(str.encode("-")) # "-" skips the fix for the GPS
time.sleep(1)
ser.write(str.encode("+")) # telemetry module will not transmit data until "+" is sent

try:
    os.remove("imu.csv")
except:
    pass

try: 
    os.remove("bme.csv")
except:
    pass

try: 
    os.remove("ccs.csv")
except:
    pass

try: 
    os.remove("pd.csv")
except:
    pass

while True:
    incoming = ser.readline().strip().decode("utf-8").split(",")
    tag = incoming[0]

    # IMU
    if tag == "%%" and len(incoming) == 15:
        #imuTime, imuSinceStart = tuple(incoming[1:3])
        #qw, qx, qy, qz = tuple(incoming[3:7])
        #mx, my, mz = tuple(incoming[7:10])
        #gx, gy, gz = tuple(incoming[10:13])
        #ax, ay, az = tuple(incoming[13:16])
        with open('imu.csv', 'a') as imuCSVFile:
            writer = csv.writer(imuCSVFile)
            writer.writerow(incoming)
            imuCSVFile.close()

    # BME
    if tag == "!!" and len(incoming) == 6:
        with open('bme.csv', 'a') as bmeCSVFile:
            writer = csv.writer(bmeCSVFile)
            writer.writerow(incoming)
            bmeCSVFile.close()
    #CCS
    # TODO: fix incoming length ? yea fix this one boi
    if tag == "@@":
        with open('ccs.csv', 'a') as ccsCSVFile:
            writer = csv.writer(ccsCSVFile)
            writer.writerow(incoming)
            ccsCSVFile.close()

ser.close()
