import time

class Listener():

    def __init__(self, launch_alt_ft=120, timeout_s=240):

        self.launch_alt = launch_alt_ft/3.281
        self.launch_timeout = timeout_s

        self.pnut_init_alt = None
        self.mpl_init_alt = None

        self.pnut_data = {'agl': 0.0}
        self.mpl_data = {'asl': 0.0}
        self.bno_data = {'accel': 0.0}

        self.time_begin = time.time()

    def parse_pnut(self, raw):

        delimit_index = raw.index('<')
        if delimit_index == -1:
            return
        altitude = float(raw[:delimit_index])

        if self.pnut_init_alt is None:
            self.pnut_init_alt = altitude
            return

        self.pnut_data['agl'] = altitude

    def parse_telemetry(self, raw):

        parced = raw[:2]
        if len(parced) is not 2:
            return

        if parced == '##':
            self.parse_mpl(raw)
        elif parced == '%%':
            self.parse_bno(raw)

    def parse_mpl(self, raw):

        parsed = raw.split(',')

        if len(parsed) is not 5:
            return

        if self.mpl_init_alt is None:
            self.mpl_init_alt = float(parsed[4])
            return

        self.mpl_data['asl'] = float(parsed[4])

    def parse_bno(self, raw):

        parsed = raw.split(',')

        if len(parsed) is not 16:
            return

        self.bno_data['accel'] = float(parsed[14])

    def launched(self):

        points = 0

        if self.bno_data['accel'] <= 0:
            points += 1
        if self.mpl_init_alt is not None and self.mpl_data['asl'] - self.mpl_init_alt >= self.launch_alt:
            points += 1
        if self.pnut_init_alt is not None and self.pnut_data['agl'] >= self.launch_alt:
            points += 1

        return (points >= 2) or (time.time() - self.time_begin >= self.launch_timeout)