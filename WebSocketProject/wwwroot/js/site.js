/* 
 * Websocket project 
 * 
 * required data attributes of checkboxes for the switches  : data-module-name, data-io-mode, data-io-number
 * each switch must have 'chck-switch' class
 * each switch must be within a div with id 'switch_area'
 * 
 * to get the switches in current area, each navigation button must have 'btn-area' class
 * required data attributes for navigation buttons: data-socket-ip, data-area-id
 * 
 */
var ws = null;
var commandText = "";
var processedCommand = {};
var switches;
var switchSound = new Audio("sounds/switch-on-off.mp3");

//loading overlay screen
var overlay = $("#overlay");

//buttons to navigate between the areas
var btnAreas = $(".btn-area");

//base container for switches
var switchArea = $("#switch_area");

//default websocket url from the active area on first load
var url = "ws://" + $(".btn-area.active").data("socket-ip");

//get the switches from the active area on first load
var area_id = $(".btn-area.active").data("area-id");

//checkbox to toggle each switch in the active area
var chckToggleAll = $("#chck_toggleall");

$(document).ready(function () {
    //create the first websocket with default configuration
    executeWebSocket(url, area_id);
});

//navigate between the areas and create the new websocket for selected area
btnAreas.click(function (e) {
    var senderObj = e.target;
    $(btnAreas).parent().removeClass("p-event-none");
    $(senderObj).parent().addClass("p-event-none");
    overlay.show();
    //get the websocket ip from the related navigation button
    url = "ws://" + $(senderObj).data("socket-ip");
    area_id = $(senderObj).data("area-id");
    ws.close();
    executeWebSocket(url, area_id);
});

function createWebSocket(wsUrl) {
    ws = new WebSocket(wsUrl);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
}

//get the switches in the area with ajax call and create new websocket on done function
function executeWebSocket(wsUrl, area_id) {
    switchArea.hide();
    $.ajax({
        type: "GET",
        url: "/Index?handler=SwitchList&id=" + area_id,
        dataType: "HTML"
    }).done(function (data) {
        switchArea.fadeIn(500);
        switchArea.html(data);
        switches = switchArea.find(".chck-switch");
        switchToggler();
        createWebSocket(wsUrl);
    });
}

//check whether each switch is checked/unchecked in an area
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
    requestSwitchStates();
    switchToggler();
    overlay.fadeOut(1000);
    console.log("websocket connected to: " + url);
}

function requestSwitchStates() {
    switches.each(function () {
        commandText = getCommandText(this, "req");
        ws.send(commandText);
    });
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