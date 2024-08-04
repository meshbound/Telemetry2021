import serial, time, datetime, sys

SERIALPORT = "/dev/ttyUSB0"    # the com/serial port the XBee is connected to, the pi GPIO should always be ttyAMA0
BAUDRATE = 9600      # the baud rate we talk to the xbee

ser = serial.Serial(SERIALPORT, BAUDRATE)

message = str.encode("Hello World")

# Continuously read and print packets
while True:
    message = input(">>>")
    message = str.encode(message)
    ser.write(message)

ser.close()

