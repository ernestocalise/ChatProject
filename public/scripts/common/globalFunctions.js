import { Timer } from "./classes/timer.js";
export function global() {
    //STRING
    var _isStringEmpty = function(str) {
        if(str != null && str.trim() != "") return false;
        return true;
    };

    //INTERFACE
    var _showLoader = function() {
        $(".loader").css("display", "block");
    };
    var _hideLoader = function() {
        $(".loader").css("display", "none");
    };
    var _playAudioIncomingCall = function() {
        $("#chatRingSound")[0].play();
    }

    //TIME
    const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    const _createTimer = function(name = "", callback,interval = 10, executeOnce = false) {
        return new Timer(name, callback, interval, executeOnce);
    };
    var _textFuncions = {
        isStringEmpty: _isStringEmpty
    };
    var _interface = {
        showLoader: _showLoader,
        hideLoader: _hideLoader,
        playAudioIncomingCall: _playAudioIncomingCall
    };
    var _time = {
        sleep: _sleep,
        timer: _createTimer
    }
    return {
        string: _textFuncions,
        interface: _interface,
        time: _time
    };
}