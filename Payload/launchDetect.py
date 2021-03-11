class listener():
    def parse_pnut(self, raw):
        pass

    def parse_mpl(self, raw):
        pass
        # ##,0:8:50.839,530839,99181.25,179.62
        # ^ example line for Altimeter data formatted as follows: sensor identifier, timestamp, pressure, altitude

    def parse_bno(self, raw):
        parsed = raw.split(',')
        pass
        # %%,0:8:50.765,530765,0.99,-0.03,0.05,-0.15,14.25,14.56,-47.00,-0.13,-0.19,0.00,-0.80,-0.70,9.67
        # ^ example for Quaternion+Accelerator+Gyroscope+Magnetometer formatted as follows: sensor identifier, timestamp, quat.w, quat.x, quat.y, quat.z, mag.x, mag.y, mag.z, gyro.x, gyro.y, gyro.z, accel.x, accel.y, accel.z