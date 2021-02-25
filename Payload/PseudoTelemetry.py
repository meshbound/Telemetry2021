import importlib
import PySimpleGUI as sg
import json
import os
import threading
import time

settings = {'python_path': '', 'data_path': '', 'mps': 1}
send_data = False
kill_threads = False

send_data_thread = None
payload_thread = None
payload_module = None


def init_file_gui():

    raw_name = settings['python_path']
    settings_valid_file = False

    if raw_name is not '':
        settings_valid_file = os.path.isfile(raw_name) and '.py' in raw_name

    init_layout = [[sg.Input(visible=True, enable_events=True, key='input', default_text=raw_name),
                    sg.FilesBrowse(), sg.Button('Proceed', disabled=not settings_valid_file), sg.Button('Exit')
                    ]]

    init_window = sg.Window('Init', init_layout)

    while True:
        event, values = init_window.read()

        if event in (sg.WIN_CLOSED, 'Exit'):
            return False
        elif event == 'Proceed':
            settings['python_path'] = raw_name
            json.dump(settings, open("pref.json", 'w'))
            break
        elif event == 'input':
            raw_name = values['input']
            init_window['input'].Update(raw_name.split(';'))
            valid_path_imaging = os.path.isfile(raw_name) and '.py' in raw_name

            init_window['Proceed'].Update(disabled=not valid_path_imaging)

    init_window.close()
    return True


def playback_gui():

    global send_data, kill_threads

    raw_name = settings['data_path']
    settings_mps = settings['mps']
    settings_valid_file = False

    if settings_mps is not '':
        settings_valid_file = os.path.isfile(raw_name)

    main_layout = [[sg.Input(visible=True, enable_events=True, key='input', default_text=raw_name),
                    sg.FilesBrowse(key='browser'), sg.Button('Begin', disabled=not settings_valid_file),
                    sg.Button('Pause', disabled=True), sg.Button('Exit')],
                   [sg.Slider(range=(1, 50), orientation='h', size=(34, 20), default_value=settings_mps,
                              enable_events=True, key="slider", visible=settings_valid_file),
                    sg.Text('msg/sec', key='text', visible=settings_valid_file)]
                   ]

    main_window = sg.Window('Telemetry Sim', main_layout)
    valid_path_data = False
    began_reading = False

    while True:
        event, values = main_window.read()
        if event in (sg.WIN_CLOSED, 'Exit'):
            break
        elif event == 'Pause':
            send_data = not send_data
        elif event == 'slider':

            settings['mps'] = values['slider']
            json.dump(settings, open("pref.json", 'w'))

        elif event == 'Begin':

            main_window['input'].Update(disabled=True)
            main_window['browser'].Update(disabled=True)
            main_window['Begin'].Update(disabled=True)
            main_window['Pause'].Update(disabled=False)

            began_reading = True
            send_data = True

            send_data_thread.start()

        elif event == 'input' and not began_reading:
            raw_name = values['input']
            main_window['input'].Update(raw_name.split(';'))
            valid_path_data = os.path.isfile(raw_name)

            main_window['Begin'].Update(disabled=not valid_path_data)

            main_window['slider'].Update(visible=valid_path_data)
            main_window['text'].Update(visible=valid_path_data)

            if valid_path_data:
                settings['data_path'] = raw_name
                json.dump(settings, open("pref.json", 'w'))

    main_window.close()
    kill_threads = True


def import_payload():
    module = None

    module_dir, module_file = os.path.split(settings['python_path'])
    module_name, module_ext = os.path.splitext(module_file)
    spec = importlib.util.spec_from_file_location(module_name, settings['python_path'])
    module = spec.loader.load_module()

    return module


def send_data_payload():

    data = open(settings['data_path'], "r")

    while not kill_threads:
        sleep_interval = 1 / settings['mps']
        if send_data:
            a = data.readline().rstrip()
            b = data.readline().rstrip()
            if 'end' in a:
                print('reached end of file, commencing loop')
                data = open(settings['data_path'], "r")
            else:
                package = [a, b]
                payload_module.telemetry_data_handler(package)
                time.sleep(sleep_interval)


def run_payload():

    if kill_threads:
        payload_module.payload_behavior()


if __name__ == '__main__':
    if os.path.isfile('pref.json'):
        settings = json.load(open('pref.json'))
    if init_file_gui():

        payload_module = import_payload()
        payload_thread = threading.Thread(target=run_payload)
        send_data_thread = threading.Thread(target=send_data_payload)
        payload_thread.start()

        playback_gui()