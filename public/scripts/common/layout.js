import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
var chatProject = chatProject || {};
//Setting up layout
chatProject.ajaxCall = ajaxCall().videoCall;
chatProject.fh = global();
chatProject.layout = (function (me) {
    var _selectors = {
        panels: {
            profilePanel: "#layout-panel-profile",
            chatPanel: "#layout-panel-chat",
            allPanels: ".layout-panel"
        },
        menu_items: {
            profile_btn: "#profile-btn" ,
            chat_btn:"#chat-btn",
            allMenuItems: ".layout-menu-bar-menu-item"
        },
        panel_incoming_call: {
            window: "#layout-panel-incoming-call",
            name: "#layout-panel-incoming-call-name",
            image: "#layout-panel-incoming-call-image",
            btnAnswer: "#layout-panel-incoming-call-btnAnswer",
            btnCancel: "#layout-panel-incoming-call-btnCancel"
        }
    }
    var _isSoundCallPlaying = false;
    var _soundCallPlaying_StartTime = null;
    var _soundCallPlaying_CallId = null;
    var _soundCallPlaying_SoundCallId = null;
    var _timeouts = {
        checkIncomingSoundCall: 2,
    };
    var _timers = {
        tmrCheckIncomingSoundCall: null
    }
    var _currentActivePanel = "";
    var _initialize = function () {
        _hideAllPanels();
        _timers.tmrCheckIncomingSoundCall = chatProject.fh.time.timer("_tmrCheckIncomingSoundCall ", _checkIncomingChat_OnTick, _timeouts.checkIncomingSoundCall, false);
        _timers.tmrCheckIncomingSoundCall.start();
        _doBindings();
    }

    //Panels Behaviours
    var _hideAllPanels = function() {
        $(_selectors.panels.allPanels).each(function(index) {
            $(this)[0].className = "layout-panel";
        });
    }
    var _setPanelVisible = function(panel) {
        if(_currentActivePanel == panel)
            return;
        _hideAllPanels();
        $(panel)[0].className = "layout-panel layout-panel-active";
        let _setVisible = function () {
            $(panel)[0].classList.add("layout-panel-visible");
        }
        setTimeout(_setVisible, 100);
        _currentActivePanel = panel;
    }
        
    //MenuButtons Behaviours
    var _disableAllButtons = function(){
        $(_selectors.menu_items.allMenuItems).each(function(index) {
            $(this)[0].className = "layout-menu-bar-menu-item";
        });
    }
    var _setMenubarButtonActive = function(button){
        _disableAllButtons();
        $(button)[0].classList.add("layout-menu-bar-menu-item-active");
    }
    var _checkIncomingChat_OnTick = function() {
        if(_isSoundCallPlaying){
            let currentDate = new Date();
            currentDate.setSeconds(currentDate.getSeconds() - 30)
            if(currentDate > _soundCallPlaying_StartTime){
                _isSoundCallPlaying = false;
                $(_selectors.panel_incoming_call.window).css("display","none");
                chatProject.fh.interface.stopAudioIncomingCall();
            }
        }
        else {
            let _successCallback = function(response) {
                if(response.status){
                    $(_selectors.panel_incoming_call.window).css("display","flex");
                    $(_selectors.panel_incoming_call.name).html(response.data[0].chat_name)
                    $(_selectors.panel_incoming_call.image).prop("src", response.data[0].chat_image);
                    $(_selectors.panel_incoming_call.image).prop("src", response.data[0].chat_image);
                    chatProject.fh.interface.playAudioIncomingCall();
                    _isSoundCallPlaying = true;
                    _soundCallPlaying_StartTime = new Date();
                    _soundCallPlaying_SoundCallId = response.data[0].sound_call_id;
                    _soundCallPlaying_CallId = response.data[0].chat_id;
                }else {
                    $(_selectors.panel_incoming_call.window).css("display","none");
                    chatProject.fh.interface.stopAudioIncomingCall();
                }
            }
            let _errorCallback = function(){}
            chatProject.ajaxCall.checkIncomingSoundCall(_successCallback, _errorCallback)
        }
    }
    var _resetIncomingCallAnswer = function () {
        _isSoundCallPlaying = false;
        _soundCallPlaying_StartTime = null;
        _soundCallPlaying_CallId = null;
        _soundCallPlaying_SoundCallId = null;
        $(_selectors.panel_incoming_call.window).css("display","none");
        chatProject.fh.interface.stopAudioIncomingCall();
    }
    // Bindings
    var _btnProfile_Click = function() {
        _setPanelVisible(_selectors.panels.profilePanel);
        _setMenubarButtonActive(_selectors.menu_items.profile_btn);
    }
    var _btnChat_Click = function() {
        _setPanelVisible(_selectors.panels.chatPanel);
        _setMenubarButtonActive(_selectors.menu_items.chat_btn);
    }
    var _btnAnswerCall_Click = function() {
        chatProject.ajaxCall.setIncomingSoundCallAnswerStatus(_soundCallPlaying_SoundCallId,1);
        window.open(`/conference/show/${_soundCallPlaying_CallId}`, "Videochiamata", "toolbar=0,location=0,menubar=0");
        _resetIncomingCallAnswer();
    }
    var _btnCancelCall_Click = function() {
        chatProject.ajaxCall.setIncomingSoundCallAnswerStatus(_soundCallPlaying_SoundCallId,2);
        _resetIncomingCallAnswer();
    }
    var _doBindings = function() {
        $(_selectors.menu_items.profile_btn).on("click", _btnProfile_Click);
        $(_selectors.menu_items.chat_btn).on("click", _btnChat_Click);
        $(_selectors.panel_incoming_call.btnAnswer).on("click", _btnAnswerCall_Click);
        $(_selectors.panel_incoming_call.btnCancel).on("click", _btnCancelCall_Click);
    }
    me.initialize = _initialize;
    return me;
})(chatProject.layout || {});
$(document).ready(chatProject.layout.initialize);