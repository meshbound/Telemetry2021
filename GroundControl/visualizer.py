import datetime as dt
import matplotlib.pyplot as plt

max_cap = 1000


# Create figure for plotting
fig = plt.figure()

accel = fig.add_subplot(3, 3, 1)
gyro = fig.add_subplot(3, 3, 2)
mag = fig.add_subplot(3, 3, 3)

temp = fig.add_subplot(3, 3, 4)
humid = fig.add_subplot(3, 3, 5)

alt = fig.add_subplot(3, 3, 6)
pres = fig.add_subplot(3, 3, 7)

gps = fig.add_subplot(3, 3, 8)

timestamps = []
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


def init_graphs():

    plt.subplots_adjust(hspace=0.5, wspace=0.3)
    fig.canvas.set_window_title('Telemetry Dashboard 2021')

    accel.title.set_text('Accelerometer')
    gyro.title.set_text('Gyroscope')
    mag.title.set_text('Magnetometer')
    temp.title.set_text('Temperature')
    humid.title.set_text('Humidity')
    alt.title.set_text('Altitude')
    pres.title.set_text('Pressure')
    gps.title.set_text('GPS')

    for ax in plt.gcf().get_axes():
        ax.xaxis.set_major_locator(plt.MaxNLocator(5))
        ax.axes.yaxis.set_major_locator(plt.MaxNLocator(5))


def animate(i):

    # update graphs
    updateTemperature()
    updatePressure()
    updateHumidity()
    updateGPS()
    updateAltitude()
    updateAccelerometer()
    updateGyroscope()
    updateMagnetometer()

    # reformat all the graphs
    init_graphs()


def updateAllData(data):
    global data_dict, timestamps

    timestamps.append(dt.datetime.now().strftime('%I:%M:%S'))
    timestamps = timestamps[-max_cap::]

    # update temperature array
    data_dict["bme"]["temperature"].append(float(data["bme"]["temperature"]))
    data_dict["bme"]["temperature"] = data_dict["bme"]["temperature"][-max_cap::]

    # update pressure array
    data_dict["baro"]["pressure"].append(float(data["baro"]["pressure"]))
    data_dict["baro"]["pressure"] = data_dict["baro"]["pressure"][-max_cap::]

    # update humidity array
    data_dict["bme"]["humidity"].append(float(data["bme"]["humidity"]))
    data_dict["bme"]["humidity"] = data_dict["bme"]["humidity"][-max_cap::]

    # update GPS arrays
    data_dict["gps"]["positon"]["latitude"].append(float(data["gps"]["positon"]["latitude"]))
    data_dict["gps"]["positon"]["latitude"] = data_dict["gps"]["positon"]["latitude"][-max_cap::]
    data_dict["gps"]["positon"]["longitude"].append(float(data["gps"]["positon"]["longitude"]))
    data_dict["gps"]["positon"]["longitude"] = data_dict["gps"]["positon"]["longitude"][-max_cap::]

    # update altitude array
    data_dict["baro"]["altitude"].append(float(data["baro"]["altitude"]))
    data_dict["baro"]["altitude"] = data_dict["baro"]["altitude"][-max_cap::]

    # update accelerometer array
    data_dict["bno"]["accelerometer"]["accel_x"].append(float(data["bno"]["accelerometer"]["accel_x"]))
    data_dict["bno"]["accelerometer"]["accel_x"] = data_dict["bno"]["accelerometer"]["accel_x"][-max_cap::]
    data_dict["bno"]["accelerometer"]["accel_y"].append(float(data["bno"]["accelerometer"]["accel_y"]))
    data_dict["bno"]["accelerometer"]["accel_y"] = data_dict["bno"]["accelerometer"]["accel_y"][-max_cap::]
    data_dict["bno"]["accelerometer"]["accel_z"].append(float(data["bno"]["accelerometer"]["accel_z"]))
    data_dict["bno"]["accelerometer"]["accel_z"] = data_dict["bno"]["accelerometer"]["accel_z"][-max_cap::]

    # update gyroscope array
    data_dict["bno"]["gyroscope"]["gyro_x"].append(float(data["bno"]["gyroscope"]["gyro_x"]))
    data_dict["bno"]["gyroscope"]["gyro_x"] = data_dict["bno"]["gyroscope"]["gyro_x"][-max_cap::]
    data_dict["bno"]["gyroscope"]["gyro_y"].append(float(data["bno"]["gyroscope"]["gyro_y"]))
    data_dict["bno"]["gyroscope"]["gyro_y"] = data_dict["bno"]["gyroscope"]["gyro_y"][-max_cap::]
    data_dict["bno"]["gyroscope"]["gyro_z"].append(float(data["bno"]["gyroscope"]["gyro_z"]))
    data_dict["bno"]["gyroscope"]["gyro_z"] = data_dict["bno"]["gyroscope"]["gyro_z"][-max_cap::]

    # update magnetometer array
    data_dict["bno"]["mag"]["mag_x"].append(float(data["bno"]["mag"]["mag_x"]))
    data_dict["bno"]["mag"]["mag_x"] = data_dict["bno"]["mag"]["mag_x"][-max_cap::]
    data_dict["bno"]["mag"]["mag_y"].append(float(data["bno"]["mag"]["mag_y"]))
    data_dict["bno"]["mag"]["mag_y"] = data_dict["bno"]["mag"]["mag_y"][-max_cap::]
    data_dict["bno"]["mag"]["mag_z"].append(float(data["bno"]["mag"]["mag_z"]))
    data_dict["bno"]["mag"]["mag_z"] = data_dict["bno"]["mag"]["mag_z"][-max_cap::]

    animate(fig)


def updateTemperature():
    temp.clear()

    temp.plot(timestamps, data_dict["bme"]["temperature"])

    temp.set_ylabel('celsius [°C]')


def updatePressure():
    pres.clear()

    pres.plot(timestamps, data_dict["baro"]["pressure"])

    pres.set_ylabel('pressure [Pa]')


def updateHumidity():
    humid.clear()

    humid.plot(timestamps, data_dict["bme"]["humidity"])

    humid.set_ylabel('humidity [RH]')


def updateGPS():
    gps.clear()

    gps.plot(timestamps, data_dict["gps"]["positon"]["latitude"], label="latitude")
    gps.plot(timestamps, data_dict["gps"]["positon"]["longitude"], label="longitude")

    gps.set_ylabel('degrees [°]')
    gps.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateAltitude():
    alt.clear()

    alt.plot(timestamps, data_dict["baro"]["altitude"])

    alt.set_ylabel('meters [m]')


def updateAccelerometer():
    accel.clear()

    accel.plot(timestamps, data_dict["bno"]["accelerometer"]["accel_x"], label="X")
    accel.plot(timestamps, data_dict["bno"]["accelerometer"]["accel_y"], label="Y")
    accel.plot(timestamps, data_dict["bno"]["accelerometer"]["accel_z"], label="Z")

    accel.set_ylabel('meters per second² [m/s²]')
    accel.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateGyroscope():
    gyro.clear()

    gyro.plot(timestamps, data_dict["bno"]["gyroscope"]["gyro_x"], label="X")
    gyro.plot(timestamps, data_dict["bno"]["gyroscope"]["gyro_y"], label="Y")
    gyro.plot(timestamps, data_dict["bno"]["gyroscope"]["gyro_z"], label="Z")

    gyro.set_ylabel('radians per second [rps]')
    gyro.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateMagnetometer():
    mag.clear()

    mag.plot(timestamps, data_dict["bno"]["mag"]["mag_x"], label="X")
    mag.plot(timestamps, data_dict["bno"]["mag"]["mag_y"], label="Y")
    mag.plot(timestamps, data_dict["bno"]["mag"]["mag_z"], label="Z")

    mag.set_ylabel('micro Teslas [uT]')
    mag.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def beginVisual():
    init_graphs()
    plt.show()