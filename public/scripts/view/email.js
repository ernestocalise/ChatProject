import {ajaxCall} from "./../ajaxCalls.js";
import {global} from "./../globalFunctions.js"
var chatProject = chatProject || {};

//Setting up chatPage
chatProject.ajaxCall = ajaxCall().email;
chatProject.fh = global();
chatProject.emailPage = (function (me) {
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
                email: () => {return `${_selectors.sideBar.profile.window}>.wrap>span`}
            },
            searchBar: "#search>input",
            contactContainer: {
                window: "#contactContainer",
                contacts: () => { return `${_selectors.sideBar.contactContainer.window}>li`},
                contactStatus: () => { return `${_selectors.sideBar.contactContainer.window}>li>.wrap>.contact-status`}
            },
            emailContainer: {
                window: "#emailContainer",
                singleFolderById: (folderId) => {return `${_selectors.sideBar.emailContainer.window}>#folder-${folderId}`},
                singleEmailById: (emailId) => {return `${_selectors.sideBar.emailContainer.window}>#email-${emailId}`},
                emailDescriptorById: (emailId) => {return `#emailDescriptor-${emailId}`},
                singleChatName: (emailId) => {return `${_selectors.sideBar.emailContainer.emailDescriptorById(emailId)}>.name`},
                singleChatPreview: (emailId) => {return `${_selectors.sideBar.emailContainer.emailDescriptorById(emailId)}>.preview`}
            },
            showContactButton: {
                button: "#showContact",
                text: () => {return `${_selectors.sideBar.showContactButton.button}>span`}
            },
        },
        main: {

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
            },
            searchBar: $(_selectors.sideBar.searchBar),
            contactContainer: {
                window: $(_selectors.sideBar.contactContainer.window),
                contacts: $(_selectors.sideBar.contactContainer.contacts()),
                contactStatus: $(_selectors.sideBar.contactContainer.contactStatus())
            },
            emailContainer: {
                window: $(_selectors.sideBar.emailContainer.window)
            },
            showContactButton: {
                button: $(_selectors.sideBar.showContactButton.button),
                text: $(_selectors.sideBar.showContactButton.text())
            }
        },
        main: {
            txtMessage: $(_selectors.main.txtMessage),
            btnFileUpload: $(_selectors.main.btnFileUpload),
            btnSendMessage: $(_selectors.main.btnSendMessage),
            iptFileUploader: $(_selectors.main.iptFileUploader),
            messageTarget: $(_selectors.main.messageTarget),
            contactProfile: {
                image: $(_selectors.main.contactProfile.image),
                name: $(_selectors.main.contactProfile.name)
            }
        }
    };
    var _texts = {}
    var _fromPhpPage = {}
    var _folders = [];
    var _initialize = async function(){
        await chatProject.fh.time.sleep(500);
        _readPhpPageData();
        _getFolders();
    };
    //Logical function
    var _readPhpPageData = function() {
        _fromPhpPage = JSON.parse($("#fromPhpPage").val());
        console.log($("#fromPhpLocale").val());
        _texts = JSON.parse($("#fromPhpLocale").val());
        $("#fromPhpPage").remove();
        $("#fromPhpLocale").remove();
    }
    var _getFolders = function() {
        var successCallback = function(data) {
            console.warn(data);
            data.forEach((folder, index) => {
                if(folder.attributes!=64){
                    let INBOX_TAG = "INBOX"
                    let folderName = folder.name.replace(_fromPhpPage.hostname, "");
                    folderName = (folderName != INBOX_TAG && folderName.startsWith(INBOX_TAG)) 
                        ? folderName.replace(INBOX_TAG, "")
                        : folderName;
                    folderName = (folderName.startsWith(".")
                        ? folderName.substr(1)
                        : folderName);
                    _folders.push({name: folderName, index: index}); 
                }
            });
            _drawFolders();
            console.warn(_folders);
        }
        chatProject.ajaxCall.getFolders(successCallback)
    }
    var _getMailbox = function(folderNum) {
        var _successCallback = function(data){
            console.log(data);
        }
        chatProject.ajaxCall.getMailBox(folderNum, _successCallback);
    }
    //Graphical function
    var _addEmailToSidebar = function(emailObject, putOnTop = false) {
        _widgets.sideBar.chatContainer.window.append(_createSidebarEmailItem(emailObject));
        //_arrCurrentChats.push({chatId: chatId, messageId: messageId, partecipants: partecipants});
    }
    var _drawFolders = function() {
        _folders.forEach(folder => {
            _widgets.sideBar.emailContainer.window.append(_createSidebarFolderItem(folder));
            console.log(_selectors.sideBar.emailContainer.singleFolderById(folder.index));
            $(_selectors.sideBar.emailContainer.singleFolderById(folder.index)).bind("click", function() {
                console.warn("start")
                _getMailbox(folder.index);
            });
        });
    }
    //Generative function
    var _createSidebarFolderItem = function(folder) {
        return `<li class="contact" id="folder-${folder.index}">
                    <div class="wrap">
                        <div class="meta" id="folderDescriptor-${folder.index}">
                            <p class="name">${folder.name}</p>
                            </div>
                    </div>
                </li>`;
    }

    var _createSidebarEmailItem = function(emailObject) {
        let senderName = emailObject.from; //= substr(emailObject.from, 0, strpos(emailObject.from, "<"));

        return `<li class="contact" id="email-${emailObject.uid}">
                    <div class="wrap">
                        <img src="https://ui-avatars.com/api/?name=${senderName}" alt="" />
                        <div class="meta" id="emailDescriptor-${emailObject.uid}">
                            <p class="name">${emailObject.subject}</p>
                            <p class="preview">${emailObject.date}</p>
                            </div>
                    </div>
                </li>`;
    }
    //String manipulation

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
})(chatProject.emailPage || {});
$(document).ready(chatProject.emailPage.initialize);