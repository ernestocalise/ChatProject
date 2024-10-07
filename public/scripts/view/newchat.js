import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
var chatProject = chatProject || {};

//Setting up chatPage
chatProject.ajaxCall = ajaxCall().chat;
chatProject.fh = global();
chatProject.chatPage = (function (me) {
    var _activeChatId = 0;
    var _arrCurrentChats = [];
    var _timeouts = {
        checkChatChanged: 1,
        checkChatCount: 5
    };
    var _componentsData = {
        user: {
            userID : null,
            userStatus: null
        }
    }
    var _selectors = {
        csrf_token: 'meta[name=csrf-token]',
        user_status_bubble: "#layout-notification-bubble-user-status",
        chatContainer: {
            window: "#chat-container",
            searchbar: {
                window: "#search-bar-container",
                txtSearchBar: "#chat-container-search-bar",
                btnAdd: "#chat-container-search-bar-container-btnAdd"
            },
            topbar: {
                window: "#chat-container-topbar",
                profile_container: {
                    chat_image: "#chat-container-topbar-chat-image",
                    chat_name: "#chat-container-topbar-chat-name"
                },
                action_container: {
                    window: "#chat-container-action-container",
                    action_call: "#chat-container-topbar-action-call",
                    search_bar: "#chat-container-topbar-search-bar",
                    action_details: "#chat-container-topbar-action-details"
                }
            },
            user_list: {
                window: "#chat-container-userlist-container",
                allChatbox: ".userlist-container-chatbox",
                singleChatById: function(chat_id) {return $(`#chat-container-userlist-container-chatbox-${chat_id}`)}
            },
            main_container: {
                window: "#chat-container-main-container",
                chat_container: {
                    window: "#main-container-content-chat-container",
                    allMessage: ".chat-container-main-container-chat-message",
                    singleMessageById: function(message_id) { return $(`chat-container-main-container-chat-message-${message_id}`);}
                },
                bottom_bar: {
                    txtMessage: "#main-container-bottombar-textbox",
                    btnSend: "#main-container-bottombar-btn-send"
                }
            },
            sidebar: {
                window:"#chat-container-main-container-sidebar",
                panorama_image: "#chat-container-main-container-sidebar-panorama-image",
                profile_image: "#chat-container-main-container-sidebar-profile-image",
                profile_name: "#chat-container-sidebar-text-container-profile-name",
                skill_description: "#chat-container-sidebar-text-container-skill-description",
                job_description: "#chat-container-sidebar-text-container-job-description",
                user_container: "#chat-container-sidebar-userlist-container"
            }
        },
        dialog: {
            background: "#chat-container-dialog-box-container",
            window: "#chat-container-dialog-box",
            txtSearch: "#chat-container-dialog-box-search-box",
            txtChatName: "#chat-container-dialog-box-textbox-chat-name",
            searchResultContainer: "#chat-container-dialog-box-search-result",
            searchResultItem: {
                allSearchResult: ".dialog-box-search-result-element",
                allCheckboxes: ".dialog-box-search-result-element-checkbox",
                searchResultById: function(id) {return "#chat-container-dialog-box-search-result-element-"+id },
                searchResultImageById: function(id) {return "#chat-container-dialog-box-search-result-image-"+id },
                searchResultSpanById: function(id) {return "#chat-container-dialog-box-search-result-span-"+id },
                serchResultCheckboxById: function(id) {return "#chat-container-dialog-box-search-result-checkbox-"+id }
            },
            btnCreateChat : "#chat-container-dialog-box-btn-create-chat"
        }
    };    
    var _texts = {}
    var _fromPhpPage = {}
    var _timers = {
        tmrCheckChatChanged: null,
        tmrCheckChatCount: null,
        tmrUploadFile: null
    };
    var _isSidebarVisible = false;
    var  _getUserComponentsData = function(){
        setTimeout(
            function() {
                _componentsData = JSON.parse($("#hidden-components-data").val());
                console.log(_componentsData);
            }, 100);
    };
    var _initialize = async function(){
        _getUserComponentsData();
        await chatProject.fh.time.sleep(500);
        _getChats();
        _timers.tmrCheckChatChanged = chatProject.fh.time.timer("_tmrCheckChatChanged", _checkChatChanged, _timeouts.checkChatChanged, false);
        _timers.tmrCheckChatCount = chatProject.fh.time.timer("_checkChatCount", _checkChatCount, _timeouts.checkChatCount, false);
        _timers.tmrCheckChatChanged.start();
        _timers.tmrCheckChatCount.start();
        _getAllUsers();
        _doBindings();
    };
    /* --- INIZIO FUNZIONI GRAFICHE --- */
    var _createUserListItem = function(chat_id, chat_name, chat_image) {
        return `<div class="userlist-container-chatbox" id="chat-container-userlist-container-chatbox-${chat_id}">
                    <img src="${chat_image}" alt="${chat_name}" class="chat-container-userlist-chatbox-image">
                    <span>${chat_name}</span>
                </div>`;
    }
    var _createMessageItem = function(message, viewers) {
        if(message.sender == "SYSTEM") {
            return `<div class="chat-container-main-container-chat-message" id="chat-container-main-container-chat-message-${message.messageId}">
            <div class="profileInfo profileInfoVisible">
            <img src="https://ui-avatars.com/api/?name=SYSTEM" alt="SYSTEM" class="chat-container-userlist-chatbox-image">
            <span>SYSTEM</span>
            </div>
            <span>${message.content}</span>
            </div>`;
        } 
        let isProfileInfoVisible = "profileInfoVisible"
        if(_lastChatMessageSender != null && _lastChatMessageSender == message.sender)
            isProfileInfoVisible = "";
        _lastChatMessageSender = message.sender;
        switch(message.type) {
            case 1: //text message
                return `<div class="chat-container-main-container-chat-message" id="chat-container-main-container-chat-message-${message.messageId}">
                <div class="profileInfo ${isProfileInfoVisible}">
                 <img src="${message.senderImage}" alt="SYSTEM" class="chat-container-userlist-chatbox-image">
                    <span>${message.sender}</span>
                </div>
                <span>${message.content}</span>
                </div>`;
            case 2: //Image
            return "" //TODO
            case 3: //File
            return "" //TODO
        }
    }
    var _setActiveChat = function(chatId) {
        $(_selectors.chatContainer.user_list.allChatbox).each(function (index) {
            $(this).attr("class", "userlist-container-chatbox");
        })
        _selectors.chatContainer.user_list.singleChatById(chatId).attr("class", "userlist-container-chatbox userlist-container-chatbox-active");
    }
    var _moveChatOnTop = function(chatId) {
        if(!_selectors.chatContainer.user_list.singleChatById(chatId).is(":first-child")){
            _selectors.chatContainer.user_list.singleChatById(chatId).slideUp(300, function() {
                _selectors.chatContainer.user_list.singleChatById(chatId).insertBefore(_selectors.chatContainer.user_list.singleChatById(chatId).siblings(':eq(0)'));
            }).slideDown(500);
        }
    }
    var _moveDialogSearchResultOnTop = function(item) {
        if(!$(item).is(":first-child")){
            $(item).insertBefore($(this).siblings(':eq(0)'));
        }
    }
    var _scrollChatboxToBottom = function () {
        $(_selectors.chatContainer.main_container.chat_container.window)
        .scrollTop($(_selectors.chatContainer.main_container.chat_container.window)[0].scrollHeight);
    }
    var _createSidebarChatParticipantElement = function(user_id, user_name, user_image) {
            return `<div class="chat-container-sidebar-userlist-container-user" id="chat-container-sidebar-userlist-container-user-${user_id}">
                        <img src="${user_image}" alt="${user_name}" class="chat-container-userlist-chatbox-image">
                        <span>${user_name}</span>
                    </div>`;
    }
    /* --- FINE FUNZIONI GRAFICHE --- */

    /* --- INIZIO FUNZIONI LOGICHE --- */

    var _addChatToUserList = function(chat_id, chat_name, message_id, partecipants, isPersonalChat) {
        let chat_image = `https://ui-avatars.com/api/?name=${chat_name}`
        if(!isPersonalChat) {
            $(_selectors.chatContainer.user_list.window).append(_createUserListItem(chat_id, chat_name, chat_image));
        } else {
            $(_selectors.chatContainer.user_list.window).append(_createUserListItem(chat_id, isPersonalChat.user_name, isPersonalChat.user_image));
        }
        _selectors.chatContainer.user_list.singleChatById(chat_id).bind("click", function() {
            _getMessages(chat_id, isPersonalChat);
        });
        _arrCurrentChats.push({chatId: chat_id, messageId: message_id, partecipants: partecipants});

    }
    var _lastChatMessageSender = null;
    var _findInChatList = function() {
        let keyword = $(_selectors.chatContainer.searchbar.txtSearchBar).val(); 
        $(_selectors.chatContainer.user_list.allChatbox).each(function(index) {
            if(!$(this).children("span").text().toString().toUpperCase().includes(keyword.toString().toUpperCase())){
                $(this).css("display","none");
            } else {
                $(this).css("display","flex");
            }
        });
    }
    var _findInChat = function() {
        let keyword = $(_selectors.chatContainer.topbar.action_container.search_bar).val(); 
        $(_selectors.chatContainer.main_container.chat_container.allMessage).each(function(index) {
            if(!$(this).children("span").text().toString().toUpperCase().includes(keyword.toString().toUpperCase())){
                $(this).css("display","none");
            } else {
                $(this).css("display","flex");
            }
        });
    }
    var _findInDialog = function() {
        let keyword = $(_selectors.dialog.txtSearch).val(); 
        $(_selectors.dialog.searchResultItem.allSearchResult).each(function(index) {
            if($(this).children("input").is(":checked")){
                $(this).css("display", "flex");
            }
            else if(!$(this).children("div").children("span").text().toString().toUpperCase().includes(keyword.toString().toUpperCase())){
                $(this).css("display","none");
            } else {
                $(this).css("display","flex");
            }
        });
    }
    var _addMessage = function(message) {
        let _viewers = JSON.parse(message.viewed_from);
        let _chatParticipants = _arrCurrentChats.filter(x => x.chatId == _activeChatId)[0].partecipants;
        let _actualViewers = "";
        _chatParticipants.forEach(participant => {
            if(_viewers != null){
                if(_viewers.includes(participant.user_id)) {
                    if(_actualViewers != "")
                        _actualViewers+=", ";
                    _actualViewers+=participant.user_name;
                }
                if(!_viewers.includes(_fromPhpPage.personalUserId)){
                    _viewers.push(_fromPhpPage.personalUserId);
                    //chatProject.ajaxCall.setVisualizzation(message.messageId);
                }
            }
        });
            if($(_selectors.chatContainer.main_container.chat_container.singleMessageById(message.messageId)).length)
                return;
            $(_selectors.chatContainer.main_container.chat_container.window).append(_createMessageItem(message, _actualViewers));
    }
    var _startVideoCall = function() {
        window.open(`/conference/show/${_activeChatId}`, "Videochiamata", "toolbar=0,location=0,menubar=0");
    }
    var _checkIsMessageBoxScrolled = function() {
        const item = document.getElementById("main-container-content-chat-container");
        const {scrollHeight, scrollTop, clientHeight} = item;
        if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
            return true;
        }
        return false;
    }
    var _getDialogSearchResultCheckedUsers = function() {
        let userColl = [];
        $(_selectors.dialog.searchResultItem.allCheckboxes).each(function(index) {
            if(this.checked){
            userColl.push(this.value);
            }
            })
            return userColl;
    }

    var _createSearchResultUser = function(user) {
        return`<div class="dialog-box-search-result-element" id="chat-container-search-result-element-${user.id}">
                    <div class="dialog-box-search-result-element-personal-information">
                        <img src="${user.profileImage}" alt="${user.name}" class="chat-container-userlist-chatbox-image" id="chat-container-userlist-chatbox-image-${user.id}">
                        <span>${user.name}</span>
                    </div>
                    <input type="checkbox" name="dialog-box-search-result-element-checkbox" class="dialog-box-search-result-element-checkbox" id="dialog-box-search-result-element-checkbox-${user.id}" value="${user.id}">
                </div>`;
    }

    /* --- FINE FUNZIONI LOGICHE

    /* --- INIZIO CHAMATE AJAX --- */
    var _createGroupChat = function(userIds, chatName) {
        let data = {
            "_token" : $(_selectors.csrf_token).attr("content"),
            "userIds": userIds,
            "chatName": chatName
        };
        let _successCallback = function(response){
            let currChatCount = _arrCurrentChats.length;
            _arrCurrentChats = [];
            $(_selectors.chatContainer.user_list.window).html("");
            $(_selectors.chatContainer.main_container.chat_container.window).html("");
            _getChats(currChatCount > 0 ? true : false);
            $(_selectors.dialog.background).css("display", "none");
        }
        chatProject.ajaxCall.createGroupChat(data, _successCallback);
    }
    var _getOrCreatePersonalChat = function(userId) {

        let data = {
            "_token" : $(_selectors.csrf_token).attr("content"),
            "userId": userId
        };
        let successCallback = function(response) {
            let chatIndex = _arrCurrentChats.findIndex(currChat => currChat.chatId == response);
            if(chatIndex != -1){
                chatProject.ajaxCall.getUserInformation(userId, function(user){
                    _getMessages(
                        response, 
                        {
                            user_image: user.profile_pic,
                            user_name: user.username
                        });
                });
            }
            else {
                let currChatCount = _arrCurrentChats.length;
                _arrCurrentChats = [];
                $(_selectors.chatContainer.user_list.window).html("");
                $(_selectors.chatContainer.main_container.chat_container.window).html("");
                _getChats(currChatCount > 0 ? true : false);
            }
            $(_selectors.dialog.background).css("display", "none");
        };
        chatProject.ajaxCall.addChat(data,successCallback);
    }
    var _sendMessage = function() {
        let _message = $(_selectors.chatContainer.main_container.bottom_bar.txtMessage).val();
        if(!chatProject.fh.string.isStringEmpty(_message)) {
            $(_selectors.chatContainer.main_container.bottom_bar.txtMessage).val("");
            let data = {
                "_token": $(_selectors.csrf_token).attr("content"),
                "chatId": _activeChatId,
                "message": _message
            };
            var _successCallback = function(messageComponentData) {
                let _chatIndex = _arrCurrentChats.findIndex(currChat => currChat.chatId == messageComponentData.chatId);
                _arrCurrentChats[_chatIndex].messageId = messageComponentData.message.messageId;
                _moveChatOnTop(_activeChatId);
                let isChatboxScrolled = _checkIsMessageBoxScrolled();
                _addMessage(messageComponentData.message);
                if(isChatboxScrolled){
                    _scrollChatboxToBottom();
                }
            }
            var _errorCallback = function(error) {
                console.error(error);
                console.error(error.toString());
            }
            chatProject.ajaxCall.sendMessage(data, _successCallback, _errorCallback);
        }
    };
    var _getMessages = function(chatId, isPersonalChat = false) {
        _lastChatMessageSender = null;
        _activeChatId = chatId;
        _setActiveChat(chatId);
        //Preparing ajax call
        var _successCallback = function(data) {
            $(_selectors.chatContainer.main_container.chat_container.window).html("");
            $(_selectors.chatContainer.sidebar.user_container).html("");
            data.messages.forEach(message => _addMessage(message));
            if(!isPersonalChat){
                $(_selectors.chatContainer.topbar.profile_container.chat_image).attr("src", data.chatImage);
                $(_selectors.chatContainer.topbar.profile_container.chat_name).html(data.chatName);
                $(_selectors.chatContainer.sidebar.profile_image).attr("src",data.chatImage);
                $(_selectors.chatContainer.sidebar.profile_name).html(data.chatName);
                data.participants.forEach(user => {
                    $(_selectors.chatContainer.sidebar.user_container).append(_createSidebarChatParticipantElement(user.id, user.name, user.image));
                });
                $(_selectors.chatContainer.sidebar.user_container).css("display", "flex");

            } else {
                $(_selectors.chatContainer.topbar.profile_container.chat_image).attr("src", isPersonalChat.user_image);
                $(_selectors.chatContainer.topbar.profile_container.chat_name).html(isPersonalChat.user_name);
                $(_selectors.chatContainer.sidebar.profile_image).attr("src", isPersonalChat.user_image);
                $(_selectors.chatContainer.sidebar.profile_name).html(isPersonalChat.user_name);
                $(_selectors.chatContainer.sidebar.user_container).css("display", "none");
            
            }
            //_scrollChatboxToBottom();
        } 
        chatProject.ajaxCall.getMessages(chatId, _successCallback);
 
    }
    var _getChats = function (openFirstChat = true) {
        var _successCallback = function(data) {
            let isFirst = true;
            $(_selectors.chatContainer.user_list.window).html("");
            data.forEach(singleChat => {
                let isPersonalChat = false;
                if(!singleChat.groupChat) {
                    let participantTarget = singleChat.partecipants.find(partecipant => partecipant.user_id != _componentsData.user.userId)
                    isPersonalChat = {
                        user_image: participantTarget.user_image,
                        user_name: participantTarget.user_name
                    }
                }

                if(isFirst && openFirstChat) {
                    _getMessages(singleChat.id, isPersonalChat);
                    isFirst = false;
                } else if(!openFirstChat && _activeChatId != 0 && _activeChatId == singleChat.id){
                    _getMessages(_activeChatId, isPersonalChat);
                } 
                _addChatToUserList(
                    singleChat.id, 
                    singleChat.description,
                    singleChat.LastMessage.messageId, 
                    singleChat.partecipants,
                    isPersonalChat);
            });
        };
        chatProject.ajaxCall.getChats(_successCallback);
    } 
    var _checkChatCount = function() {
        var _successCallback = function(data) {
            if(data[0].ChatCount > _arrCurrentChats.length){
                $(_selectors.chatContainer.user_list.window).html("");
                _getChats();
            }
        };
        var _errorCallback = function() {
        };
        chatProject.ajaxCall.checkChatCount(_successCallback, _errorCallback);
    };
    var _checkChatChanged = function () {
        _arrCurrentChats.forEach(singleChat => {
            let _data = {
                '_token': $(_selectors.csrf_token).attr("content"),
                'chatId': singleChat.chatId,
                'messageId': singleChat.messageId
            };
            let _successCallback = function(data) {
                if(data.chatChanged) {
                    _updateChat(singleChat.chatId, singleChat.messageId);
                }
            };
            let _errorCallback = function() {
            };
            chatProject.ajaxCall.checkChatChanged(_data, _successCallback, _errorCallback);
        });
    };
    var _updateChat = function(chatId, messageId) {
        let _data = {
            '_token': $(_selectors.csrf_token).attr('content'),
            'chatId': chatId,
            'messageId': messageId
        };
        let _successCallback = function(data) {
            let isChatboxScrolled = _checkIsMessageBoxScrolled();
            if(_activeChatId == chatId) {
                data.messages.forEach( singleMessage => 
                    _addMessage(singleMessage)
                );
            }
            let _chatIndex = _arrCurrentChats.findIndex(currChat => currChat.chatId == chatId);
            _arrCurrentChats[_chatIndex].messageId = data.messages[data.messages.length-1].messageId;
            _moveChatOnTop(chatId);
            if(isChatboxScrolled){
                _scrollChatboxToBottom();
            }
        };
        chatProject.ajaxCall.updateChat(_data, _successCallback);
    };
    var _getAllUsers = function() {
        var _successCallback = function(userList) {
            $(_selectors.dialog.searchResultContainer).html("");
            if(Array.isArray(userList)) {
                userList.forEach(user => {
                    $(_selectors.dialog.searchResultContainer).append(_createSearchResultUser(user));
                });
            }
            $(_selectors.dialog.searchResultItem.allSearchResult).each(function(){
                $(this).on("click", _onDialogSearchResult_CheckBox_Click);
            });
        }
        var _errorCallback = function(error) {
            console.error(error);
        }
        chatProject.ajaxCall.getAllUsers(_successCallback, _errorCallback);
    }
    /* --- INIZIO BINDINGS --- */
    var _onActionDetails_Click = function() {
        if(_isSidebarVisible){
            $(_selectors.chatContainer.sidebar.window).css("display", "none");
            _isSidebarVisible = false;
            return;
        }
        $(_selectors.chatContainer.sidebar.window).css("display", "flex");
        _isSidebarVisible = true;
    }
    var _onSearchBarBtnAdd_Click = function() {
        $(_selectors.dialog.txtChatName).val("");
        $(_selectors.dialog.txtSearch).val("");
        _findInDialog();
        $(_selectors.dialog.searchResultItem.allCheckboxes).each(function() {this.checked = false;})
        $(_selectors.dialog.txtChatName).css("display", "none");
        $(_selectors.dialog.background).css("display", "block");
    }
    var _closeChatDialog = function(event) {
        if($(event.target)[0].id == $(_selectors.dialog.background)[0].id)
        $(_selectors.dialog.background).css("display", "none");
        
    }
    var _onDialogSearchResult_CheckBox_Click = function() {
        this.children[1].checked = !this.children[1].checked;
        _moveDialogSearchResultOnTop(this)
    }
    var _onDialogSearchResult_btnCreateChat_Click = function() {
        let userId = _getDialogSearchResultCheckedUsers();
        if (!Array.isArray(userId))
            return;
        if(userId.length == 0)
            return;
        if(userId.length == 1)
            return _getOrCreatePersonalChat(userId[0]);
        let chatName = $(_selectors.dialog.txtChatName).val().toString().trim();
        if(chatName != "")
            return _createGroupChat(userId, $(_selectors.dialog.txtChatName).val()) 
        $(_selectors.dialog.txtChatName).css("display", "flex");
    }
    var _doBindings = function() {
        $(_selectors.chatContainer.topbar.action_container.action_details).on("click", _onActionDetails_Click);
        $(_selectors.chatContainer.topbar.action_container.action_call).on("click", _startVideoCall);
        $(_selectors.chatContainer.topbar.action_container.search_bar).on("input", _findInChat);
        $(_selectors.chatContainer.main_container.bottom_bar.btnSend).on("click", _sendMessage);
        $(_selectors.chatContainer.main_container.bottom_bar.txtMessage).keypress(function(e) {
            if(e.which == 10 || e.which == 13) {
                _sendMessage();
            }
        });
        $(_selectors.chatContainer.searchbar.btnAdd).on("click", _onSearchBarBtnAdd_Click);
        $(_selectors.dialog.background).on("click", _closeChatDialog);
        $(_selectors.dialog.searchResultItem.allSearchResult).each(function(){
            $(this).on("click", _onDialogSearchResult_CheckBox_Click);
        });
        $(_selectors.dialog.btnCreateChat).on("click", _onDialogSearchResult_btnCreateChat_Click);
        $(_selectors.dialog.txtSearch).on("input", _findInDialog);
        $(_selectors.chatContainer.searchbar.txtSearchBar).on("input", _findInChatList);
    }
    /* --- FINE BINDINGS --- */
    me.initialize = _initialize;
    return me;
})(chatProject.chatPage || {});
$(document).ready(chatProject.chatPage.initialize);