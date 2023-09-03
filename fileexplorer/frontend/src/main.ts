import './style.css';
import './app.css';

import {EventsEmit, EventsOn} from '../wailsjs/runtime'

// Setup the greet function
    EventsOn("idevice", (state, success) => {
        document.getElementById("result")!.innerText = state
        if(success){
            (document.getElementById("accessbutton") as HTMLSelectElement).disabled = false
        }
    })

    EventsOn("directories", (f) => {
        document.getElementById("dirflex")!.innerHTML += 
        "<div id='folder-div' width='105px' height='116px'> <img id='folder-img' src='../images/folder.png'/> <p>" + f + "</p> </div>"
        console.log("hizzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
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
        EventsEmit("getfiles")
    })
