from flask import Flask
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)
app.debug=(not eval(os.getenv("PRODUCTION",False)))

@app.route("/")
def hello_world():
    return "<h1>Hello, World!</h1>"


if __name__=='__main__':
   app.run()