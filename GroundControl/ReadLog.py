import csv
import time
import json

chunk_size = 4
chunk_elapsed = 0

# imitates real life latency, 1 is close to reality
delay_factor = 0.5

path = "./Data/"
target_log = "{}2020-02-21-dump-(1).csv".format(path)
temp_path = "{}LogCurrent.json".format(path)

data_raw_dict = {"!!": "", "@@": "", "##": "", "%%": "", "$$": ""}

data_clean_dict = {"bme": {"temperature": "", "humidity": ""},

                   "ccs": {"co2": "", "tvoc": ""},

                   "baro": {"pressure": "", "altitude": ""},

                   "bno": {"quaternion": {"quat_w": "", "quat_x": "", "quat_y": "", "quat_z": ""},
                           "mag": {"mag_x": "", "mag_y": "", "mag_z": ""},
                           "gyroscope": {"gyro_x": "", "gyro_y": "", "gyro_z": ""},
                           "accelerometer": {"accel_x": "", "accel_y": "", "accel_z": ""}
                           },

                   "gps": {"time": {"hour": "", "min": "", "sec": "", "milli": "", "day": "", "month": "", "year": ""},
                           "connection": {"fix": "", "fix_quality": ""},
                           "positon": {"latitude": "", "lat": "", "longitude": "", "long": ""},
                           "info": {"speed": "", "angle": "", "altitude": "", "satellites": ""}
                           },
                   "data": {"current": 0, "average": 0}
                   }


def apply_to_dict(key, data, offset):
    i = 0 + offset
    for sub_key in data_clean_dict[key].items():
        for sub_sub_key in data_clean_dict[key][sub_key[0]]:
            data_clean_dict[key][sub_key[0]][sub_sub_key] = data[i]
            i += 1


def proper_format(tag, data):
    data.remove(tag)
    offset = 1

    if (tag == "!!"):
        data_clean_dict["bme"]["temperature"] = data[offset + 1];
        # data_clean_dict["bme"]["humidity"] = data[offset + 2];
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


def clean_read(data, tag, delay):
    global chunk_elapsed
    chunk_elapsed += 1

    if chunk_elapsed > chunk_size:
        time.sleep(delay)
        chunk_elapsed = 0

    with open(temp_path, 'w') as dataTemp:
        json.dump(proper_format(tag, data), dataTemp, default=json)
        dataTemp.close()

    print(data)

with open(target_log) as log:
    log_reader = csv.reader(log, delimiter=',')
    for row in log_reader:
        if not row == []:

            contents = row
            tag = contents[0]

            if tag in data_raw_dict:
                clean_read(contents, tag, delay_factor)