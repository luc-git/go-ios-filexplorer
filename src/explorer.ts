import { EventsEmit, EventsOn } from "../wailsjs/runtime/runtime"

import "./contextmenu"

let selecteditem: HTMLElement
let lastselecteditem: HTMLElement

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})

EventsEmit("getfiles", "")

EventsOn("pathlist", addpath)

EventsOn("appslist", addappspath)

function addappspath(path: string, appid: string) {
    console.log(path)
    let folderdiv = document.createElement("div")
    folderdiv.id = "folder-div"
    let dirflex = document.getElementById("dirflex")!
    dirflex.appendChild(folderdiv)

    let img = document.createElement("img")
    let name = document.createElement("p")
    name.innerText = path

    img.src = "../images/filesharingapps/" + appid + ".png"
    folderdiv.setAttribute("appid", appid)

    folderdiv.appendChild(img)
    folderdiv.appendChild(name)

    folderdiv.addEventListener("dblclick", (e) => {
        EventsEmit("connecttoapp", (e.target as HTMLElement).getAttribute("appid"))
        document.getElementById("dirflex")!.innerHTML = ""
    });

    addsignals(folderdiv)
}

function addpath(path: string, isdir: boolean) {
    console.log(path)
    let folderdiv = document.createElement("div")
    folderdiv.id = "folder-div"
    let dirflex = document.getElementById("dirflex")!
    dirflex.appendChild(folderdiv)

    let img = document.createElement("img")
    let name = document.createElement("p")
    name.innerText = path

    if (isdir) {
        img.src = "../images/folder.svg"
    } else {
        img.src = "../images/file-earmark.svg"
    }

    folderdiv.appendChild(img)
    folderdiv.appendChild(name)

    folderdiv.addEventListener("dblclick", (e) => {
        if (isdir) {
            EventsEmit("getfiles", (e.target as HTMLElement).querySelector("p")?.innerText)
            document.getElementById("dirflex")!.innerHTML = ""
            console.log((e.target as HTMLElement).querySelector("p")?.innerText);
        }
    });
    addsignals(folderdiv)
}

function addsignals(folderdiv: HTMLDivElement) {
    folderdiv.addEventListener("click", (e) => {
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
        document.getElementById("contextmenu")!.hidden = true
    });
    folderdiv.oncontextmenu = function (e) {
        let dropdown = document.getElementById("contextmenu")
        dropdown!.hidden = false
        dropdown!.style.left = String(e.x + 5) + "px"
        dropdown!.style.top = String(e.y + 5) + "px";
        if (!document.querySelectorAll(".selected").item(0)) {
            (e.target as HTMLElement).classList.add("selected")
        }
    }
}

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
    document.getElementById("contextmenu")!.hidden = true
    unselectelements()
}

document.getElementById("filesystembutton")!.classList.add("panelselected")
document.getElementById("filesystembutton")!.onclick = function () {
    document.getElementById("filesharingbutton")?.classList.remove("panelselected")
    document.getElementById("filesystembutton")?.classList.add("panelselected")
    document.getElementById("dirflex")!.innerHTML = ""
    EventsEmit("filesystemmode")
    EventsEmit("getfiles", "")
}

document.getElementById("filesharingbutton")!.onclick = function () {
    document.getElementById("filesystembutton")?.classList.remove("panelselected")
    document.getElementById("filesharingbutton")?.classList.add("panelselected")
    document.getElementById("dirflex")!.innerHTML = ""
    EventsEmit("getapps")
}