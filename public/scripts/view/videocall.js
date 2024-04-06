import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
import {VideoStreamObject} from "./../common/classes/chatProject/VideoStreamObject.js"
import {VideoStreamObjectOrchestrator } from "./../common/classes/chatProject/VideoStreamObjectOrchestrator.js"
var chatProject = chatProject || {};

//Setting up chatPage
chatProject.ajaxCall = ajaxCall().chat;
chatProject.fh = global();
chatProject.videoCall = (function (me) {
    var _activeChatId = 0;
    var _arrCurrentChats = [];
    var _timeouts = {

    };
    var _selectors = {
        csrf_token: 'meta[name=csrf-token]',
        inputVideo: "localVideo",
        videoContainer: "videoContainer",
        createConference: "#createConference",
        playCallSound: "#playCallSound",
        startCall: "#startCall",
        txtCallId: "#txtCallId",
        answerCall: "#answerCall",
    };    
    var _videoStreamOrchestrator = null;
    var _texts = {};
    var _fromPhpPage = {
        personalUserId: null,
		initialUserStatus: null, 
		stunServerConfiguration: null
    };
    var _readPhpPageData = function() {
        _fromPhpPage = JSON.parse($("#fromPhpPage").val());
        console.log($("#fromPhpLocale").val());
        _texts = JSON.parse($("#fromPhpLocale").val());
        $("#fromPhpPage").remove();
        $("#fromPhpLocale").remove();
    }
    var _initialize = async function(){
        await chatProject.fh.time.sleep(500);
        _readPhpPageData();
        console.log(_fromPhpPage, _texts);
        _initializeVideoStreamOrchestrator();

        var _answerCallButtonAction = function(x) {
            _videoStreamOrchestrator.answerCall(x)
        }
        chatProject.fh.interface.checkIncomingCall($(_selectors.csrf_token).attr("content"), _answerCallButtonAction);
        _doBindings();
    };

    //Logical function
    var _initializeVideoStreamOrchestrator = function () {
        _videoStreamOrchestrator = new VideoStreamObjectOrchestrator(_selectors.inputVideo, _selectors.videoContainer, _fromPhpPage.stunServerConfiguration,_fromPhpPage.personalUserId);
        _videoStreamOrchestrator.csrf_token = $(_selectors.csrf_token).attr("content");
    }
    //Graphical function

    //Generative function

    //Bindings
    var _doBindings = function() {
        $(_selectors.answerCall).bind("click", function(){
            let callId = $(_selectors.txtCallId).val();
            _videoStreamOrchestrator.answerCall(callId);
        });
        $(_selectors.createConference).bind("click", function(){
            _videoStreamOrchestrator.startCall([2,3,4,5,6]);
        });
        $(_selectors.playCallSound).bind("click", function() {
            chatProject.fh.interface.playAudioIncomingCall();
        });
        $(_selectors.startCall).bind("click", function() {
            _videoStreamOrchestrator.call();
        })
    }
    me.initialize = _initialize;
    return me;
})(chatProject.videoCall || {});
$(document).ready(chatProject.videoCall.initialize);