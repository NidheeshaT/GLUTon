from flask import Flask
from flask import request
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.debug=(not eval(os.getenv("PRODUCTION",False)))

@app.post("/")
def get_data():
    try:
        code=request.form['hello']
        print(code)
        return "success"
    except KeyError:
        return "fail"

@app.get("/")
def index():
    return "<h1>Hello, World!</h1>"


if __name__=='__main__':
   app.run()