from flask import Flask
from flask import request,send_file,make_response,render_template,jsonify
from dotenv import load_dotenv
from subprocess import run
import os

load_dotenv()

app = Flask(__name__)
app.debug=(not eval(os.getenv("PRODUCTION",False)))
codes={}
running =False

def clean_code(code:str):
    lst=code.split("\n")

    malicious_functions=["system","popen","getenv","putenv","fork","spawn","exec","CreateProcess","ShellExecute", 'fopen','fclose','fread','fwrite','fgetc','fputc','fgets','fputs','fprintf','fscanf','fseek','ftell','rewind','remove','rename']
    for i,c in enumerate(lst):
        if c.strip().startswith("#"):
            lst[i]=""
            continue
        
        for m in malicious_functions:
            if c.find(m)!=-1:
                lst[i]=""
                break
    
    return "\n".join(lst)

@app.post("/")
def get_data():
    # try:
    code=str(request.json.get("code"))
    hashCode=str(request.json.get("hash"))

    if not code or not hashCode:
        return make_response("Invalid request",400)

    if hashCode in codes:
        return send_file(f"media/{hashCode}.png",mimetype="image/png")


    with open(f"{hashCode}.cpp","w") as f:
        f.write('#include "display.h"\n\n\n')
        f.write('void CodeSnippet::display()\n{\n')
        f.write(code)
        f.write('\n}')
    # command=f"g++ -I./include -L./lib main.cpp {hashCode}.cpp -lfreeglut -lglu32 -lopengl32 -lFreeImage -o {hashCode}"
    command=f"g++ main.cpp {hashCode}.cpp -lglut -lGL -lGLU -lfreeimage -lstdc++ -o {hashCode}"
    command=command.split()
    result=run(command,capture_output=True,text=True)

    if(result.returncode==0):
        # command=f"./{hashCode} {hashCode}"
        command=f"xvfb-run ./{hashCode} {hashCode}"
        command=command.split()
        result=run(command,timeout=5)
        if result.returncode==0:
            codes[hashCode]=True
            return send_file(f"media/{hashCode}.png",mimetype="image/png")
        else:
            return make_response("Server error",500)
    else:
        errorMessage=result.stderr
        if errorMessage.split("\n")[0].find("CodeSnippet::display()")!=-1:
            errorMessage=errorMessage[errorMessage.find("\n")+1:]
        errorMessage=errorMessage.replace(f"{hashCode}.cpp","display")

        response=make_response(errorMessage)
        response.status_code=400
        response.content_type="text/plain"
    
    return response
    # except:
    #     return make_response("Server error",500)
    # finally:
    if hashCode:
        try:
            os.remove(f"/app/{hashCode}.cpp")
        except:
            pass
        try:
            os.remove(f"/app/{hashCode}.out")
        except:
            pass

@app.get("/")
def index():
    return render_template("index.html")


if __name__=='__main__':
   app.run()