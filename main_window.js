
const { ipcRenderer } = require('electron');
ipcRenderer.on('onResize', (e) => setTimeout(onResize, 17))

let interval = undefined
let lastOnStepTime = undefined

function onLoad( ) {
    onResize( )
    // onStartInterval( )
}

function onStartInterval( ) {
    if (interval != undefined) {
        throw 'interval has already started'
    }
    interval = setInterval(onStep, 17)
    lastOnStepTime = Date.now( )
}

function onEndInterval( ) {
    if (interval == undefined) {
        throw 'interval has not started'
    }
    clearInterval(interval)
    interval = undefined
}

function onResize( ) {
}

function onStep( ) {
    let now = Date.now( )
    let deltaTime = (now - lastOnStepTime) / 1000
    
}
