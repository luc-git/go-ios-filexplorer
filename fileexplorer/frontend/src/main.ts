import './style.css';
import './app.css';

import { EventsEmit, EventsOn } from '../wailsjs/runtime/runtime'

// Setup the greet function
EventsOn("idevice", (state, success) => {
    document.getElementById("result")!.innerText = state
    if (success) {
        (document.getElementById("accessbutton") as HTMLSelectElement).disabled = false
    }
})

EventsOn("directories", (f, isdir) => {
    var folder = document.getElementById("dirflex") as HTMLElement
    var img = document.createElement("img");
    img.id = "folder-img"

    var filename = document.createElement("p")
    filename.innerText = f
    var folderdiv = document.createElement("div")
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


    for (let index = 0; index < folder.childElementCount; index++) {
        (folder.children[index] as HTMLElement).addEventListener("dblclick", () => {
            console.log(folder.getElementsByTagName("p")[index].textContent)
            if (folder.children[index].getAttribute("isdir") == "true") {
                EventsEmit("getfiles", folder.getElementsByTagName("p")[index].textContent)
                document.getElementById("dirflex")!.innerHTML = ""
            }
        })
    }
})

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
    EventsEmit("getfiles", "./")
})
