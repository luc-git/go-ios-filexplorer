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
    fetch("explorer.html")
        .then(response => {
            return response.text()
        })
        .then(data => {
            document.body.innerHTML = data;
        });
    import('./explorer')
    EventsEmit("getfiles", "")
})
