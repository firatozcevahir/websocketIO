/* 
 * Websocket project 
 * 
 * required data attributes of checkboxes for the switches  : data-module-name, data-io-mode, data-io-number
 * each checkbox must have 'chck-switch' class
 * each checkbox must be within a div with id targeted by related tab navigation button
 * 
 * to get the switches in current area, each tab navigation button must have 'btn-area' class
 * required data attributes for navigation buttons: data-socket-ip, data-target-area
 * each button must target a div that switches are in * * 
 * 
 */
var ws = null;
var commandText = "";
var processedCommand = {};

//default websocket url from the default area on first load
var url = "ws://" + $(".btn-area.active").data("socket-ip");

//get the default switches from the active area on first load
var targetArea = $(".btn-area.active").data("target-area");
$("#" + targetArea).toggleClass("active show");
var switches = $("#" + targetArea).find(".chck-switch");
var switchSound = new Audio("sounds/switch-on-off.mp3");

//get buttons to navigate between the areas
var btnAreas = $(".btn-area");

//checkbox to toggle each switch in the active area
var chckToggleAll = $("#chck_toggleall");

//loading overlay screen
var overlay = $("#overlay");

$(document).ready(function () {
    //create the first websocket with default configuration
    switchToggler();
    createWebSocket();
});

//navigating between the areas and create the new websocket for selected area
btnAreas.click(function (e) {
    $(btnAreas).parent().removeClass("p-event-none");
    $(e.target).parent().addClass("p-event-none");
    //get the websocket ip from the related navigation button
    url = "ws://" + $(e.target).data("socket-ip");
    //get the switches of the selected area by using data attribute of the related navigation button
    switches = $("#" + $(e.target).data("target-area")).find(".chck-switch");
    overlay.show();
    ws.close();
    createWebSocket();
});

function createWebSocket() {
    ws = new WebSocket(url);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
}

function switchesAreChecked() {
    var allChecked = false;
    switches.each(function () {
        if (this.checked) {
            allChecked = true;
        } else {
            allChecked = false;
            return false;
        }
    });
    return allChecked;
}

var onOpen = function () {
    //first state of each switch in the related area will be send from here on connection open
    switches.each(function () {
        commandText = getCommandText(this, "req");
        ws.send(commandText);
    });

    switchToggler();
    overlay.fadeOut(1000);
    console.log("websocket connected to: " + url);
}

var onMessage = function (event) {
    //process the incoming command message and get it as JSON object
    processedCommand = processCommand(event.data);
    console.log(processedCommand);
    if (processedCommand.cmdtype == "bro") {
        updateStateOfSwitch(processedCommand);
        chckToggleAll.prop("checked", switchesAreChecked());
    }
}

var onError = function (event) {
    //websocket connection fail
    console.log("websocket failed to connect to: " + url);
    setTimeout("location.reload(true);", 2000);
}

var onClose = function () {
    console.log(url + " connection closed");
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
    //return the command type and data attribute values of the related switch as a command string
    return type + $(e).data("module-name") + $(e).data("io-mode") + $(e).data("io-number") + (e.checked ? "01" : "00");
}

function updateStateOfSwitch(pcommand) {
    //change the 'checked' state of the related switch depending on the processed command
    $('[data-module-name="' + pcommand.modulename + '"][data-io-mode="' + pcommand.iomode + '"][data-io-number="' + pcommand.ionumber + '"]').prop("checked", (pcommand.state == "01" ? true : false));
}

function switchToggler() {
    switches.change(function (e) {
        //get the command string of related switch object and send via websocket
        var senderObj = e.target;
        toggleWorker(senderObj, 500, switchSound);
        if (ws.readyState === 1) {
            commandText = getCommandText(senderObj, "cmd");
            ws.send(commandText);
        } else {
            overlay.show();
        }
    });
}

chckToggleAll.change(function (e) {
    //change the 'checked' state of each switch in the current area depending on the related object's 'checked' state
    var senderObj = e.target;
    toggleWorker(senderObj, 500, switchSound);
    switches.each(function () {
        this.checked = senderObj.checked;
        commandText = getCommandText(this, "cmd");
        ws.send(commandText);
    });
});

function toggleWorker(item, millisecond, audio_item) {
    //play sound on event and disable the related object for provided millisecond long
    item.disabled = true;
    setTimeout(function () { item.disabled = false; }, millisecond);
    audio_item.play();
}