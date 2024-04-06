import { ajaxCall } from "./ajaxCalls.js";
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
        document.getElementById("chatRingSound").play();
    }
    var _stopAudioIncomingCall = function() {
        document.getElementById("chatRingSound").pause();
    }
    var _checkIncomingCall = async function(csrf_token, answerMethod) {
        let _timerLookup = async function() {
            let callContainer = document.getElementById("callContainer");
            let response = await ajaxCall().videoCall.checkIncomingSoundCall(
                {
                    '_token': csrf_token,
                }
            );
            if(response.status){
                response.data.forEach(call => {
                    if(!document.getElementById(`call-${call.conference_id}`)){
                        let newCall = document.createElement("div");
                        newCall.className = "call";
                        newCall.id = `call-${call.conference_id}`;
                        newCall.innerHTML = `<p>Chiamata da ${call.caller_id}</p>`;
                        let answerButton = document.createElement("button");
                        answerButton.innerHTML = "Rispondi";
                        answerButton.onclick = function() {
                            _stopAudioIncomingCall();
                            answerMethod(call.conference_id);
                        }
                        newCall.appendChild(answerButton);
                        callContainer.appendChild(newCall);
                        _playAudioIncomingCall();
                    }
                    console.log(call);
                });
            } else {
                console.log("nope");
            }
        }
        
        let tmr = _createTimer("tmrCallLookup", _timerLookup, 2);
        tmr.start();
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
        playAudioIncomingCall: _playAudioIncomingCall,
        stopAudioIncomingCall: _stopAudioIncomingCall,
        checkIncomingCall: _checkIncomingCall
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