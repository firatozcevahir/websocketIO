//default websocket url
var url = "ws://192.168.43.159:81";
//var url = "ws://10.34.82.5:81";

var ws = null;
var commandText = "";
var processedCommand = {};

var switches = $("#area1").find(".chck-switch");
var btnAreas = $(".btn-area");
var chckToggleAll = $("#chck_toggleall");
var overlay = $("#overlay");

$(document).ready(function () {
    createWebSocket();
});

btnAreas.click(function (e) {
    url = "ws://" + $(e.target).data('socket-ip') + ":81";
    switches = $("#" + $(e.target).data('target-area')).find(".chck-switch");
    overlay.show();
    ws = null;
    createWebSocket();
});

function createWebSocket() {
    ws = new WebSocket(url);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
}

var onOpen = function () {    
    switches.change(function (e) {
        //get the command string of related switch object and send to the websocket
        commandText = getCommandText(e.target, "cmd");
        ws.send(commandText);
    });

    //first states of all the switches will be send from here on connection open
    switches.each(function () {
        commandText = getCommandText(this, "req");
        ws.send(commandText);
    });
    overlay.fadeOut(1000);

    console.log('websocket connected to: ' + url);
}

var onMessage = function (event) {
    //process the incoming command message and get it as JSON object
    processedCommand = processCommand(event.data);
    console.log(processedCommand);
    if (processedCommand.cmdtype == "bro") {
        updateStateOfSwitch(processedCommand);
    }
}

var onError = function (event) {
    //websocket connection fail
    console.log('websocket failed to connect: ' + url);
    setTimeout("location.reload(true);", 1000);
}

var onClose = function (event) {
    ws = null;
    console.log("Bağlantı kapatıldı");
}

function processCommand(cmdText) {
    //return the incoming command string as Json Object
    return {
        "cmdtype": cmdText.substring(0, 3),
        "modulename": cmdText.substring(3, 5),
        "iomode": cmdText.substring(5, 7),
        "ionumber": cmdText.substring(7, 9),
        "state": cmdText.substring(9, 11)
    }
}

function getCommandText(e, type) {
    //return the command type and data attribute values of the related object as a command string
    return type + $(e).data('module-name') + $(e).data('io-mode') + $(e).data('io-number') + (e.checked ? "01" : "00");
}

function updateStateOfSwitch(pcommand) {
    //change the 'checked' state of the related object depending on the processed command
    $('[data-module-name="' + pcommand.modulename + '"][data-io-mode="' + pcommand.iomode + '"][data-io-number="' + pcommand.ionumber + '"]').prop('checked', (pcommand.state == "01" ? true : false));
}

chckToggleAll.change(function (e) {
    //change the 'checked' state of all the switches depending on the related object's 'checked' state
    switches.each(function () {
        this.checked = e.target.checked;
        commandText = getCommandText(this, "cmd");
        ws.send(commandText);
    });
});