export function global() {
    var _isStringEmpty = function(str) {
        if(message != null && message.trim() != "") return false;
        return true;
    };
    var _showLoader = function() {
        $(".loader").css("display", "block");
    };
    var _hideLoader = function() {
        $(".loader").css("display", "none");
    };
    var _textFuncions = {
        isStringEmpty: _isStringEmpty
    };
    var _interface = {
        showLoader: _showLoader,
        hideLoader: _hideLoader
    };
    return {
        string: _textFuncions,
        interface: _interface
    };
}