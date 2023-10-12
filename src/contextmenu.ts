import { EventsEmit, EventsOn } from "../wailsjs/runtime/runtime"

let select = true

document.getElementById("copy")!.onclick = function () {
    document.querySelectorAll(".selected").forEach((element) => {
        EventsEmit("copyto", element.querySelector("p")?.innerText, select)
        select = false
    })
    select = true
}

EventsOn("copyfinished", (index) => {
    if (index > document.querySelectorAll(".selected").length) {
        return
    }
    EventsEmit("copyto", document.querySelectorAll(".selected").item(index++).querySelector("p")?.innerText, index++)
})