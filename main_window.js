
try {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('onResize', (e) => setTimeout(onResize, 17))
} catch (e) {
    window.onresize = (e) => setTimeout(onResize, 17)
}

let interval = undefined
let lastOnStepTime = undefined
let inv = 100
let cfp = 10
let f4cp = 15
let icoi_output = undefined

function onLoad( ) {
    onResize( )
    let inputs = document.getElementsByTagName('input')
    for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        let input = inputs[inputIndex]
        if (!input.readonly) {
            input.onchange = onInputChanged
        }
    }
    icoi_output = document.getElementById('icoi-output')
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

function onInputChanged(event) {
    let element = event.srcElement
    let value = element.value
    switch (element.id) {
        case 'inv-input': inv = parseFloat(value); break
        case 'cfp-input': cfp = parseFloat(value); break
        case 'f4cp-input': f4cp = parseFloat(value); break
    }
    icoi_output.value = 100 - (cfp + f4cp)
}
