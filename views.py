from flask import Flask
from flask import request,send_file,make_response
from dotenv import load_dotenv
from subprocess import run
import os

load_dotenv()

app = Flask(__name__)
app.debug=(not eval(os.getenv("PRODUCTION",False)))

@app.post("/")
def get_data():
    try:
        code=request.json["code"]

        with open("display.cpp","w") as f:
            f.write('#include "display.h"\n')
            f.write('void CodeSnippet::display(){\n')
            f.write(code)
            f.write('\n}')
        command="g++ -I./include -L./lib *.cpp -lfreeglut -lglu32 -lopengl32 -lFreeImage -o main"
        result=run(command,capture_output=True,text=True)
        
        if(result.returncode==0):
            result=run("main")
            response=send_file("output.png",mimetype="image/png")

            return response
        else:
            errorMessage=result.stderr
            if errorMessage.split("\n")[0].find("CodeSnippet::display()")!=-1:
                errorMessage=errorMessage[errorMessage.find("\n")+1:]
            errorMessage=errorMessage.replace("display.cpp","display")
            response=make_response(errorMessage)
            response.status_code=400
            response.content_type="text/plain"
            return response
    except KeyError:
        return "fail"

@app.get("/")
def index():
    return "<h1>Hello, World!</h1>"


if __name__=='__main__':
   app.run()