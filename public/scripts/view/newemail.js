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
    var _getFolderStructure = function (inputFolderArray){

        var _checkFolderExists = function(folderName, folderArray){
            let folder = folderArray.find(item => item.name == folderName);
            return typeof folder == "undefined"
        } 

        inputFolderArray.forEach(
            (Folder, index) => {
                if(Folder.attributes != 64){
                    if(Folder.shortpath.includes(Folder.delimiter)){
                        var _fs = Folder.shortpath.split(Folder.delimiter)
                        var _currentFolder = null;
                        _fs.forEach(singleFolder => {
                            if(_currentFolder == null)
                                _currentFolder = _folderStructure.find(fold => fold.name == singleFolder)
                            else {
                                if(_checkFolderExists(singleFolder, _currentFolder.childrens)){
                                    _currentFolder = _currentFolder.childrens.find(item => item.name == _currentFolder)
                                }
                                else {
                                    _currentFolder.childrens.push(
                                        {index: index, name: Folder.shortpath, fullpath: Folder.fullpath, childrens: []}
                                    )
                                    _currentFolder = _currentFolder.childrens[_currentFolder.childrens.length -1 ];
                                }
                            }
                        })
                    } else {
                        _folderStructure.push({index: index, name: Folder.shortpath, fullpath: Folder.fullpath, childrens: [] })
                    }
                }
            }
        )
    }
    var _getFolders = async function(){
        var _successCallback = function(folders) {
            console.log(folders);
            _inboxFolder_ShortPath = folders[0].shortpath;
            _folders = folders;
            _getFolderStructure(_folders);
            console.log(_folderStructure)
            $(_selectors.email_container.mailbox_container.folderList.window).html("");
            folders.forEach(function(folder, index) {
                if(folder.attributes != 64){
                    $(_selectors.email_container.mailbox_container.folderList.window).append(
                    _createFolderElement(folder.shortpath,index)
                    );
                }
            })
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