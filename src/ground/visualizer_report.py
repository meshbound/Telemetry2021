import datetime as dt
import matplotlib.pyplot as plt

# Create figure for plotting
fig = plt.figure()

accel = fig.add_subplot(4, 3, 1)
gyro = fig.add_subplot(4, 3, 2)
mag = fig.add_subplot(4, 3, 3)

temp = fig.add_subplot(4, 3, 4)
humid = fig.add_subplot(4, 3, 5)

alt = fig.add_subplot(4, 3, 6)
pres = fig.add_subplot(4, 3, 7)

gps = fig.add_subplot(4, 3, 8)

co2 = fig.add_subplot(4, 3, 9)
tvoc = fig.add_subplot(4, 3, 10)

timestamps = {"bme": {"temperature": [], "humidity": []},

              "ccs": {"co2": [], "tvoc": []},

              "baro": {"pressure": [], "altitude": []},

              "bno": {"quaternion": {"quat_w": [], "quat_x": [], "quat_y": [], "quat_z": []},
                      "mag": {"mag_x": [], "mag_y": [], "mag_z": []},
                      "gyroscope": {"gyro_x": [], "gyro_y": [], "gyro_z": []},
                      "accelerometer": {"accel_x": [], "accel_y": [], "accel_z": []}
                      },

              "gps": {"time": {"hour": [], "min": [], "sec": [], "milli": [], "day": [], "month": [], "year": []},
                      "connection": {"fix": [], "fix_quality": []},
                      "positon": {"latitude": [], "lat": [], "longitude": [], "long": []},
                      "info": {"speed": [], "angle": [], "altitude": [], "satellites": []}
                      },

              "data": {"current": [], "average": []}
              }
data_dict = {"bme": {"temperature": [], "humidity": []},

             "ccs": {"co2": [], "tvoc": []},

             "baro": {"pressure": [], "altitude": []},

             "bno": {"quaternion": {"quat_w": [], "quat_x": [], "quat_y": [], "quat_z": []},
                     "mag": {"mag_x": [], "mag_y": [], "mag_z": []},
                     "gyroscope": {"gyro_x": [], "gyro_y": [], "gyro_z": []},
                     "accelerometer": {"accel_x": [], "accel_y": [], "accel_z": []}
                     },

             "gps": {"time": {"hour": [], "min": [], "sec": [], "milli": [], "day": [], "month": [], "year": []},
                     "connection": {"fix": [], "fix_quality": []},
                     "positon": {"latitude": [], "lat": [], "longitude": [], "long": []},
                     "info": {"speed": [], "angle": [], "altitude": [], "satellites": []}
                     },

             "data": {"current": [], "average": []}
             }


def parse_data_from_file(file_path):
    log = open(file_path, 'r')
    log_lines = log.readlines()

    for line in log_lines:
        preparsed = line.rstrip().split(',')

        try:
            if preparsed[0] == '!!':
                parseBME(preparsed)
            elif preparsed[0] == '##':
                parseBARO(preparsed)
            elif preparsed[0] == '$$':
                parseGPS(preparsed)
            elif preparsed[0] == '%%':
                parseBNO(preparsed)
            elif preparsed[0] == '@@':
                parseCCS(preparsed)
        except:
            print('failed to process line:', preparsed)

    print('finished parsing all data')


def init_graphs():
    plt.subplots_adjust(hspace=0.5, wspace=0.3)
    fig.canvas.set_window_title('Telemetry Dashboard 2021')
    fig.subplots_adjust(left=None, bottom=None, right=None, top=None, wspace=0.4, hspace=None)

    accel.title.set_text('Accelerometer')
    gyro.title.set_text('Gyroscope')
    mag.title.set_text('Magnetometer')
    temp.title.set_text('Temperature')
    humid.title.set_text('Humidity')
    alt.title.set_text('Altitude')
    pres.title.set_text('Pressure')
    gps.title.set_text('GPS')
    co2.title.set_text('CO2')
    tvoc.title.set_text('Organic compounds')


    for ax in plt.gcf().get_axes():
        ax.xaxis.set_major_locator(plt.MaxNLocator(5))
        ax.axes.yaxis.set_major_locator(plt.MaxNLocator(10))


def draw_graphs():

    # update graphs
    updateTemperature()
    updatePressure()
    updateHumidity()
    updateGPS()
    updateAltitude()
    updateAccelerometer()
    updateGyroscope()
    updateMagnetometer()
    updateCo2()
    updateTvoc()

    # reformat all the graphs
    init_graphs()
    plt.show()


def parseBME(preparsed):
    global data_dict, timestamps

    # !!,time,elapsed,temp,humid

    data_dict["bme"]["temperature"].append(float(preparsed[3]))
    timestamps["bme"]["temperature"].append(preparsed[1])

    data_dict["bme"]["humidity"].append(float(preparsed[4]))
    timestamps["bme"]["humidity"].append(preparsed[1])


def parseBARO(preparsed):
    global data_dict, timestamps

    # ##,time,elapsed,pressure,altitude

    data_dict["baro"]["pressure"].append(float(preparsed[3]))
    timestamps["baro"]["pressure"].append(preparsed[1])

    data_dict["baro"]["altitude"].append(float(preparsed[4]))
    timestamps["baro"]["altitude"].append(preparsed[1])


def parseGPS(preparsed):
    global data_dict, timestamps

    # $$,time,elapsed,hour,minute,second,millisecond,day,month,year,fix,fixquality,lattitude,lat,longitude,lon,speed,angle,altitude,satellites

    data_dict["gps"]["positon"]["latitude"].append(float(preparsed[12]))
    timestamps["gps"]["positon"]["latitude"].append(preparsed[1])

    data_dict["gps"]["positon"]["longitude"].append(float(preparsed[14]))
    timestamps["gps"]["positon"]["longitude"].append(preparsed[1])


def parseBNO(preparsed):
    global data_dict, timestamps

    # %%,timestamp,elapsed,quat.w,quat.x,quat.y,quat.z,mag.x,mag.y,mag.z,gyro.x,gyro.y,gyro.z,accel.x,accel.y,accel.z

    data_dict["bno"]["accelerometer"]["accel_x"].append(float(preparsed[13]))
    timestamps["bno"]["accelerometer"]["accel_x"].append(preparsed[1])

    data_dict["bno"]["accelerometer"]["accel_y"].append(float(preparsed[14]))
    timestamps["bno"]["accelerometer"]["accel_y"].append(preparsed[1])

    data_dict["bno"]["accelerometer"]["accel_z"].append(float(preparsed[15]))
    timestamps["bno"]["accelerometer"]["accel_z"].append(preparsed[1])

    data_dict["bno"]["gyroscope"]["gyro_x"].append(float(preparsed[10]))
    timestamps["bno"]["gyroscope"]["gyro_x"].append(preparsed[1])

    data_dict["bno"]["gyroscope"]["gyro_y"].append(float(preparsed[11]))
    timestamps["bno"]["gyroscope"]["gyro_y"].append(preparsed[1])

    data_dict["bno"]["gyroscope"]["gyro_z"].append(float(preparsed[12]))
    timestamps["bno"]["gyroscope"]["gyro_z"].append(preparsed[1])

    data_dict["bno"]["mag"]["mag_x"].append(float(preparsed[7]))
    timestamps["bno"]["mag"]["mag_x"].append(preparsed[1])

    data_dict["bno"]["mag"]["mag_y"].append(float(preparsed[8]))
    timestamps["bno"]["mag"]["mag_y"].append(preparsed[1])

    data_dict["bno"]["mag"]["mag_z"].append(float(preparsed[9]))
    timestamps["bno"]["mag"]["mag_z"].append(preparsed[1])


def parseCCS(preparsed):
    global data_dict, timestamps

    # @@,timestamp,elapsed,eCO2,TVOC

    data_dict["ccs"]["co2"].append(float(preparsed[3]))
    timestamps["ccs"]["co2"].append(preparsed[1])

    data_dict["ccs"]["tvoc"].append(float(preparsed[4]))
    timestamps["ccs"]["tvoc"].append(preparsed[1])


def updateTemperature():
    temp.clear()

    temp.plot(timestamps["bme"]["temperature"], data_dict["bme"]["temperature"])

    temp.set_ylabel('celsius [°C]')


def updatePressure():
    pres.clear()

    pres.plot(timestamps["baro"]["pressure"], data_dict["baro"]["pressure"])

    pres.set_ylabel('pressure [Pa]')


def updateHumidity():
    humid.clear()

    humid.plot(timestamps["bme"]["humidity"], data_dict["bme"]["humidity"])

    humid.set_ylabel('humidity [RH]')


def updateGPS():
    gps.clear()

    gps.plot(timestamps["gps"]["positon"]["latitude"], data_dict["gps"]["positon"]["latitude"], label="latitude")
    gps.plot(timestamps["gps"]["positon"]["longitude"], data_dict["gps"]["positon"]["longitude"], label="longitude")

    gps.set_ylabel('degrees [°]')
    gps.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateAltitude():
    alt.clear()

    alt.plot(timestamps["baro"]["altitude"], data_dict["baro"]["altitude"])

    alt.set_ylabel('meters [m]')


def updateAccelerometer():
    accel.clear()

    accel.plot(timestamps["bno"]["accelerometer"]["accel_x"], data_dict["bno"]["accelerometer"]["accel_x"], label="X")
    accel.plot(timestamps["bno"]["accelerometer"]["accel_y"], data_dict["bno"]["accelerometer"]["accel_y"], label="Y")
    accel.plot(timestamps["bno"]["accelerometer"]["accel_z"], data_dict["bno"]["accelerometer"]["accel_z"], label="Z")

    accel.set_ylabel('meters per second² [m/s²]')
    accel.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateGyroscope():
    gyro.clear()

    gyro.plot(timestamps["bno"]["gyroscope"]["gyro_x"], data_dict["bno"]["gyroscope"]["gyro_x"], label="X")
    gyro.plot(timestamps["bno"]["gyroscope"]["gyro_y"], data_dict["bno"]["gyroscope"]["gyro_y"], label="Y")
    gyro.plot(timestamps["bno"]["gyroscope"]["gyro_z"], data_dict["bno"]["gyroscope"]["gyro_z"], label="Z")

    gyro.set_ylabel('radians per second [rps]')
    gyro.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateMagnetometer():
    mag.clear()

    mag.plot(timestamps["bno"]["mag"]["mag_x"], data_dict["bno"]["mag"]["mag_x"], label="X")
    mag.plot(timestamps["bno"]["mag"]["mag_y"], data_dict["bno"]["mag"]["mag_y"], label="Y")
    mag.plot(timestamps["bno"]["mag"]["mag_z"], data_dict["bno"]["mag"]["mag_z"], label="Z")

    mag.set_ylabel('micro Teslas [uT]')
    mag.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateCo2():
    co2.clear()

    co2.plot(timestamps["ccs"]["co2"], data_dict["ccs"]["co2"], label="X")

    co2.set_ylabel('Equiv carbon dioxide [eCO2]')


def updateTvoc():
    tvoc.clear()

    tvoc.plot(timestamps["ccs"]["tvoc"], data_dict["ccs"]["tvoc"], label="X")

    tvoc.set_ylabel('T volatile organic compound [TVOC]')


def beginVisual(file_path):
    init_graphs()
    parse_data_from_file(file_path)
    draw_graphs()


beginVisual('F:/FLIGHT01.CSV')
