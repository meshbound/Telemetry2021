import serial
import csv
import time
import os
import json
import datetime

SERIAL_PORT = "COM3"
BAUD_RATE = 9600
received = 0

total_data = 0
average_data = 0

# ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
date = datetime.date.today()

path = "./Data/"

dump_path_temp = "{0}dump-({1}).csv"
dump_path_finial = ""
temp_path = "{}Current.json".format(path)

start_dump = path + str(date) + "-"

ser = serial.Serial(SERIAL_PORT, BAUD_RATE)

ser.write(str.encode("-"))  # "-" skips the fix for the GPS
time.sleep(1)
ser.write(str.encode("+"))  # telemetry module will not transmit data until "+" is sent

data_raw_dict = {"!!": "", "@@": "", "##": "", "%%": "", "$$": ""}

data_clean_dict = {"bme": {"temperature": "", "humidity": ""},

                   "ccs": {"co2": "", "tvoc": ""},

                   "baro": {"pressure": "", "altitude": ""},

                   "bno": {"quaternion ": {"quat_w": "", "quat_x": "", "quat_y": "", "quat_z": ""},
                           "mag": {"mag_x": "", "mag_y": "", "mag_z": ""},
                           "gyroscope": {"gyro_x": "", "gyro_y": "", "gyro_z": ""},
                           "accelerometer": {"accel_x": "", "accel_y": "", "accel_z": ""}
                           },

                   "gps": {"time": {"hour": "", "min": "", "sec": "", "milli": "", "day": "", "month": "", "year": ""},
                           "connection": {"fix": "", "fix_quality": ""},
                           "positon": {"latitude": "", "lat": "", "longitude": "", "long": ""},
                           "info": {"speed": "", "angle": "", "altitude": "", "satellites": ""}
                           },
                   "data" : {"current": 0, "average": 0}
                   }


def calc_average():
    global total_data, average_data
    total_data += data_clean_dict["data"]["current"]
    average_data = total_data // received
    data_clean_dict["data"]["average"] = average_data


def apply_to_dict(key, data, offset):
    i = 0 + offset
    for sub_key in data_clean_dict[key].items():
        for sub_sub_key in data_clean_dict[key][sub_key[0]]:
            data_clean_dict[key][sub_key[0]][sub_sub_key] = data[i]
            i += 1


def proper_format(tag, incoming):
    data = incoming.replace(tag + ',', "").split(',')
    offset = 1

    if (tag == "!!"):
        data_clean_dict["bmp"]["temperature"] = data[offset + 1];
        data_clean_dict["bmp"]["humidity"] = data[offset + 2];
    elif (tag == "@@"):
        data_clean_dict["ccs"]["co2"] = data[offset + 1];
        data_clean_dict["ccs"]["tvoc"] = data[offset + 2];
    elif (tag == "##"):
        data_clean_dict["baro"]["pressure"] = data[offset + 1];
        data_clean_dict["baro"]["altitude"] = data[offset + 2];
    elif (tag == "%%"):
        apply_to_dict("bno", data, offset+1)
    elif (tag == "$$"):
        apply_to_dict("gps", data, offset+1)

    return data_clean_dict


current = 0
while True:
    testName = dump_path_temp.format(start_dump, current)
    if os.path.exists(testName):
        current += 1
    else:
        dump_path_finial = testName
        break;

while True:

    incoming_raw = ser.readline().strip().decode("utf-8")
    incoming_split = incoming_raw.split(",")

    tag = incoming_split[0]

    received += 1
    data_clean_dict["data"]["current"] =
    
    print(incoming_split)

    with open(dump_path_finial, 'a') as dataDump:
        writer = csv.writer(dataDump)
        writer.writerow(incoming_split)
        dataDump.close()

    with open(temp_path, 'w') as dataTemp:
        if tag in data_raw_dict:
            json.dump(proper_format(tag, incoming_raw), dataTemp, default=json)
        dataTemp.close()

ser.close()
