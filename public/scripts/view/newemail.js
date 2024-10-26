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
            mailbox_container: {
                window: "#email-container-mailbox-container",
                btnCreate: "#mailbox-container-btn-create",
                folderList: {
                    window: "#mailbox-link-container",
                    singleFolder: {
                        getFolderById: function(id){return `#email-container-mailbox-folder-${id}`},
                    }
                }
            }
        }
    };    
    var _texts = {}
    var _fromPhpPage = {}
    var _timers = {

    };
    var _folders = [];
    var _folderStructure = [];
    var _currentFolderIndex;
    var _currentFolderMails = {
        IntervalStart: 0,
        IntervalEnds: 25,
        IntervalLenght: 25,
        getCurrentPage: function() {
            return Math.floor(this.intervalStart/this.IntervalLenght); 
        },
        getPageCount: function() {
            return Math.floor(this.FolderMailsId.length / this.IntervalEnds)
            + (this.FolderMailsId.length / this.IntervalEnds) %2 == 0 ?
            0 : 1; 
        },
        FolderIndex: 0,
        FolderMailsId: [],
        FolderMails: []
    };
    var _isSidebarVisible = false;
    var _inboxFolder_ShortPath = "";
    var  _getUserComponentsData = function(){
        setTimeout(
            function() {
                _componentsData = JSON.parse($("#hidden-components-data").val());
                console.log(_componentsData);
            }, 100);
    };

    var _buildPaths = function (paths, separator) {
        let result = [];
        let level = {result};

        paths.forEach(path => {
            if(path.attributes != 64){
            path.shortpath.split(separator).reduce((r, name, i, a) => {
                if(!r[name]) {
                    r[name] = {result: []};
                    r.result.push({name, children: r[name].result, fullpath: path.fullpath, attributes: path.attributes})
                }
                return r[name];
            }, level)
        }
}); return result;
    }
    var _getFolders = async function(){
        var _successCallback = function(folders) {
            console.log(folders);
            _inboxFolder_ShortPath = folders[0].shortpath;
            _folders = folders;
            _folderStructure = _buildPaths(_folders, _folders[0].delimiter);
            let _treeViewElement = _drawTreeViewFolders(_folderStructure);
            console.log(_treeViewElement, _treeViewElement.innerHTML);
            $(_selectors.email_container.mailbox_container.folderList.window).html("");
            $(_selectors.email_container.mailbox_container.folderList.window).append(_treeViewElement);
            
            /*folders.forEach(function(folder, index) {
                if(folder.attributes != 64){
                    $(_selectors.email_container.mailbox_container.folderList.window).append(
                    _createFolderElement(folder.shortpath,index)
                    );
                }
            })*/
        }
        var _errorCallback = function(error) {
            console.error(error);
        }
        chatProject.ajaxCall.getFolders(_successCallback,_errorCallback);
    }
    var _initialize = async function(){
        _getUserComponentsData();
        await chatProject.fh.time.sleep(500);
        if(_componentsData.user.isMailConfigurationValid.status){
            _getFolders();
        }
        _doBindings();
    };
    /* --- INIZIO FUNZIONI GRAFICHE --- */
    
    var _drawTreeViewFolders = function(refStructure) {
        let fullStructure = document.createElement("div");
        refStructure.forEach(
            element => {
                let UL_ELEMENT = document.createElement("ul");
                let LI_ELEMENT = document.createElement("li");
                let LINK_ELEMENT = document.createElement("a");
                LINK_ELEMENT.innerHTML = element.name;
                LI_ELEMENT.append(LINK_ELEMENT)
                if(element.children != null && element.children != undefined && Array.isArray(element.children) && element.children.length > 0)
                    LI_ELEMENT.append(_drawTreeViewFolders(element.children))
                UL_ELEMENT.append(LI_ELEMENT);
                fullStructure.append(UL_ELEMENT);
            }
        )
        return fullStructure;
    }
    var _createFolderElement = function(folderName, folderIndex){
        let icon = "";
        if(folderIndex == 0)
            icon = "inbox";
        
        return `
        <li id="email-container-mailbox-folder-${folderIndex}">
                    <a href="#">
                        <span class="material-symbols-outlined">
                            ${icon}
                            </span>
                        ${folderName}</a>
                </li>
        `;
    }
    /* --- FINE FUNZIONI GRAFICHE --- */

    /* --- INIZIO FUNZIONI LOGICHE --- */

    /* --- FINE FUNZIONI LOGICHE

    /* --- INIZIO CHAMATE AJAX --- */


    /* --- FINE CHAMATE AJAX --- */

    /* --- INIZIO BINDINGS --- */
    var _doBindings = function() {
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