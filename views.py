from flask import Flask
from flask import request,send_file,make_response,render_template
from dotenv import load_dotenv
from subprocess import run
import os

load_dotenv()

app = Flask(__name__)
app.debug=(not eval(os.getenv("PRODUCTION",False)))

@app.post("/")
def get_data():
    print(request.form)
    try:
        code=str(request.json.get("code"))
        if not code:
            return make_response("No code provided",400)
        

        with open("display.cpp","w") as f:
            f.write('#include "display.h"\n\n\n')
            f.write('void CodeSnippet::display()\n{\n')
            f.write(code)
            f.write('\n}')
        command="g++ -I./include -L./lib *.cpp -lfreeglut -lglu32 -lopengl32 -lFreeImage -o main"
        result=run(command,capture_output=True,text=True)
        
        if(result.returncode==0):
            result=run("main")
            response=send_file("output.png",mimetype="image/png")
        else:
            errorMessage=result.stderr
            if errorMessage.split("\n")[0].find("CodeSnippet::display()")!=-1:
                errorMessage=errorMessage[errorMessage.find("\n")+1:]
            errorMessage=errorMessage.replace("display.cpp","display")

            response=make_response(errorMessage)
            response.status_code=400
            response.content_type="text/plain"

        return response
    except:
        return make_response("Server error",500)

@app.get("/")
def index():
    return render_template("index.html")


if __name__=='__main__':
   app.run()