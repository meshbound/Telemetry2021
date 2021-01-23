import datetime as dt
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

max_cap = 1000
debugmode = False

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
# TODO: add a map


test = {"bme": {"temperature": "1", "humidity": "1"},

        "ccs": {"co2": "1", "tvoc": "1"},

        "baro": {"pressure": "1", "altitude": "1"},

        "bno": {"quaternion": {"quat_w": "", "quat_x": "", "quat_y": "", "quat_z": ""},
                "mag": {"mag_x": "1", "mag_y": "2", "mag_z": "3"},
                "gyroscope": {"gyro_x": "1", "gyro_y": "2", "gyro_z": "3"},
                "accelerometer": {"accel_x": "1", "accel_y": "2", "accel_z": "3"}
                },

        "gps": {"time": {"hour": "", "min": "", "sec": "", "milli": "", "day": "", "month": "", "year": ""},
                "connection": {"fix": "", "fix_quality": ""},
                "positon": {"latitude": "1", "lat": "", "longitude": "2", "long": ""},
                "info": {"speed": "", "angle": "", "altitude": "", "satellites": ""}
                },

        "data": {"current": 0, "average": 0}
        }

timestamps = []

data_clean_dict = {"bme": {"temperature": [], "humidity": []},

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

                   "data": {"current": 0, "average": 0}
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

    if debugmode:
        updateAllData(test)  # for debug

    # reformat all the graphs
    init_graphs()


def updateAllData(data):
    global data_clean_dict, timestamps

    timestamps.append(dt.datetime.now().strftime('%I:%M:%S'))
    timestamps = timestamps[-max_cap::]

    # update temperature array
    data_clean_dict["bme"]["temperature"].append(float(data["bme"]["temperature"]))
    data_clean_dict["bme"]["temperature"] = data_clean_dict["bme"]["temperature"][-max_cap::]

    # update pressure array
    data_clean_dict["baro"]["pressure"].append(float(data["baro"]["pressure"]))
    data_clean_dict["baro"]["pressure"] = data_clean_dict["baro"]["pressure"][-max_cap::]

    # update humidity array
    data_clean_dict["bme"]["humidity"].append(float(data["bme"]["humidity"]))
    data_clean_dict["bme"]["humidity"] = data_clean_dict["bme"]["humidity"][-max_cap::]

    # update GPS arrays
    data_clean_dict["gps"]["positon"]["latitude"].append(float(data["gps"]["positon"]["latitude"]))
    data_clean_dict["gps"]["positon"]["latitude"] = data_clean_dict["gps"]["positon"]["latitude"][-max_cap::]
    data_clean_dict["gps"]["positon"]["longitude"].append(float(data["gps"]["positon"]["longitude"]))
    data_clean_dict["gps"]["positon"]["longitude"] = data_clean_dict["gps"]["positon"]["longitude"][-max_cap::]

    # update altitude array
    data_clean_dict["baro"]["altitude"].append(float(data["baro"]["altitude"]))
    data_clean_dict["baro"]["altitude"] = data_clean_dict["baro"]["altitude"][-max_cap::]

    # update accelerometer array
    data_clean_dict["bno"]["accelerometer"]["accel_x"].append(float(data["bno"]["accelerometer"]["accel_x"]))
    data_clean_dict["bno"]["accelerometer"]["accel_x"] = data_clean_dict["bno"]["accelerometer"]["accel_x"][-max_cap::]
    data_clean_dict["bno"]["accelerometer"]["accel_y"].append(float(data["bno"]["accelerometer"]["accel_y"]))
    data_clean_dict["bno"]["accelerometer"]["accel_y"] = data_clean_dict["bno"]["accelerometer"]["accel_y"][-max_cap::]
    data_clean_dict["bno"]["accelerometer"]["accel_z"].append(float(data["bno"]["accelerometer"]["accel_z"]))
    data_clean_dict["bno"]["accelerometer"]["accel_z"] = data_clean_dict["bno"]["accelerometer"]["accel_z"][-max_cap::]

    # update gyroscope array
    data_clean_dict["bno"]["gyroscope"]["gyro_x"].append(float(data["bno"]["gyroscope"]["gyro_x"]))
    data_clean_dict["bno"]["gyroscope"]["gyro_x"] = data_clean_dict["bno"]["gyroscope"]["gyro_x"][-max_cap::]
    data_clean_dict["bno"]["gyroscope"]["gyro_y"].append(float(data["bno"]["gyroscope"]["gyro_y"]))
    data_clean_dict["bno"]["gyroscope"]["gyro_y"] = data_clean_dict["bno"]["gyroscope"]["gyro_y"][-max_cap::]
    data_clean_dict["bno"]["gyroscope"]["gyro_z"].append(float(data["bno"]["gyroscope"]["gyro_z"]))
    data_clean_dict["bno"]["gyroscope"]["gyro_z"] = data_clean_dict["bno"]["gyroscope"]["gyro_z"][-max_cap::]

    # update magnetometer array
    data_clean_dict["bno"]["mag"]["mag_x"].append(float(data["bno"]["mag"]["mag_x"]))
    data_clean_dict["bno"]["mag"]["mag_x"] = data_clean_dict["bno"]["mag"]["mag_x"][-max_cap::]
    data_clean_dict["bno"]["mag"]["mag_y"].append(float(data["bno"]["mag"]["mag_y"]))
    data_clean_dict["bno"]["mag"]["mag_y"] = data_clean_dict["bno"]["mag"]["mag_y"][-max_cap::]
    data_clean_dict["bno"]["mag"]["mag_z"].append(float(data["bno"]["mag"]["mag_z"]))
    data_clean_dict["bno"]["mag"]["mag_z"] = data_clean_dict["bno"]["mag"]["mag_z"][-max_cap::]


def updateTemperature():
    temp.clear()

    formatLengthA = max(len(timestamps), len(data_clean_dict["bme"]["temperature"]))
    temp.plot(timestamps[-formatLengthA::], data_clean_dict["bme"]["temperature"][-formatLengthA::])

    temp.set_ylabel('celsius [°C]')


def updatePressure():
    pres.clear()

    formatLengthA = max(len(timestamps), len(data_clean_dict["baro"]["pressure"]))
    pres.plot(timestamps[-formatLengthA::], data_clean_dict["baro"]["pressure"][-formatLengthA::])

    pres.set_ylabel('pressure [Pa]')


def updateHumidity():
    humid.clear()

    formatLengthA = max(len(timestamps), len(data_clean_dict["bme"]["humidity"]))
    humid.plot(timestamps[-formatLengthA::], data_clean_dict["bme"]["humidity"][-formatLengthA::])

    humid.set_ylabel('humidity [RH]')


def updateGPS():
    gps.clear()

    formatLengthA = max(len(timestamps), len(data_clean_dict["gps"]["positon"]["longitude"]))
    gps.plot(timestamps[-formatLengthA::], data_clean_dict["gps"]["positon"]["latitude"][-formatLengthA::], label="latitude")
    formatLengthB = max(len(timestamps), len(data_clean_dict["gps"]["positon"]["longitude"]))
    gps.plot(timestamps[-formatLengthB::], data_clean_dict["gps"]["positon"]["longitude"][-formatLengthB::], label="longitude")

    gps.set_ylabel('degrees [°]')
    gps.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateAltitude():
    alt.clear()

    formatLengthA = max(len(timestamps), len(data_clean_dict["baro"]["altitude"]))
    alt.plot(timestamps[-formatLengthA::], data_clean_dict["baro"]["altitude"][-formatLengthA::])

    alt.set_ylabel('meters [m]')


def updateAccelerometer():
    accel.clear()

    formatLengthX = max(len(timestamps), len(data_clean_dict["bno"]["accelerometer"]["accel_x"]))
    accel.plot(timestamps[-formatLengthX::], data_clean_dict["bno"]["accelerometer"]["accel_x"][-formatLengthX::], label="X")
    formatLengthY = max(len(timestamps), len(data_clean_dict["bno"]["accelerometer"]["accel_y"]))
    accel.plot(timestamps[-formatLengthY::], data_clean_dict["bno"]["accelerometer"]["accel_y"][-formatLengthY::], label="Y")
    formatLengthZ = max(len(timestamps), len(data_clean_dict["bno"]["accelerometer"]["accel_z"]))
    accel.plot(timestamps[-formatLengthZ::], data_clean_dict["bno"]["accelerometer"]["accel_z"][-formatLengthZ::], label="Z")

    accel.set_ylabel('meters per second² [m/s²]')
    accel.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateGyroscope():
    gyro.clear()

    formatLengthX = max(len(timestamps), len(data_clean_dict["bno"]["gyroscope"]["gyro_x"]))
    gyro.plot(timestamps[-formatLengthX::], data_clean_dict["bno"]["gyroscope"]["gyro_x"][-formatLengthX::], label="X")
    formatLengthY = max(len(timestamps), len(data_clean_dict["bno"]["gyroscope"]["gyro_y"]))
    gyro.plot(timestamps[-formatLengthY::], data_clean_dict["bno"]["gyroscope"]["gyro_y"][-formatLengthY::], label="Y")
    formatLengthZ = max(len(timestamps), len(data_clean_dict["bno"]["gyroscope"]["gyro_z"]))
    gyro.plot(timestamps[-formatLengthZ::], data_clean_dict["bno"]["gyroscope"]["gyro_z"][-formatLengthZ::], label="Z")

    gyro.set_ylabel('radians per second [rps]')
    gyro.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def updateMagnetometer():
    mag.clear()

    formatLengthX = max(len(timestamps), len(data_clean_dict["bno"]["mag"]["mag_x"]))
    mag.plot(timestamps[-formatLengthX::], data_clean_dict["bno"]["mag"]["mag_x"][-formatLengthX::], label="X")
    formatLengthY = max(len(timestamps), len(data_clean_dict["bno"]["mag"]["mag_y"]))
    mag.plot(timestamps[-formatLengthY::], data_clean_dict["bno"]["mag"]["mag_y"][-formatLengthY::], label="Y")
    formatLengthZ = max(len(timestamps), len(data_clean_dict["bno"]["mag"]["mag_z"]))
    mag.plot(timestamps[-formatLengthZ::], data_clean_dict["bno"]["mag"]["mag_z"][-formatLengthZ::], label="Z")

    mag.set_ylabel('micro Teslas [uT]')
    legend = mag.legend(loc='upper left', bbox_to_anchor=(1.01, 1), fontsize='x-small')


def beginVisual():
    init_graphs()
    ani = animation.FuncAnimation(fig, animate, interval=500)
    plt.show()

