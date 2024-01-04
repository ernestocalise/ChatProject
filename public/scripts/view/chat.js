import {ajaxCall} from "./../ajaxCalls.js";
import {global} from "./../globalFunctions.js"
var chatProject = chatProject || {};
chatProject.fromPhpPage = JSON.parse($("#fromPhpPage").val());
$("#fromPhpPage").remove();
chatProject.ajaxCall = ajaxCall().chat;
chatProject.fh = global();
chatProject.texts = {
    "show_contact" : "Show Contact",
    "show_chats" : "Show Chats",
    "You" : "You",
    "status-online" : "Online",
    "status-away" : "Away",
    "status-call" : "In a call",
    "status-busy" : "Busy",
    "status-invisible" : "Invisible",
    "status-offline" : "Offline",
}
chatProject.chatPage = (function (me) {
    var _activeChatId = 0;
    var _arrCurrentChats = [];
    var _timeouts = {
        checkChatChanged: 1000,
        checkChatCount: 5000
    };
    var _selectors = {
        csrf_token: 'meta[name=csrf-token]',
        sideBar: {
            profile: {
                window: "#profile",
                userName: () => {return `${_selectors.sideBar.profile.window}>.wrap>p`},
                userImage: () => {return `${_selectors.sideBar.profile.window}>.wrap>#profile-img`},
                status: {
                    statusButton: () => {return `${_selectors.sideBar.profile.window}>.wrap>i`},
                    statusBox: () => {return `${_selectors.sideBar.profile.window}>.wrap>#status-options`},
                    statusOptions: () => {return `${_selectors.sideBar.profile.window}>.wrap>#status-options>ul>li`}
                }
            },
            searchBar: "#search>input",
            contactContainer: {
                window: "#contactContainer",
                contacts: () => { return `${_selectors.sideBar.contactContainer.window}>li`},
                contactStatus: () => { return `${_selectors.sideBar.contactContainer.window}>li>.wrap>.contact-status`}
            },
            chatContainer: {
                window: "#chatContainer",
                singleChatById: (chatId) => {return `${_selectors.sideBar.chatContainer.window}>#chat-${chatId}`},
                chatDescriptorById: (chatId) => {return `#chatDescriptor-${chatId}`},
                singleChatName: (chatId) => {return `${_selectors.sideBar.chatContainer.chatDescriptorById(chatId)}>.name`},
                singleChatPreview: (chatId) => {return `${_selectors.sideBar.chatContainer.chatDescriptorById(chatId)}>.preview`}
            },
            addContactButton: {
                button: "#addcontact",
                text: () => {return `${_selectors.sideBar.addContactButton.button}>span`}
            },
        },
        chatBox: {
            txtMessage: "#txtMessage",
            btnFileUpload: "#btnFileUpload",
            btnSendMessage: "#btnSendMessage",
            iptFileUploader: "#iptFileUpload",
            messageTarget: "#messageTarget>ul",
            singleMessageById: (messageId) => {return `${_selectors.chatBox.messageTarget}>#message-${messageId}`},
            contactProfile: {
                image: ".contact-profile>img",
                name: ".contact-profile>p"
            }
        }
    };    
    var _widgets = {
        csrf_token: $(_selectors.csrf_token),
        sideBar: {
            profile: {
                window: $(_selectors.sideBar.profile.window),
                userName: $(_selectors.sideBar.profile.userName()),
                userImage: $(_selectors.sideBar.profile.userImage()),
                status: {
                    statusButton: $(_selectors.sideBar.profile.status.statusButton()),
                    statusBox: $(_selectors.sideBar.profile.status.statusBox()),
                    statusOptions: $(_selectors.sideBar.profile.status.statusOptions())
                }
            },
            searchBar: $(_selectors.sideBar.searchBar),
            contactContainer: {
                window: $(_selectors.sideBar.contactContainer.window),
                contacts: $(_selectors.sideBar.contactContainer.contacts()),
                contactStatus: $(_selectors.sideBar.contactContainer.contactStatus())
            },
            chatContainer: {
                window: $(_selectors.sideBar.chatContainer.window),
            },
            addContactButton: {
                button: $(_selectors.sideBar.addContactButton.button),
                text: $(_selectors.sideBar.addContactButton.text())
            }
        },
        chatBox: {
            txtMessage: $(_selectors.chatBox.txtMessage),
            btnFileUpload: $(_selectors.chatBox.btnFileUpload),
            btnSendMessage: $(_selectors.chatBox.btnSendMessage),
            iptFileUploader: $(_selectors.chatBox.iptFileUploader),
            messageTarget: $(_selectors.chatBox.messageTarget),
            contactProfile: {
                image: $(_selectors.chatBox.contactProfile.image),
                name: $(_selectors.chatBox.contactProfile.name)
            }
        }
    };
    var _initialize = function(){
        _getChats();
        _widgets.chatBox.txtMessage.keypress(function(e) {
            // Enter pressed?
            if(e.which == 10 || e.which == 13) {
                _sendMessage();
            }
        });
        $(_widgets.sideBar.contactContainer.window).css("display", "none");
        console.warn(chatProject.fromPhpPage);
        _setStatusImage(chatProject.fromPhpPage.initialUserStatus);
        setTimeout(_checkChatChanged, _timeouts.checkChatChanged);
        setTimeout(_checkChatCount, _timeouts.checkChatCount);
        //Bindings
        _widgets.sideBar.searchBar.on('input',function() {
            _findChat(_widgets.sideBar.searchBar.val());
        });
        _widgets.chatBox.iptFileUploader.on("change",function() {
            _iptFileUpload_change(data);
        });
        _widgets.sideBar.profile.status.statusButton.on("click", _btnStatus_click);
        _widgets.sideBar.profile.status.statusOptions.each(function(index) {
            $(this).on("click", function() {
                let currStatus = _getStatusIdByStatusClass($(this).attr("id"));
                if(currStatus != -1)
                    _setStatus(currStatus)
                else
                    _restoreStatus(); 
            });
        });
        _widgets.sideBar.contactContainer.contacts.each(function(index) {
            $(this).on("click", function() {
                _openOrCreateChat($(this).attr('id'));    
            });
        });
        _widgets.sideBar.addContactButton.button.on("click", _showContactButton_click);
        _widgets.chatBox.btnFileUpload.on("click", function() {
            _widgets.chatBox.iptFileUploader.click();
        });
        _widgets.chatBox.btnSendMessage.on("click", _sendMessage);
    };

    //Logical function
    var _getMessages = function(chatId) {
        _activeChatId = chatId;
        _setActiveChat(chatId);
        chatProject.fh.interface.showLoader();
        //Preparing ajax call
        var _successCallback = function(data) {
            _widgets.chatBox.messageTarget.html("");
            data.messages.forEach(message => _addMessage(message));
            _widgets.chatBox.contactProfile.image.attr("src", data.chatImage);
            _widgets.chatBox.contactProfile.name.html(data.chatName);
            _widgets.chatBox.messageTarget.animate(
                { 
                    scrollTop: _widgets.chatBox.messageTarget.prop("scrollHeight")
                }, 1000
            );
            chatProject.fh.interface.hideLoader();
        } 
        chatProject.ajaxCall.getMessages(chatId, _successCallback);
    };
    var _getChats = function(openFirstChat = true) {
        chatProject.fh.interface.showLoader();
        var _successCallback = function(data) {
            let isFirst = true;
            data.forEach(singleChat => {
                if(isFirst && openFirstChat) {
                    _getMessages(singleChat.id);
                    isFirst = false;
                } else if(!openFirstChat && _activeChatId != 0){
                    _getMessages(_activeChatId);
                } 
                _addChatToSidebar(
                    singleChat.id, 
                    singleChat.description,
                    singleChat.LastMessage.content, 
                    singleChat.LastMessage.sender, 
                    singleChat.LastMessage.sent_from_user, 
                    singleChat.LastMessage.messageId, 
                    singleChat.partecipants);
            });
            chatProject.fh.interface.hideLoader();
        };
        chatProject.ajaxCall.getChats(_successCallback);
    };
    var _uploadFile = function() {
        var formData = new formData();
        formData.append("file", _widgets.chatBox.iptFileUploader.files[0]);
        formData.append("_token", _widgets.csrf_token.attr("content"));
        formData.append("chatId", _activeChatId);
        chatProject.ajaxCall.uploadFile(formData);
    };
    var _checkChatChanged = function () {
        _arrCurrentChats.forEach(singleChat => {
            let _data = {
                '_token': _widgets.csrf_token.attr("content"),
                'chatId': singleChat.chatId,
                'messageId': singleChat.messageId
            };
            let _successCallback = function(data) {
                if(data.chatChanged) {
                    _updateChat(singleChat.chatId, singleChat.messageId);
                }
                setTimeout(_checkChatChanged, _timeouts.checkChatChanged);
            };
            let _errorCallback = function() {
                setTimeout(_checkChatChanged, _timeouts.checkChatChanged);
            };
            chatProject.ajaxCall.checkChatChanged(_data, _successCallback, _errorCallback);
        });
    };
    var _updateChat = function(chatId, messageId) {
        let _data = {
            '_token': _widgets.csrf_token.attr('content'),
            'chatId': chatId,
            'messageId': messageId
        };
        let _successCallback = function(data) {
            if(_activeChatId == chatId) {
                data.messages.forEach( singleMessage => 
                    _addMessage(singleMessage)
                );
            }
            let _chatIndex = _arrCurrentChats.findIndex(currChat => currChat.chatId == chatId);
            _arrCurrentChats[_chatIndex].messageId = data.messages[data.messages.length-1].messageId;
            $(_selectors.sideBar.chatContainer.singleChatName(chatId)).html(data.chatName);
            const userNameFirstLetters = data.messages[data.messages.length-1].sent_from_user 
            ? chatProject.texts["You"] 
            : data.messages[data.messages.length-1].sender.split(' ')
                .map(word => word.charAt(0))
                .join('');
            $(_selectors.sideBar.chatContainer.singleChatPreview(chatId)).html(`${userNameFirstLetters}: ${data.messages[data.messages.length-1].content}`);
            _moveChatOnTop($(_selectors.sideBar.chatContainer.chatDescriptorById(chatId)));
        };
        chatProject.ajaxCall.updateChat(_data, _successCallback);
    };
    var _sendMessage = function() {
        let _message = $("#txtMessage").val();
        if(!chatProject.fh.string.isStringEmpty(_message)) {
            _widgets.chatBox.txtMessage.val("");
            let data = {
                "_token": _widgets.csrf_token.attr("content"),
                "chatId": _activeChatId,
                "message": _message
            };
            chatProject.ajaxCall.sendMessage(data, function() {}, function() {});
        }
    };
    var _openOrCreateChat = function(userId) {
        chatProject.fh.interface.showLoader();
        let data = {
            "_token" : _widgets.csrf_token.attr("content"),
            "userId": userId
        };
        let successCallback = function(data) {
            let chatIndex = _arrCurrentChats.findIndex(currChat => currChat.chatId == data);
            if(chatIndex != -1)
                _getMessages(data);
            else {
                let currChatCount = _arrCurrentChats.length;
                _arrCurrentChats = [];
                _widgets.sideBar.chatContainer.window.html("");
                _getChats(currChatCount > 0 ? true : false);
                _showSidebarChatContainer();
            }
        };
        chatProject.ajaxCall.addChat(data,successCallback);
    };
    var _checkChatCount = function() {
        var _successCallback = function(data) {
            if(data[0].ChatCount > _arrCurrentChats.length){
                _widgets.sideBar.chatContainer.window.html("")
                _getChats();
                setTimeout(_checkChatCount, _timeouts.checkChatCount);
            } else
                setTimeout(_checkChatCount, _timeouts.checkChatCount);
        };
        var _errorCallback = function() {
            setTimeout(_checkChatCount, _timeouts.checkChatCount);
        };
        chatProject.ajaxCall.checkChatCount(_successCallback, _errorCallback);
    };
    var _setStatus = function(statusCode) {
        chatProject.ajaxCall.setStatus(statusCode);
        _setStatusImage(statusCode);
        _hideSidebarStatusBox();
    }
    var _restoreStatus = function() {
        chatProject.ajaxCall.restoreStatus();
        _hideSidebarStatusBox();
    }

    //Graphical function
    var _addChatToSidebar = function(chatId, chatName, lastMessage, lastMessageSender, sentFromUser, messageId, partecipants) {
        const _firstLetters = sentFromUser ? chatProject.texts["You"] : lastMessageSender.split(' ')
        .map(word => word.charAt(0))
        .join('');
        _widgets.sideBar.chatContainer.window.append(_createSidebarChatItem(chatId, chatName, _firstLetters, lastMessage));
        $(_selectors.sideBar.chatContainer.singleChatById(chatId)).bind("click", function() {
            _getMessages(chatId);
        });
        _arrCurrentChats.push({chatId: chatId, messageId: messageId, partecipants: partecipants});
    }
    var _addMessage = function(message) {
        let _viewers = JSON.parse(message.viewed_from);
        let _chatParticipants = _arrCurrentChats.filter(x => x.chatId == _activeChatId)[0].partecipants;
        let _actualViewers = "";
        _chatParticipants.forEach(participant => {
            if(_viewers.includes(participant.user_id)) {
                if(_actualViewers != "")
                    _actualViewers+=", ";
                _actualViewers+=participant.user_name;
            }
            if(!_viewers.includes(chatProject.fromPhpPage.personalUserId)){
                _viewers.push(chatProject.fromPhpPage.personalUserId);
                chatProject.ajaxCall.setVisualizzation(message.messageId);
            }
            if($(_selectors.chatBox.singleMessageById(message.messageId)).length)
                return;
            _widgets.chatBox.messageTarget.append(_createMessageItem(message, _actualViewers));
        });
    }
    var _setActiveChat = function(chatId) {
        _widgets.sideBar.chatContainer.window.children().each(function() {
            $(this).attr("class", "contact");
        });
        $(_selectors.sideBar.chatContainer.singleChatById(chatId)).attr("class", "contact active");
    }
    var _moveChatOnTop = function(element) {
        let liElement = element.parent().parent();
        if(!liElement.is(":first-child")){
            liElement.slideUp(300, function() {
                liElement.insertBefore(liElement.siblings(':eq(0)'));
            }).slideDown(500);
        }
    }
    var _showSidebarChatContainer = function() {
        _widgets.sideBar.chatContainer.window.css("display", "initial");
        _widgets.sideBar.contactContainer.window.css("display", "none");
        _widgets.sideBar.addContactButton.text.html(chatProject.texts["show_contact"]);
    }
    var _showSidebarContactContainer = function() {
        _widgets.sideBar.chatContainer.window.css("display", "none");
        _widgets.sideBar.contactContainer.window.css("display", "initial");
        _widgets.sideBar.addContactButton.text.html(chatProject.texts["show_chats"]);
        _reloadAllContactsStatuses();
    }
    var _hideSidebarStatusBox = function() {
        _widgets.sideBar.profile.status.statusBox.css("opacity", "0");
        _widgets.sideBar.profile.status.statusBox.css("visibility", "hidden");
    }
    var _showSidebarStatusBox = function() {
        _widgets.sideBar.profile.status.statusBox.css("opacity", "100");
        _widgets.sideBar.profile.status.statusBox.css("visibility", "initial");
    }
    var _reloadAllContactsStatuses = function() {
        $(_widgets.sideBar.contactContainer.contactStatus).each(function() {
            let contactId = $(this).parent().parent().attr("id");
            let jqObj = $(this);
            let _successCallback = function(data) {
                let statusClass = _getStatusClass(data);
                jqObj.attr("class", `contact-status ${statusClass}`);
            }
            chatProject.ajaxCall.getStatus(contactId, _successCallback);
        });
    }
    var _setStatusImage = function(statusCode) {
        $(_widgets.sideBar.profile.userImage).attr('class', _getStatusClass(statusCode));
    }
    var _findChat = function(testo) {
        let srcObj = _widgets.sideBar.chatContainer.window.css("display") == "none"
        ? _selectors.sideBar.contactContainer.window
        : _selectors.sideBar.chatContainer.window;
        $(`${srcObj}>li>.wrap>.meta>p.name`).each(function(data) {
            if($(this).text().includes(testo)){
                $(this).parent().parent().parent().css("display", "block");
            } else {
                $(this).parent().parent().parent().css("display", "none");                
            }
        }); 
    }
    //Generative function
    var _createSidebarChatItem = function(chatId, chatName, senderShortName, lastMessage) {
        return `<li class="contact" id="chat-${chatId}" onclick="">
                    <div class="wrap">
                        <img src="https://ui-avatars.com/api/?name=${chatName}" alt="" />
                        <div class="meta" id="chatDescriptor-${chatId}">
                            <p class="name">${chatName}</p>
                            <p class="preview"><span>${senderShortName}: </span>${lastMessage}</p>
                        </div>
                    </div>
                </li>`;
    }
    var _createMessageItem = function (message, viewers) {
        if(message.sender == "SYSTEM") {
            return `<li class="system" id="message-${message.messageId}">
		        <p>${message.content}</p>
		    </li>`;
        }
        switch(message.type){
            case 1: //text message
                return `<li class="${message.sent_from_user ? "sent" : "replies"}" id="message-${message.messageId}">
                            <img src="${message.senderImage}" alt="" class="message-profile"/>
                            <div class="tooltip">
                                <p>${message.content}</p>
                                <span class="tooltiptext tooltip-bottom">Visualizzato da: ${viewers}</span>
                            </div>
                        </li>`;
            case 2: //image message
                let ImageData = JSON.parse(message.content);
                return `<li class="${message.sent_from_user ? "sent" : "replies"}" id="message-${message.messageId}">
                            <img src="${message.senderImage}" alt="" class="message-profile"/>
                            <div class="tooltip">
                                <p><img src="${ImageData.FilePath}" /></p>
                                <span class="tooltiptext tooltip-bottom">Visualizzato da: ${viewers}</span>
                            </div>
                        </li>`;
            case 3: //file message
                let FileData = JSON.parse(message.content);
                return `<li class="${message.sent_from_user ? "sent" : "replies"}" id="message-${message.messageId}">
                            <img src="${message.senderImage}" alt="" class="message-profile"/>
                            <div class="tooltip">
                                <p class="messageUploadText">
                                    <a target="_blank" href="${FileData.FilePath}">
                                        <img src="images/upload.png" class="messageUploadImage" />
                                        ${FileData.FileName}
                                    </a>
                                </p>
                                <span class="tooltiptext tooltip-bottom">Visualizzato da: ${viewers}</span>
                            </div>
                        </li>`;
        }
    }
    //String manipulation
    var _getStatusText = function(statusCode) {
        statusCode = Number(statusCode);
        switch(statusCode) {
            case 0:
                return chatProject.texts["status-online"];
            case 1:
                return chatProject.texts["status-away"];
            case 2:
                return chatProject.texts["status-call"];
            case 3:
                return chatProject.texts["status-busy"];
            case 4:
                return chatProject.texts["status-invisible"];
            case -1:
                return chatProject.texts["status-offline"];
            default:
                return chatProject.texts["status-offline"];
        }
    }
    var _getStatusClass = function(statusCode) {
        statusCode = Number(statusCode);
        switch(statusCode) {
            case 0:
                return "online";
            case 1:
                return "away";
            case 2:
                return "call";
            case 3:
                return "busy";
            case 4:
                return "invisible";
            case -1:
                return "offline";
            default:
                return "offline";
        }
    }
    var _getStatusIdByStatusClass = function(statusClass) {
        switch (statusClass) {
            case "status-online" :
                return 0;
            case "status-away" :
                return 1;
            case "status-busy" :
                return 3;
            case "status-invisible" :
                return 4;
            case "status-reset" :
                return -1;
        }
    }
    //Bindings
    var _showContactButton_click = function() {
        _widgets.sideBar.searchBar.val("");
        _findChat("");
        if(_widgets.sideBar.chatContainer.window.css('display') == 'none') 
            _showSidebarChatContainer();
        else 
            _showSidebarContactContainer();
    }
    var _btnStatus_click = function() {
        if(_widgets.sideBar.profile.status.statusBox.css("opacity") == "1")
            _hideSidebarStatusBox();
         else 
            _showSidebarStatusBox();
    }
    var _iptFileUpload_change = function(data) {
        let FileSize = this.files[0].size;
        var sizeInMB = (FileSize / (1024*1024)).toFixed(2);
        if(sizeInMB > 25) {
            alert("Max size allowed 25 MB");
            const form = document.querySelector('form');
            form.reset();
        } else {
            setTimeout(_uploadFile, 100);
        }
    }
    me.initialize = _initialize;
    return me;
})(chatProject.chatPage || {});
$(document).ready(chatProject.chatPage.initialize);