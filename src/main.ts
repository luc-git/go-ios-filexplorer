import { EventsEmit, EventsOn } from "../wailsjs/runtime/runtime"

EventsOn("idevice", (state, success) => {
    document.getElementById("result")!.innerText = state
    if (success) {
        (document.getElementById("accessbutton") as HTMLSelectElement).disabled = false
    }
})

document.getElementById("refreshbutton")?.addEventListener("click", () => {
    EventsEmit("refresh")
})

document.getElementById("accessbutton")?.addEventListener("click", () => {
    const request = new XMLHttpRequest
    request.open("get", "explorer.html", false)
    request.send()
    console.log("load")
    document.body.innerHTML = request.responseText;
    import('./explorer')
})
