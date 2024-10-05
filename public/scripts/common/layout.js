import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
var chatProject = chatProject || {};
//Setting up layout
chatProject.ajaxCall = ajaxCall().chat;
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
        }
    }
    var _currentActivePanel = "";
    var _initialize = function () {
        _hideAllPanels();
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
    
    // Bindings
    var _btnProfile_Click = function() {
        _setPanelVisible(_selectors.panels.profilePanel);
        _setMenubarButtonActive(_selectors.menu_items.profile_btn);
    }
    var _btnChat_Click = function() {
        _setPanelVisible(_selectors.panels.chatPanel);
        _setMenubarButtonActive(_selectors.menu_items.chat_btn);
    }
    var _doBindings = function() {
        $(_selectors.menu_items.profile_btn).on("click", _btnProfile_Click);
        $(_selectors.menu_items.chat_btn).on("click", _btnChat_Click);
    }
    me.initialize = _initialize;
    return me;
})(chatProject.layout || {});
$(document).ready(chatProject.layout.initialize);