from flask import *

app = Flask(__name__)
app.static_folder = 'static'

path = "../Data/"

temp_path = "{}Current.json".format(path)
data_dict = {"!!": "", "@@": "", "##": "", "%%": "", "$$": ""}

def updateJSON():
    global data_dict
    with open(temp_path) as data:
        data_dict = json.load(data)

@app.route('/index')
def index():
    return render_template('index.html', title='Home', parsed=data_dict)


# run the application
if __name__ == "__main__":
    app.run(debug=True)