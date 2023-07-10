const glutKeywords = [
    "GLUT_DEPTH",
    "GLUT_BITMAP_TIMES_ROMAN_10",
    "GLUT_BITMAP_TIMES_ROMAN_24",
    "GLUT_BITMAP_HELVETICA_10",
    "GLUT_BITMAP_HELVETICA_12",
    "GLUT_BITMAP_HELVETICA_18",
    "GLUT_WINDOW_HEIGHT",
    "GLUT_WINDOW_HEIGHT",
];

const code = document.getElementById("code");
const headDiv = document.getElementById("head");
const tailDiv = document.getElementById("tail");
const nav = document.querySelector("nav");
const panel=document.getElementById("panel")

const setup = () => {
    if(!monaco)
    {
        console.error("monaco editor not initialized")
        return;
    }
    const editor = monaco.editor.create(code, {
        value: `\t//Write your code here\n`,
        language: "cpp",
        theme: "vs-dark",
        lineNumbers: (l) => "" + (l + 5),
        scrollBeyondLastLine: false,
    });

    const head = monaco.editor.create(headDiv, {
        value: "#include<iostream>\n#include<GL/glut.h>\n\nvoid display()\n{",
        language: "cpp",
        theme: "vs-dark",
        readOnly: true,
        lineNumbers: (l) => "",
        scrollBeyondLastLine: false,
    });
    const tail = monaco.editor.create(tailDiv, {
        value: "}\nint main(int argc, char** argv)\n{\n    glutInit(&argc, argv);\n    glutInitDisplayMode(GLUT_RGB | GLUT_SINGLE);\n    glutInitWindowSize(800, 600);\n    glutCreateWindow(\"GLUT to File\");\n    display();\n    glutDisplayFunc(display);\n    glutMainLoop();\n    return 0;\n}",
        language: "cpp",
        theme: "vs-dark",
        readOnly: true,
        lineNumbers: (l) => "",
        scrollBeyondLastLine: false,
    });

    monaco.languages.register({ id: "cpp" });

    monaco.languages.registerCompletionItemProvider("cpp", {
        provideCompletionItems: function (model, position) {
            const word = model.getWordUntilPosition(position);
            let arr = glutKeywords.map((element) => {
                return {
                    label: element,
                    kind: monaco.languages.CompletionItemKind.Enum,
                    insertText: element,
                    range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                    ),
                };
            });
            let a = [
                {
                    label: "cout",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: "cout",
                },
                {
                    label: "cin",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: "cin",
                },
                ...arr,
            ];
            a = a.filter((ele) => (ele.label.startsWith(word.word) ? 1 : 0));
            return {
                incomplete: true,
                suggestions: a,
            };
        },
    });
    const updateHeight = () => {
        const maxHeight= document.querySelector("html").getBoundingClientRect().height-
                                tailDiv.getBoundingClientRect().height-headDiv.getBoundingClientRect().height-nav.getBoundingClientRect().height
        const contentHeight = Math.min(
            maxHeight,
            editor.getModel().getLineCount() * 19
        );
        code.style.height = `${contentHeight}px`;
        editor.layout({
            width: code.getBoundingClientRect().width,
            height: contentHeight,
        });
    };
    editor.onDidContentSizeChange(updateHeight);

    const resize=(e) => {
        document.getElementById("head").style.height=head.getContentHeight()+"px"
        document.getElementById("tail").style.height=tail.getContentHeight()+"px"
        editor.layout({
            width: code.getBoundingClientRect().width,
            height: editor.getContentHeight(),
        });
        head.layout({
            width: code.getBoundingClientRect().width,
            height: head.getContentHeight(),
        });
        tail.layout({
            width: code.getBoundingClientRect().width,
            height: tail.getContentHeight(),
        });
        updateHeight()
    }
    resize()
    window.addEventListener("resize", resize);
    tail.onDidContentSizeChange(resize)

    function hashString(string) {
        let hash = 0;
      
        if (string.length === 0) {
          return hash.toString();
        }
      
        for (let i = 0; i < string.length; i++) {
          const charCode = string.charCodeAt(i);
          hash = (hash << 5) - hash + charCode;
          hash &= hash;
        }
        if(hash<0)
            hash*=-1;
        return hash.toString();
      }

    const sendCode=(e) => {
        location.hash="#display"
        let hash=hashString(editor.getValue())
        fetch("/", {
            method: "POST",
            body:JSON.stringify({code:editor.getValue(),hash:hash}),
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (response) => {
            if(response.status==400)
            {
                let problemTab=document.getElementById("problems-tab")
                let errors=await response.text()
                errors=errors.replace(/\n/g,"<br>")
                problemTab.innerHTML=errors
                location.hash="#problems"

            }
            else if(response.status===500){
                console.log(await response.text())
            }
            else if(response.status===200){
                const imageUrl = URL.createObjectURL(await response.blob());
                const img=document.createElement("img")
                img.src=imageUrl
                document.getElementById("display-tab").appendChild(img)
                document.getElementById("problems-tab").textContent="No problems have been detected"
                hash=""
            }
        });
    }

    document.querySelector("#run").addEventListener("click", sendCode);
};

require.config({
    paths: { vs: "https://unpkg.com/monaco-editor@0.40.0/min/vs" },
});
require(["vs/editor/editor.main"],setup);



const tabs=document.querySelectorAll(".tab");
const tabBtns=document.querySelectorAll(".tab-btn");

document.querySelector("#toggle-panel").addEventListener("click",()=>{
    if(location.hash==="")
        location.hash="#display"
    else
        location.hash=""
})


tabBtns.forEach((tb,k)=>{
    tb.addEventListener("click",()=>{
        location.hash=tb.id
    })

})
function switchTab(tb){
    let k=0;
    tabBtns.forEach((t,k1)=>{
        if(t.id===tb.id)
            k=k1;
        t.classList.remove(["selected-tab-btn"])
    })
    tb.classList.add(["selected-tab-btn"])
    tabs.forEach((t)=>{
        t.classList.remove(["selected-tab"])
    })
    tabs[k].classList.add(["selected-tab"])
}

const checkHash=()=> {
    try{
        if(location.hash==""){
            panel.style.display="none"
        }
        else{
            panel.style.display="flex"
        }
        let tb=document.querySelector(location.hash)
        if(tb)
            switchTab(tb)
    }
    catch{
        location.hash=""
    }
}
checkHash()
window.addEventListener("hashchange", checkHash);