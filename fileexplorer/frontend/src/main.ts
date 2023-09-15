import './style.css';
import './app.css';

import { EventsEmit, EventsOn } from '../wailsjs/runtime/runtime'

let selecteditem: HTMLElement
let lastselecteditem: HTMLElement

// Setup the greet function
EventsOn("idevice", (state, success) => {
    document.getElementById("result")!.innerText = state
    if (success) {
        (document.getElementById("accessbutton") as HTMLSelectElement).disabled = false
    }
})

EventsOn("directories", (f, isdir) => {
    let folder = document.getElementById("dirflex") as HTMLElement
    let img = document.createElement("img");
    img.id = "folder-img"

    let filename = document.createElement("p")
    filename.id = "filename"
    filename.innerText = f
    let folderdiv = document.createElement("div")
    if (isdir) {
        img.src = "../images/folder.svg";
        folderdiv.setAttribute("isdir", "true")
    }
    else {
        img.src = "../images/file-earmark.svg";
        folderdiv.setAttribute("isdir", "false")
    }
    folderdiv.id = "folder-div"
    folder.appendChild(folderdiv)
    folderdiv.appendChild(img)
    folderdiv.appendChild(filename)
    folderdiv.ondblclick = function (e) {
        if ((e.target as HTMLElement).getAttribute("isdir") == "true") {
            EventsEmit("getfiles", (e.target as HTMLElement).querySelector("p")?.innerText)
            document.getElementById("dirflex")!.innerHTML = ""
            console.log((e.target as HTMLElement).querySelector("p")?.innerText);
        }
    }
    folderdiv.onclick = function (e) {
        if (!e.ctrlKey && !e.shiftKey) {
            unselectelements()
        }
        if (!(e.target as HTMLElement).classList.contains("selected")) {
            (e.target as HTMLElement).classList.add("selected")
            if (!selecteditem || !selecteditem.classList.value) {
                selecteditem = (e.target as HTMLElement)
            }
        }
        if (e.shiftKey) {
            if (!lastselecteditem || !lastselecteditem.classList.value) {
                lastselecteditem = (e.target as HTMLElement)
            }
            let start = false;
            console.log("lastselecteditem:", lastselecteditem)
            document.querySelectorAll("#folder-div").forEach((element) => {
                if (start) {
                    element.classList.add('selected');
                }
                else {
                    element.classList.remove('selected');
                }
                if (element == lastselecteditem) {
                    start = !start;
                    element.classList.add('selected');
                } else if (selecteditem == element) {
                    start = !start;
                    element.classList.add('selected');
                }
            })
        }
    }
})

function unselectelements() {
    document.querySelectorAll("#folder-div").forEach((e) => {
        e.classList.remove("selected")
    })
    if (selecteditem) {
        selecteditem.classList.remove("selected")
    }
    if (lastselecteditem) {
        lastselecteditem.classList.remove("selected")
    }
}

document.onclick = function (e) {
    if ((e.target as HTMLElement).id == "folder-div") {
        return
    }
    unselectelements()
}

document.getElementById("refreshbutton")?.addEventListener("click", () => {
    EventsEmit("refresh")
})

document.getElementById("accessbutton")?.addEventListener("click", () => {
    fetch("explorer.html")
        .then(response => {
            return response.text()
        })
        .then(data => {
            document.body.innerHTML = data;
        });
    EventsEmit("getfiles", ".")
})
