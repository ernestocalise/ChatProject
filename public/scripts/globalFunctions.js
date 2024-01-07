export function global() {
    //STRING
    var _isStringEmpty = function(str) {
        if(str != null && str.trim() != "") return false;
        return true;
    };

    //INTERFACE
    var _showLoader = function() {
        $(".loader").css("display", "block");
    };
    var _hideLoader = function() {
        $(".loader").css("display", "none");
    };


    //TIME
    const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

    var _textFuncions = {
        isStringEmpty: _isStringEmpty
    };
    var _interface = {
        showLoader: _showLoader,
        hideLoader: _hideLoader
    };
    var _time = {
        sleep: _sleep
    }
    return {
        string: _textFuncions,
        interface: _interface,
        time: _time
    };
}