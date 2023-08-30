import './style.css';
import './app.css';

import {EventsEmit, EventsOn} from '../wailsjs/runtime'

// Setup the greet function
document.addEventListener("DOMContentLoaded", () => {
    EventsOn("idevice", (state) => {
        document.getElementById("result")!.innerText = state
    })

    document.getElementById("refreshbutton")?.addEventListener("click", () => {
        EventsEmit("refresh")
    })
})
