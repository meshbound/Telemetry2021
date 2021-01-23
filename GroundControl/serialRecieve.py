import serial
import csv
import os
import json
import datetime
import threading
from GroundControl.visualizer import *

SERIAL_PORT = "COM7"
BAUD_RATE = 9600

write_dump = False;

# keeps track of receiving data
received = 0
total_data = 0
average_data = 0

# ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
date = datetime.date.today()

# paths
path = "./Data/"
dump_path_temp = "{0}dump-({1}).csv"
dump_path_finial = ""
temp_path = "{}Current.json".format(path)
start_dump = path + str(date) + "-"

# initialize the serial connection
ser = serial.Serial(SERIAL_PORT, BAUD_RATE)

data_temp_dict = {}

data_raw_dict = {"!!": "0", "@@": "0", "##": "0", "%%": "0", "$$": "0"}

data_clean_dict = {"bme": {"temperature": "0", "humidity": "0"},

                   "ccs": {"co2": "0", "tvoc": "0"},

                   "baro": {"pressure": "0", "altitude": "0"},

                   "bno": {"quaternion": {"quat_w": "0", "quat_x": "0", "quat_y": "0", "quat_z": "0"},
                           "mag": {"mag_x": "0", "mag_y": "0", "mag_z": "0"},
                           "gyroscope": {"gyro_x": "0", "gyro_y": "0", "gyro_z": "0"},
                           "accelerometer": {"accel_x": "0", "accel_y": "0", "accel_z": "0"}
                           },

                   "gps": {"time": {"hour": "0", "min": "0", "sec": "0", "milli": "0", "day": "0", "month": "0", "year": "0"},
                           "connection": {"fix": "0", "fix_quality": "0"},
                           "positon": {"latitude": "0", "lat": "0", "longitude": "0", "long": "0"},
                           "info": {"speed": "0", "angle": "0", "altitude": "0", "satellites": "0"}
                           },

                   "data": {"current": 0, "average": 0}
                   }


def calc_average():
    global total_data, average_data
    total_data += data_clean_dict["data"]["current"]
    average_data = total_data // received
    data_clean_dict["data"]["average"] = average_data
    print("average" + average_data + " current " + data_clean_dict["data"]["current"])


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
        data_clean_dict["bme"]["temperature"] = data[offset + 1];
        data_clean_dict["bme"]["humidity"] = data[offset + 2];
    elif (tag == "@@"):
        data_clean_dict["ccs"]["co2"] = data[offset + 1];
        data_clean_dict["ccs"]["tvoc"] = data[offset + 2];
    elif (tag == "##"):
        data_clean_dict["baro"]["pressure"] = data[offset + 1];
        data_clean_dict["baro"]["altitude"] = data[offset + 2];
    elif (tag == "%%"):
        apply_to_dict("bno", data, offset + 1)
    elif (tag == "$$"):
        apply_to_dict("gps", data, offset + 1)

    return data_clean_dict


if write_dump:
    current = 0
    while True:
        testName = dump_path_temp.format(start_dump, current)
        if os.path.exists(testName):
            current += 1
        else:
            dump_path_finial = testName
            break;


def read():
    global received, data_temp_dict

    while True:
        try:
            incoming = ser.readline()
            incoming_raw = incoming.strip().decode("utf-8")
            incoming_split = incoming_raw.split(",")

            tag = incoming_split[0]

            received += 1
            data_clean_dict["data"]["current"] = len(incoming)
            # calc_average()

            print(incoming_split)

            if write_dump:
                with open(dump_path_finial, 'a') as dataDump:
                    writer = csv.writer(dataDump)
                    writer.writerow(incoming_split)
                    dataDump.close()

            with open(temp_path, 'w') as dataTemp:
                if tag in data_raw_dict:
                    json.dump(proper_format(tag, incoming_raw), dataTemp, default=json)
                dataTemp.close()

            updateAllData(data_clean_dict)


            if incoming_split[0] == "req":
                print("request incoming...")
                ser.write(str.encode("-"))  # "-" skips the fix for the GPS
            elif incoming_split[0] == "apc":
                ser.write(str.encode("+"))  # telemetry module will not transmit data until "+" is sent
        except:
            print("An exception has occurred, ignoring...")


# initialize threaded functions
read_thread = threading.Thread(target=read)


read_thread.start()
beginVisual()