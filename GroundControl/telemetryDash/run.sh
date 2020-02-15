import datetime
import websocketd

function timestamp {
    return date.today()
}

LOGPATH = "./data/{}.txt".format(datetime.now().strftime("%Y-%m-%d_%H:%M:%S")

#cd ./maps
#sudo docker run --rm -v $(pwd):/data -p 8090:80 klokantech/openmaptiles-server &
#cd ..

sudo nice -20 python3 readdata.py > $LOGPATH & websocketd --port=8080 --staticdir=. tail -f $LOGPATH
sudo nice -20 python3 readdata.py > LOGPATH.format(timestamp()) & sudo websocketd --port=8080 --staticdir=. sudo python3 readdata.py