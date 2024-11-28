import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
var chatProject = chatProject || {};

//Setting up chatPage
chatProject.ajaxCall = ajaxCall().email;
chatProject.fh = global();
chatProject.emailPage = (function (me) {
    var _timeouts = {
    };
    var _componentsData = {
        user: {
            userID : null,
            userStatus: null,
            isMailConfigurationValid: true
        }
    }
    var _selectors = {
        csrf_token: 'meta[name=csrf-token]',
        email_container: {
            window: "#email-container",
            loader: {
                loader_container: "#email-container-loader-container",
                spinner: "#email-container-email-spinner",
                overlayDialogBox: "#email-container-overlay-dialog-box"
            },
            mailbox_container: {
                window: "#email-container-mailbox-container",
                btnCreate: "#mailbox-container-btn-create",
                folderList: {
                    window: "#mailbox-link-container",
                    singleFolder: {
                        getFolderById: function(id){return `#email-container-mailbox-folder-${id}`},
                    }
                },
                commandBar: {
                    mailList: {
                        window:"#email-container-main-container-commandBar-mailList",
                        btnRefresh: "#email-container-main-container-commandBar-mailList-btnRefresh",
                        btnBack: "#email-container-main-container-commandBar-btnBack",
                        btnForward: "#email-container-main-container-commandBar-btnForward"
                    },
                    openMail: {
                        window: "#email-container-main-container-commandBar-openMail",
                        btnBack: "#email-container-main-container-commandBar-openMail-btnBack"
                    },
                    mailCount: "#email-container-main-container-commandBar-mailCount"
                },
                mailList: {
                    container: {
                        window:"#email-container-main-container-mail-list-container"
                    },
                    window: "#email-container-main-container-mail-list"
                },
                emailContainer:{
                    window:"#email-container-main-container-email-container",
                    header:{
                        subject:"#mail-container-email-container-header-subject",
                        image:"#mail-container-email-container-header-image",
                        from:"#mail-container-email-container-header-from",
                        to:"#mail-container-email-container-header-to",
                        cc:"#mail-container-email-container-header-cc",
                        ccn:"#mail-container-email-container-header-ccn",
                        timestamp:"#mail-container-email-container-header-timestamp",
                    },
                    frame: "#email-container-main-container-email-container-iframe"
                }
            }
        }
    };    
    var _texts = {}
    var _fromPhpPage = {}
    var _timers = {

    };
    var _currentlyLoadedMails = [];
    var _folders = [];
    var _folderStructure = [];
    var _currentFolderMails = {
        IntervalStart: 0,
        IntervalEnds: 25,
        IntervalLenght: 25,
        FolderIndex: 0,
        FolderMailsId: [],
        FolderMails: [],
        FolderFullPath: ""
    };





    var _initializeCurrentFolder = function(mailIndexes, mails, folderFullPath, folderIndex) {
        _currentFolderMails = {
            IntervalStart: 0,
            IntervalLenght: mailIndexes.length >= 25 ? 25 : mailIndexes.length,
            IntervalEnds: mailIndexes.length >= 25 ? 25 : mailIndexes.length,
            FolderIndex: folderIndex,
            FolderMailsId: mailIndexes,
            FolderMails: mails,
            FolderFullPath: folderFullPath
        }
    }
    var _loadMails = function() {
        $(_selectors.email_container.mailbox_container.mailList.window).html("");
        for(let i = _currentFolderMails.IntervalStart; i < _currentFolderMails.IntervalEnds; i++){
            _drawMailRow(_currentFolderMails.FolderMails[i]);
        }
        _enableMailClick();
    }
    var _drawMailRow = function(singleMail) {
        let singleEmailRow = `
            <li class="main-container-mail-element" id="email-container-main-container-mail-element-${singleMail.mailIndex}">
            <input type="checkbox" class="main-container-mail-element-checkbox" />
                <span class="material-symbols-outlined mail-container-mail-element-btnFavorite">
                    star
                </span>
                <span class="main-container-mail-element-sender">${singleMail.fromName}</span>
                <span class="main-container-mail-element-content">
                    <b class="main-container-mail-element-content-subject">${singleMail.subject}</b>
                    ${singleMail.mailTextContent.substring(0,singleMail.mailTextContent.length > 150 ? 150 : singleMail.mailTextContent.length)}
                </span>
                <span class="main-container-mail-element-timestamp">
                    ${_formatDate(singleMail.date)}                        
                </span>
            </li>
            `;
            $(_selectors.email_container.mailbox_container.mailList.window).append(singleEmailRow);
    }
    var _enableMailClick = function() {
        $(".main-container-mail-element").each(function(index){
            this.onclick=function() {
                let currIndex = this.id.toString().replace("email-container-main-container-mail-element-","");
                _openEmailPanel(_currentFolderMails.FolderMails.find(mail => mail.mailIndex == Number(currIndex.toString())));
            }
        })
    }
    var _initialize = async function(){
        _getUserComponentsData();
        await chatProject.fh.time.sleep(500);
        if(_componentsData.user.isMailConfigurationValid.status){
            _initializeEmails();
        }
        _doBindings();
    };
    /* --- INIZIO FUNZIONI GRAFICHE --- */
    var _getTreeViewImage = function(elementName) {
        let iconName = "";
        switch(elementName) {
            case "INBOX": 
                iconName = "inbox"
            break;
            case "POSTA INVIATA":
            case "SENT":
                iconName = "outgoing_mail"
            break;
            case "SPAM":
            case "POSTA INDESIDERATA":
                iconName = "block"
            break;
            case "TRASH":
            case "CESTINO":
                iconName = "delete"
            break;
            default:
                iconName = "folder"
            break;
            }
        return `<span class="material-symbols-outlined">
                ${iconName}
                </span>`
    }
    var _onCommandBarBtnBack_Click = function() {
        $(_selectors.email_container.mailbox_container.mailList.container.window).css("display","block");
        $(_selectors.email_container.mailbox_container.commandBar.mailList.window).css("display","flex");
        $(_selectors.email_container.mailbox_container.emailContainer.window).css("display","none");
        $(_selectors.email_container.mailbox_container.commandBar.openMail.window).css("display","none");
    }
    var _drawTreeViewFolders = function(refStructure, level) {
        level = level+1;
        let UL_ELEMENT = document.createElement("ul");
        refStructure.forEach(
            element => {
                let LI_ELEMENT = document.createElement("li");
                let LINK_ELEMENT = document.createElement("a");
                LINK_ELEMENT.classList.add(`mailbox-link-container-link-element-level-${level}`);
                let SpanImage = _getTreeViewImage(element.name.toUpperCase());
                LINK_ELEMENT.innerHTML = SpanImage+element.name.toLowerCase();
                LI_ELEMENT.append(LINK_ELEMENT)
                if(element.children != null && element.children != undefined && Array.isArray(element.children) && element.children.length > 0){
                    LI_ELEMENT.append(_drawTreeViewFolders(element.children, level))
                }
                UL_ELEMENT.append(LI_ELEMENT);
            }
        )
        return UL_ELEMENT;
    }
    var _appendTreeViewFolders = function() {
        $(_selectors.email_container.mailbox_container.folderList.window).html("");
        $(_selectors.email_container.mailbox_container.folderList.window).append(_drawTreeViewFolders(_folderStructure, 0));
    }
    var _openEmailPanel = async function(mailObject){
        var _sanitizeString = function(str) {
            if(str == undefined || str == null) {
                return "";
            } return str;
        }
        document.getElementById("email-container-main-container-email-container-iframe").contentDocument.body.innerHTML = mailObject.mailContent;
        $(_selectors.email_container.mailbox_container.emailContainer.header.subject).html(mailObject.subject);
        
        $(_selectors.email_container.mailbox_container.emailContainer.header.from).html(`Da: ${_sanitizeString(mailObject.headers.fromaddress)}`);
        $(_selectors.email_container.mailbox_container.emailContainer.header.image).attr("src", `https://ui-avatars.com/api/?name=${_sanitizeString(mailObject.senderName)}`);
        $(_selectors.email_container.mailbox_container.emailContainer.header.to).html(`A: ${_sanitizeString(mailObject.headers.toaddress)}`);
        $(_selectors.email_container.mailbox_container.emailContainer.header.cc).html(`CC: ${_sanitizeString(mailObject.headers.ccaddress)}`);
        $(_selectors.email_container.mailbox_container.emailContainer.header.ccn).html(`CCN: ${_sanitizeString(mailObject.headers.bccaddress)}`);
        $(_selectors.email_container.mailbox_container.emailContainer.header.ccn).html(`Data: ${_formatDate(mailObject.date)}`);
        let attachmentsString = "";
        mailObject.attachmentsPath.forEach(attachment => {
            attachmentsString = attachmentsString.concat(`
                <a href="/storage/mails/attachments/${attachment}">${attachment}</a>
                `)
        })
        $(_selectors.email_container.mailbox_container.emailContainer.header.timestamp).append(attachmentsString);
        $(_selectors.email_container.mailbox_container.mailList.container.window).css("display","none");
        $(_selectors.email_container.mailbox_container.emailContainer.window).css("display","block");
        $(_selectors.email_container.mailbox_container.commandBar.mailList.window).css("display","none");
        $(_selectors.email_container.mailbox_container.commandBar.openMail.window).css("display","flex");

    }
    var _showLoader = function() {
        $(_selectors.email_container.loader.loader_container).css("display", "block");
        $(_selectors.email_container.loader.spinner).css("display", "block");
        $(_selectors.email_container.loader.overlayDialogBox).css("display", "none");
    }
    var _hideLoader = function() {
        $(_selectors.email_container.loader.loader_container).css("display", "none");
        $(_selectors.email_container.loader.spinner).css("display", "none");
        $(_selectors.email_container.loader.overlayDialogBox).css("display", "none");
    }
    var _showEmailNotConfiguredError = function() {
        $(_selectors.email_container.loader.loader_container).css("display", "block");
        $(_selectors.email_container.loader.spinner).css("display", "none");
        $(_selectors.email_container.loader.overlayDialogBox).css("display", "block");
    }
    var _updateMailListPageCount = function() {
        $(_selectors.email_container.mailbox_container.commandBar.mailCount).html(`${_currentFolderMails.IntervalStart+1}-${_currentFolderMails.IntervalEnds} di ${_currentFolderMails.FolderMailsId.length}`);
    }
    /* --- FINE FUNZIONI GRAFICHE --- */

    /* --- INIZIO FUNZIONI LOGICHE --- */
    var _formatDate = function(inputDate) {
        let tempDT = new Date(inputDate);
        return `${tempDT.getDate().toString().padStart(2, "0")}/${(tempDT.getMonth()+1).toString().padStart(2, "0")}/${tempDT.getFullYear()} ${tempDT.getHours().toString().padStart(2, "0")}:${tempDT.getMinutes().toString().padStart(2, "0")}:${tempDT.getSeconds().toString().padStart(2, "0")}`;
    }
    var  _getUserComponentsData = function(){
        setTimeout(
            function() {
                _componentsData = JSON.parse($("#hidden-components-data").val());
                console.log(_componentsData);
            }, 100);
    };
    var _createFolderStructure = function (paths, separator) {
        let result = [];
        let level = {result};
        let index = 0;
        paths.forEach(path => {
            if(path.attributes != 64){
            path.shortpath.split(separator).reduce((r, name, i, a) => {
                if(!r[name]) {
                    r[name] = {result: []};
                    r.result.push({name, children: r[name].result, fullpath: path.fullpath, attributes: path.attributes, folderIndex: index})
                }
                return r[name];
            }, level)
            }
            index+=1;
        }); 
        let firstElement = {name: result[0].name, fullpath: result[0].fullpath, attributes: result[0].attributes, children: []};
        result[0].children.unshift(firstElement);
        return result[0].children;
    }

    var _previousMailPage = function() {
        if(_currentFolderMails.IntervalStart-_currentFolderMails.IntervalLenght>=0){
            _currentFolderMails.IntervalStart-=_currentFolderMails.IntervalLenght;
            _currentFolderMails.IntervalEnds-=_currentFolderMails.IntervalLenght;
        }
        _loadMails();
        _updateMailListPageCount();
    }

    var _nextMailPage = function() {
        _currentFolderMails.IntervalStart = _currentFolderMails.IntervalEnds;
        _currentFolderMails.IntervalEnds = _currentFolderMails.IntervalEnds+ _currentFolderMails.IntervalLenght;
        if(_currentFolderMails.FolderMailsId.length < _currentFolderMails.IntervalEnds) {
            _currentFolderMails.IntervalEnds = _currentFolderMails.FolderMailsId.length;
        }
        if (_currentFolderMails.FolderMails.length > _currentFolderMails.IntervalEnds){
            _loadMails();
        } else {
            let currentDifference = _currentFolderMails.IntervalEnds - _currentFolderMails.FolderMails.length;
            let _mailsIdToLoad = [];
            for (let i = _currentFolderMails.IntervalStart + currentDifference; i<_currentFolderMails.IntervalEnds; i++){
                _mailsIdToLoad.push(_currentFolderMails.FolderMailsId[i]);
            }
            _retriveAndLoadMails(_mailsIdToLoad);
        }
        _updateMailListPageCount();
    }
    /* --- FINE FUNZIONI LOGICHE

    /* --- INIZIO CHAMATE AJAX --- */

    var _initializeEmails = async function() {
        var _successCallback = function(response) {
            if(response==-1){
                _showEmailNotConfiguredError();
                return;
            }
            _folders = response.folders;
            _folderStructure = _createFolderStructure(_folders, _folders[0].delimiter);
            _appendTreeViewFolders();
            _initializeCurrentFolder(response.mailIndexes, response.mails, response.folders[0].fullpath, response.folders[0]);
            _updateMailListPageCount();
            _loadMails();
            _hideLoader();
        }
        var _errorCallback = function(error) {
            console.error(error);
        }
        _showLoader();
        chatProject.ajaxCall.initializeEmail(_successCallback,_errorCallback);
    }
    
    var _retriveAndLoadMails = async function(mailsToRequire) {
        let _params = {
            "_token" : $(_selectors.csrf_token).attr("content"),
            mailIndexes: mailsToRequire,
            mailbox: _currentFolderMails.FolderFullPath
        }
        var _successCallback = function(response) {
            response.forEach(mail =>_currentFolderMails.FolderMails.push(mail));
            _loadMails();
            _hideLoader();
        }
        var _errorCallback = function(error) {
            console.error(error);
        }
        _showLoader();
        chatProject.ajaxCall.getMails(_params, _successCallback, _errorCallback);
    }
    /* --- FINE CHAMATE AJAX --- */

    /* --- INIZIO BINDINGS --- */
    var _doBindings = function() {
        $(_selectors.email_container.mailbox_container.commandBar.openMail.btnBack).on("click", _onCommandBarBtnBack_Click)
        $(_selectors.email_container.mailbox_container.commandBar.mailList.btnBack).on("click", _previousMailPage);
        $(_selectors.email_container.mailbox_container.commandBar.mailList.btnForward).on("click", _nextMailPage);
        /*
        $("#searchbar").keypress(function(e) {
            if(e.which == 10 || e.which == 13) {
                _sendMessage();
            }
        });
        */
    }
    /* --- FINE BINDINGS --- */
    me.initialize = _initialize;
    return me;
})(chatProject.emailPage || {});
$(document).ready(chatProject.emailPage.initialize);