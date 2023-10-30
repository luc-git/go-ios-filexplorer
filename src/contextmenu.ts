import { EventsEmit, EventsOn } from "../wailsjs/runtime/runtime"

let select = true

oncontextmenu = (element) => {
    element.preventDefault()
}

document.getElementById("copy")!.onclick = () => {
    document.querySelectorAll(".selected").forEach((element) => {
        EventsEmit("copyto", element.querySelector("p")?.innerText, select)
        select = false
    })
    select = true
}

document.getElementById("rename")!.onclick = (element) => {
    const oldname = document.querySelector(".selected")?.querySelector("p")?.innerText
    let name = document.querySelector(".selected")?.querySelector("p")
    name!.contentEditable = "true"
    name?.click()
    name!.style.pointerEvents = "all"
    name?.focus()
    name!.onkeydown = (key) => {
        if (key.code == "Enter") {
            name!.contentEditable = "false"
            name!.style.pointerEvents = "none"
            EventsEmit("renamepath", oldname, name?.innerText)
        }
    }
    name!.ondblclick = (element) => {
        element.stopPropagation()
    }
    element.stopPropagation()
    onclick = (element) => {
        if ((element.target as HTMLElement).nodeName == "P") {
            return
        }
        name!.contentEditable = "false"
        name!.style.pointerEvents = "none"
        name!.innerText = String(oldname)
    }
}

document.getElementById("add")!.onclick = () => {
    EventsEmit("addfiles")
}

EventsOn("copyfinished", (index) => {
    if (index > document.querySelectorAll(".selected").length) {
        return
    }
    EventsEmit("copyto", document.querySelectorAll(".selected").item(index++).querySelector("p")?.innerText, index++)
})

document.oncontextmenu = (element) => {
    if ((element.target as HTMLElement).id == "folder-div") {
        return
    }
    let dropdown = document.getElementById("contextmenu")
    dropdown!.hidden = false
    dropdown!.style.left = String(element.x) + "px"
    dropdown!.style.top = String(element.y) + "px";
    document.querySelectorAll(".contextmenuitem").forEach((element) => {
        if ((element as HTMLFieldSetElement).id != "add") {
            (element as HTMLFieldSetElement).disabled = true
        }
    })
}