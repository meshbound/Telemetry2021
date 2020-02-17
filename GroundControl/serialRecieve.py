import serial
import csv
import time
import os
import json
import datetime

SERIAL_PORT = "COM4"
BAUD_RATE = 9600

# ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
date = datetime.date.today()

path = "./Data/"
dump_path = "{}Dump.csv".format(path + str(date) + "-")
temp_path = "{}Current.json".format(path)

ser = serial.Serial(SERIAL_PORT, BAUD_RATE)

ser.write(str.encode("-"))  # "-" skips the fix for the GPS
time.sleep(1)
ser.write(str.encode("+"))  # telemetry module will not transmit data until "+" is sent

data_dict = {"!!": "", "@@": "", "##": "", "%%": "", "$$": ""}

try:
    os.remove(dump_path)
except:
    pass

while True:
    incoming_raw = ser.readline().strip().decode("utf-8")
    incoming_split = incoming_raw.split(",")

    tag = incoming_split[0]

    print(incoming_split)

    with open(dump_path, 'a') as dataDump:
        writer = csv.writer(dataDump)
        writer.writerow(incoming_split)
        dataDump.close()

    with open(temp_path, 'w') as dataTemp:
        if tag in data_dict:
            data_dict[tag] = incoming_raw.replace(tag + ',', "")
            json.dump(data_dict, dataTemp, default=json)

ser.close()
