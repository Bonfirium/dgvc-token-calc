
try {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('onResize', (e) => setTimeout(onResize, 17))
} catch (e) {
    window.onresize = (e) => setTimeout(onResize, 17)
}

let lastOnStepTime = undefined
let interval = undefined

let inputs = { }
let inputsNamesAndStartValues = [
    ['inv', 100, false],
    ['cfp', 0.1, true],
    ['f4cp', 0.15, true],
    ['tp', 0.002, false],
    ['tc', 1000000, false]
]

let outputs = { }
let outputsNames = [
    'icoip'
]

let vars = [ ]
let graphCanvas = null
let surface = null
let graph_y_top_label = null
let graph_y_top_middle = null
let graph_x_top_middle = null

function onLoad( ) {
    onResize( )
    inputsNamesAndStartValues.forEach(function(input) {
        let name = input[0]
        let value = input[1]
        let isShare = input[2]
        inputs[name] = document.getElementById(name + '-input')
        vars[name] = value
        inputs[name].value = isShare ? value * 100 : value
        inputs[name].onchange = onInputChanged
    }, this)
    outputsNames.forEach(function(outputName) {
        outputs[outputName] = document.getElementById(outputName + '-output')
    }, this)
    graphCanvas = document.getElementById('graph-canvas')
    surface = graphCanvas.getContext('2d')
    graph_y_top_label = document.getElementById('graph-y-top')
    graph_y_top_middle = document.getElementById('graph-y-middle')
    graph_x_top_middle = document.getElementById('graph-x-middle')
    onInputChanged(null)
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

function onInputChanged(e) {
    inputsNamesAndStartValues.forEach(function(input) {
        let name = input[0]
        let isShare = input[2]
        let value = inputs[name].value
        vars[name] = inputs[name].value * (isShare ? 0.01 : 1)
    }, this)
    vars.icoip = 100 * (1 - (vars.cfp + vars.f4cp))
    // vars.tc = Math.ceil(2*vars.inv / (vars.tp*vars.cfp))
    for (let name in outputs) {
        let output = outputs[name]
        output.value = vars[name]
    }
    readraw( )
}

function readraw( ) {
    surface.clearRect(0, 0, graphCanvas.width, graphCanvas.height)
    let _cw = graphCanvas.width - 32
    let _ch = graphCanvas.height - 32
    let _cx = 16
    let _cy = 16
    let mx = 1 - (vars.cfp+vars.f4cp)
    let maxTcp = mx * vars.tp
    let scale = _ch / maxTcp
    let yPrev = _ch
    surface.lineWidth = 2
    surface.strokeStyle = '#00ff00'
    surface.beginPath( )
    for (let i = 0; i < _cw; i++) {
        let x = i / _cw
        let stc = x * mx * vars.tc
        let scb = stc * vars.tp
        let utc = stc + vars.tc * (vars.cfp+vars.f4cp)
        let tcp = scb/utc
        let y = _ch - tcp*scale
        surface.moveTo(_cx + i - 1, _cy + yPrev)
        surface.lineTo(_cx + i, _cy + y)
        yPrev = y
    }
    surface.stroke( )
    surface.closePath( )
    surface.strokeStyle = '#0000ff'
    surface.beginPath( )
    surface.moveTo(_cw + _cx, 0)
    surface.lineTo(_cw + _cx, _ch + _cy)
    surface.lineTo(0, _ch + _cy)
    surface.stroke( )
    surface.closePath( )
    let cftp = vars.inv / (vars.tc*vars.cfp) 
    let cfy = _ch - cftp * scale
    surface.lineWidth = 1
    surface.strokeStyle = '#ff0000'
    surface.beginPath( )
    surface.moveTo(0, _cy + cfy)
    surface.lineTo(graphCanvas.width, _cy + cfy)
    surface.stroke( )
    surface.closePath( )
    /*
    cftp = tcp =
    scb/utc =
    ostc*tp / (ostc + tc * (sp+cfp))
    cftp * (ostc + tc * (sp+cfp)) = ostc*tp
    cftp*ostc + cftp*tc * (sp+cfp) - ostc*tp = 0
    (cftp-tp) * ostc = -cftp*tc * (sp+cfp)
    ostc = cftp*tc * (sp+cfp) / (tp-inv)
    */
    let ostc = cftp * vars.tc * (vars.f4cp + vars.cfp) / (vars.tp - cftp)
    let ostcx = (ostc / (vars.tc * (1 - (vars.cfp + vars.f4cp)))) * _cw + _cx
    surface.strokeStyle = '#888888'
    surface.beginPath( )
    surface.moveTo(ostcx, 0)
    surface.lineTo(ostcx, graphCanvas.height)
    surface.stroke( )
    surface.closePath( )
    if (cftp < maxTcp) {
        graph_y_top_label.innerText = maxTcp.toFixed(6)
        graph_y_top_middle.innerText = cftp.toFixed(6)
        let graph_y_top_middle_posY = _ch - cftp / maxTcp * _ch + _cy
        if (graph_y_top_middle_posY > graphCanvas.height) {
            graph_y_top_middle_posY = graphCanvas.height
        }
        if (graph_y_top_middle_posY < graph_y_top_label.clientHeight) {
            graph_y_top_middle_posY = graph_y_top_label.clientHeight
        }
        graph_y_top_middle.style.top = graph_y_top_middle_posY + 'px'
        graph_x_top_middle.style.visibility = 'visible'
        graph_x_top_middle.style.left = (ostcx - _cx) / _cw * 100 + '%'
        graph_x_top_middle.innerText = Math.ceil(ostc)
    } else {
        graph_y_top_middle.style.top = '50%'
        graph_y_top_middle.innerText = 'Нет прибыли'
        graph_x_top_middle.style.visibility = 'hidden'
    }
}
