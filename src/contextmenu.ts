import { EventsEmit, EventsOn } from "../wailsjs/runtime/runtime"

let select = true

oncontextmenu = function (e) {
    e.preventDefault()
}

document.getElementById("copy")!.onclick = function () {
    document.querySelectorAll(".selected").forEach((element) => {
        EventsEmit("copyto", element.querySelector("p")?.innerText, select)
        select = false
    })
    select = true
}

document.getElementById("rename")!.onclick = function (e) {
    const oldname = document.querySelector(".selected")?.querySelector("p")?.innerText
    let name = document.querySelector(".selected")?.querySelector("p")
    name!.contentEditable = "true"
    name?.click()
    name!.style.pointerEvents = "all"
    name?.focus()
    name!.onkeydown = function (key) {
        if (key.code == "Enter") {
            name!.contentEditable = "false"
            name!.style.pointerEvents = "none"
            EventsEmit("renamepath", oldname, name?.innerText)
        }
    }
    name!.ondblclick = function (e) {
        e.stopPropagation()
    }
    e.stopPropagation()
    onclick = function (e) {
        if ((e.target as HTMLElement).nodeName == "P") {
            return
        }
        name!.contentEditable = "false"
        name!.style.pointerEvents = "none"
        name!.innerText = String(oldname)
    }
}

EventsOn("copyfinished", (index) => {
    if (index > document.querySelectorAll(".selected").length) {
        return
    }
    EventsEmit("copyto", document.querySelectorAll(".selected").item(index++).querySelector("p")?.innerText, index++)
})