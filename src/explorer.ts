import { EventsEmit, EventsOn } from "../wailsjs/runtime/runtime"

import "./contextmenu"

let selecteditem: HTMLElement
let lastselecteditem: HTMLElement

EventsEmit("getfiles", "", false)

EventsOn("pathlist", addpath)

EventsOn("clearpage", () => {
    document.getElementById("dirflex")!.innerHTML = ""
})

function addpath(path: string, pathtype: number, appid: string) {
    console.log(path)
    let folderdiv = document.createElement("div")
    folderdiv.id = "folder-div"
    let dirflex = document.getElementById("dirflex")!
    dirflex.appendChild(folderdiv)

    let img = document.createElement("img")
    let name = document.createElement("p")
    name.innerText = path

    switch (pathtype) {
        case 0:
            img.src = "../images/folder.svg"
            break;
        case 1:
            img.src = "../images/file-earmark.svg"
            break;
        case 2:
            img.src = "../images/filesharingapps/" + path + ".png"
            folderdiv.setAttribute("appid", appid)
            break;
    }

    folderdiv.appendChild(img)
    folderdiv.appendChild(name)

    folderdiv.addEventListener("dblclick", (element) => {
        if (pathtype == 0) {
            EventsEmit("getfiles", (element.target as HTMLElement).querySelector("p")?.innerText,
                document.getElementById("filesharingbutton")?.classList.contains("panelselected"))
            console.log((element.target as HTMLElement).querySelector("p")?.innerText);
        } else if (pathtype == 2) {
            EventsEmit("connecttoapp", (element.target as HTMLElement).getAttribute("appid"))
        }
    });
    addsignals(folderdiv)
}

function addsignals(folderdiv: HTMLDivElement) {
    folderdiv.onclick = (element) => {
        selectelements(element)
    }
    folderdiv.oncontextmenu = (element) => {
        let dropdown = document.getElementById("contextmenu")
        dropdown!.hidden = false
        dropdown!.style.left = String(element.x) + "px"
        dropdown!.style.top = String(element.y) + "px";
        if (!document.querySelector(".selected")) {
            (element.target as HTMLElement).classList.add("selected")
        }
        else {
            document.querySelector(".selected")?.classList.remove("selected");
            (element.target as HTMLElement).classList.add("selected")
        }
        document.querySelectorAll(".contextmenuitem").forEach((element) => {
            (element as HTMLFieldSetElement).disabled = false
        })
    }
}

function selectelements(element: MouseEvent) {
    const htmlelement = element.target as HTMLElement
    if (!element.ctrlKey && !element.shiftKey) {
        unselectelements()
    }
    if (!htmlelement.classList.contains("selected")) {
        htmlelement.classList.add("selected")
        if (!selecteditem || !selecteditem.classList.value) {
            selecteditem = htmlelement
        }
    }
    if (element.shiftKey) {
        if (!lastselecteditem || !lastselecteditem.classList.value) {
            lastselecteditem = htmlelement
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
}

function unselectelements() {
    document.querySelectorAll("#folder-div").forEach((element) => {
        element.classList.remove("selected")
    })
    if (selecteditem) {
        selecteditem.classList.remove("selected")
    }
    if (lastselecteditem) {
        lastselecteditem.classList.remove("selected")
    }
}

document.onclick = (element) => {
    if ((element.target as HTMLElement).id == "folder-div") {
        return
    }
    document.getElementById("contextmenu")!.hidden = true
    unselectelements()
}

document.getElementById("filesystembutton")!.onclick = () => {
    document.getElementById("filesharingbutton")?.classList.remove("panelselected")
    document.getElementById("filesystembutton")?.classList.add("panelselected")
    EventsEmit("getfiles", "", false)
}

document.getElementById("filesharingbutton")!.onclick = () => {
    document.getElementById("filesystembutton")?.classList.remove("panelselected")
    document.getElementById("filesharingbutton")?.classList.add("panelselected")
    EventsEmit("getapps")
}