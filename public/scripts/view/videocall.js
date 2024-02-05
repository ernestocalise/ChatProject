import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
import {VideoStreamObject} from "./../common/classes/chatProject/VideoStreamObject.js"
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
        remoteVideo: "remoteVideo",
        createConference: "#createConference",
        requireUserMedia: "#requireUserMedia",
        startCall: "#startCall",
        txtCallId: "#txtCallId",
        answerCall: "#answerCall",
    };    
    var _videoStreamObject = null;
    var _texts = {};
    var _fromPhpPage = {};
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
        _initializeVideoStreamObject();
        _doBindings();
    };

    //Logical function
    var _initializeVideoStreamObject = function () {
        _videoStreamObject = new VideoStreamObject(_selectors.inputVideo, _selectors.remoteVideo, _fromPhpPage.stunServerConfiguration);
        _videoStreamObject.csrf_token = $(_selectors.csrf_token).attr("content");
    }
    //Graphical function

    //Generative function

    //Bindings
    var _doBindings = function() {
        $(_selectors.answerCall).bind("click", function(){
            let callId = $(_selectors.txtCallId).val();
            _videoStreamObject.answer(callId);
        });
        $(_selectors.createConference).bind("click", function(){
            _videoStreamObject.createConference([2,3,4]);
        });
        $(_selectors.requireUserMedia).bind("click", function() {
            _videoStreamObject.initializeUserMedia(true,false,false);
        });
        $(_selectors.startCall).bind("click", function() {
            _videoStreamObject.call();
        })
    }
    me.initialize = _initialize;
    return me;
})(chatProject.videoCall || {});
$(document).ready(chatProject.videoCall.initialize);