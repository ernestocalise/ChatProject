export function ajaxCall() {
    var _defaultSuccessCallback = function (data) {
        return 0;
    };
    var _defaultErrorCallback = function (data) {
        console.error(data);
        return 0;
    };
    var _executeGETRequest = function (apiName, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        $.ajax({
            type: "GET",
            cache: false,
            url: apiName,
            success: function (result) {
                successCallback(result);
            },
            error: function (result) {
                errorCallback(result);
            }
        });
    };
    var _executePOSTRequest = function (apiName, params, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        $.ajax({
            type: "POST",
            cache: false,
            url: apiName,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(params),
            success: function (result) {
                successCallback(result);
            },
            error: function (result) {
                errorCallback(result);
            }
        });
    }
    var _executeAsyncPOSTRequest = async function (apiName, params) {
        return $.ajax({
                url: apiName,
                type: "POST",
                data: params,
            });
    }
    var _executeAsyncGETRequest = async function (apiName) {
        return $.ajax({
            url: apiName,
            type: "GET"
        });
    }
    //Chat Functions: 
    var _getAllUsers = function(successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest("/chats/getAllUsers", successCallback, errorCallback);
    }
    var _setVisualizzation = function (chatId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/chats/setVisualizzation/${chatId}`, successCallback, errorCallback);
    };
    var _getVisualizzation = function (chatId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/chats/getVisualizzation/${chatId}`, successCallback, errorCallback);
    };
    var _getMessages = function (chatId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/chats/getMessages/${chatId}`, successCallback, errorCallback);
    };
    var _getChats = function (successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest("/chats/getChats", successCallback, errorCallback);
    };
    var _uploadFile = function (formData, successCallback, errorCallback) {
        $.ajax({
            url: '/chats/addAttachment',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) { successCallback(result) },
            error: function (result) { errorCallback(result) }
        });
    };
    var _checkChatChanged = function (data, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executePOSTRequest("/chats/checkChatChanged", data, successCallback, errorCallback);
    };
    var _updateChat = function (params, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executePOSTRequest("/chats/getNewMessages", params, successCallback, errorCallback);
    };
    var _sendMessage = function (data, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executePOSTRequest("/chats/sendMessage", data, successCallback, errorCallback);
    };
    var _addChat = function (data, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executePOSTRequest("/chats/addChat", data, successCallback, errorCallback);
    };
    var _createGroupChat = function(data, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executePOSTRequest("/chats/createGroupChat", data, successCallback, errorCallback);
    }
    var _checkChatCount = function (successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        $._executeGETRequest("/chats/getChatCount", successCallback, errorCallback);
    };
    var _checkChatCount = function (successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest("/chats/getChatCount", successCallback, errorCallback);
    };
    var _setStatus = function (statusCode, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/user/setStatus/${statusCode}`, successCallback, errorCallback);
    };
    var _restoreStatus = function (successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/user/restoreStatus`, successCallback, errorCallback);
    };
    var _getStatus = function (userId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/user/getStatus/${userId}`, successCallback, errorCallback);
    };
    var _getFolders = function (successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/getFolders`, successCallback, errorCallback);
    }
    var _getMailbox = function (mailboxId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/getMailbox/${mailboxId}`, successCallback, errorCallback)
    }

    // VideoChatFunction
    var _getUserInformation = async function(userId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        return  _executeGETRequest(`/user/getUserInformation/${userId}`, successCallback, errorCallback )
    }
    var _checkIncomingSoundCall = async function( successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        return _executeGETRequest("/conference/checkIncomingSoundCall",successCallback, errorCallback);
    }
    var _setIncomingSoundCallAnswerStatus = async function (soundCallId, status, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        return _executeGETRequest(`/conference/setIncomingSoundCallAnswerStatus/${soundCallId}/${status}`, successCallback, errorCallback);
    }
        var _createSoundCall = async function (params) {
        return _executeAsyncPOSTRequest("/conference/CreateSoundCall", params);
    }
    var _createConference = async function (params) {
        return _executeAsyncPOSTRequest("/conference/create", params)
    }
    var _getConferenceParticipants = async function(params) {
        return _executeAsyncPOSTRequest("/conference/getParticipants", params)
    }
    return {
        chat: {
            setVisualizzation: _setVisualizzation,
            getVisualizzation: _getVisualizzation,
            getMessages: _getMessages,
            getChats: _getChats,
            uploadFile: _uploadFile,
            checkChatChanged: _checkChatChanged,
            updateChat: _updateChat,
            sendMessage: _sendMessage,
            addChat: _addChat,
            createGroupChat: _createGroupChat,
            checkChatCount: _checkChatCount,
            getStatus: _getStatus,
            setStatus: _setStatus,
            restoreStatus: _restoreStatus,
            getUserInformation: _getUserInformation,
            getAllUsers: _getAllUsers
        },
        videoCall: {
            createConference: _createConference,
            getConferenceParticipants: _getConferenceParticipants,
            createSoundCall: _createSoundCall,
            checkIncomingSoundCall: _checkIncomingSoundCall,
            setIncomingSoundCallAnswerStatus: _setIncomingSoundCallAnswerStatus
        },
        email: {
            getFolders: _getFolders,
            getMailBox: _getMailbox
        },
        executeAsyncPOSTRequest: _executeAsyncPOSTRequest
    };

}