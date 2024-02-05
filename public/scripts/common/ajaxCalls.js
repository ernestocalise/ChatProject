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
    //Chat Functions: 
    var _setVisualizzation = function (messageId, successCallback = _defaultSuccessCallback, errorCallback = _defaultErrorCallback) {
        _executeGETRequest(`/chats/setVisualizzation/${messageId}`, successCallback, errorCallback);
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

    var _createConference = async function (params) {
        return _executeAsyncPOSTRequest("/conference/create", params)
    }
    var _createCallDocument = async function(params) {
        return _executeAsyncPOSTRequest("/conference/createCallDocument", params)
    }
    var _insertOfferIceCandidates = async function(params) {
        return _executeAsyncPOSTRequest("/conference/insertOfferIceCandidates", params)
    }
    var _checkAnswerDescriptionChanges = async function(params) {
        return _executeAsyncPOSTRequest("/conference/checkAnswerDescriptionChanges", params)
    }
    var _checkNewAnswerCandidates = async function(params) {
        return _executeAsyncPOSTRequest("/conference/checkNewAnswerIceCandidates", params);
    }
    var _checkNewOfferCandidates = async function(params) {
        return _executeAsyncPOSTRequest("/conference/checkNewOfferIceCandidates", params)
    }
    var _insertAnswerIceCandidates = async function(params){
        return _executeAsyncPOSTRequest("/conference/insertAnswerIceCandidates",params)
    }
    var _getOfferDescription = async function(params){
        return _executeAsyncPOSTRequest("/conference/getOfferDescription",params)
    }
    var _setAnswerDescription = async function(params) {
        return _executeAsyncPOSTRequest("/conference/setAnswerDescription", params)
    }
    return {
        chat: {
            setVisualizzation: _setVisualizzation,
            getMessages: _getMessages,
            getChats: _getChats,
            uploadFile: _uploadFile,
            checkChatChanged: _checkChatChanged,
            updateChat: _updateChat,
            sendMessage: _sendMessage,
            addChat: _addChat,
            checkChatCount: _checkChatCount,
            getStatus: _getStatus,
            setStatus: _setStatus,
            restoreStatus: _restoreStatus
        },
        videoCall: {
            createConference: _createConference,
            createCallDocument: _createCallDocument,
            insertOfferIceCandidates: _insertOfferIceCandidates,
            checkAnswerDescriptionChanges: _checkAnswerDescriptionChanges,
            checkNewAnswerCandidates: _checkNewAnswerCandidates,
            checkNewOfferCandidates: _checkNewOfferCandidates,
            insertAnswerIceCandidates:_insertAnswerIceCandidates,
            getOfferDescription: _getOfferDescription,
            setAnswerDescription: _setAnswerDescription
        },
        email: {
            getFolders: _getFolders,
            getMailBox: _getMailbox
        },
        executeAsyncPOSTRequest: _executeAsyncPOSTRequest
    };

}