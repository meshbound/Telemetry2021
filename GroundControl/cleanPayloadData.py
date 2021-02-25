raw = open("", "r")
clean = open("", "w+")
while True:
    current = raw.readline()
    if current == '':
        break;
    print(current)
    if '##' in current or '%%' in current:
        clean.write(current)
raw.close()
clean.close()