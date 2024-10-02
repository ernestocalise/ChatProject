import {ajaxCall} from "./../common/ajaxCalls.js";
import {global} from "./../common/globalFunctions.js";
var chatProject = chatProject || {};

//Setting up chatPage
chatProject.ajaxCall = ajaxCall().chat;
chatProject.fh = global();
chatProject.videoCall = (function (me) {
    var _isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    var _timeouts = {
        tmrTimeElapsed: null
    };
    var _selectors = {
        csrf_token: 'meta[name=csrf-token]',
        preJoin: {
            window: "#prejoin",
            chkWebcams: "#chkWebcams",
            cbxWebcams: "#webcams",
            chkMicrophones: "#chkMicrophones",
            cbxMicrophones: "#microphones",
            cbxSpeakers: "#speakers",
            btnJoin: "#join-btn",
            btnSaveSettings:"#btnSaveSettings",
            btnCancelSettings: "#btnCancelSettings",
            settingsBtnContainer: "#settings-btnContainer",
            options: {
                chkAcousticEchoCancellation: "#chkAcousticEchoCancellation",
                chkAudioGainControl: "#chkAudioGainControl",
                chkAutomaticNoiseSuppression: "#chkAutomaticNoiseSuppression",
                chkWebcamOptimizationMode: "#chkWebcamOptimizationMode"
            }
        },
        streamWrapper: {
            window: "#stream-wrapper",
            header: {
                timeSpan: "#timeSpan",
                chatName: "#chatName"
            },
            streamControls: {
                window: "#stream-controls",
                btnLeave: "#leave-btn",
                btnMic: "#mic-btn",
                btnCamera: "#camera-btn",
                btnScreen: "#screen-btn",
                btnSettings: "#settings-btn"
            },
            videoStreams: "#video-streams"
        }
    };    
    var _texts = {};
    var _icons = {
        streamControls: {
            _colors: {
                off: "cadetblue",
                on: "#EE4B2B"
            },
            microphones: {
                off: "mic",
                on: "mic_off"
            },
            webcam: {
                off: "videocam",
                on: "videocam_off"
            },
            screenshare: {
                off: "screen_share",
                on: "stop_screen_share"
            }
        }
    };
    var _fromPhpPage = {
        personalUserId: null,
		channelName: null, 
		token: null,
        app_id: null,
        start_date: null,
        chat_name: null
    };
    var _deviceList = {
        webcams: [],
        microphones: [],
        speakers: []
    }
    const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    const ClientConfiguration = {
        APP_ID: null,
        Channel: null,
        Token: null,
        UID: null,
        LocalTracks: {
            AudioTrack: null,
            VideoTrack: null
        },
        remoteUsers: {},
        AudioSettings: {
            AcousticEchoCancellation: false,
            AudioGainControl: false,
            AutomaticNoiseSuppression: false,
            MicrophoneId: null,
            IsMicrophoneMuted: false
        },
        WebcamSettings: {
            OptimizationMode: false, // True = motion(video smooth, low quality), False = detail(video quality)
            FacingMode: "user", //user = Front Camera, environment = rear camera;
            CameraId: null,
            IsCameraStreamEnabled: false
        },
        ScreenShareSettings: {
            CaptureSystemAudio: false,
            OptimizationMode: false,
            IsScreenShareEnabled: false
        },
        SpeakerSettings: {
            SpeakerId: null
        },
        CallStartedTimestamp : null,
        setClientConfiguration: function(ID, Channel, Token, StartDate) {
            this.APP_ID = ID;
            this.Channel = Channel;
            this.Token = Token;
            this.CallStartedTimestamp = StartDate
        },
        ClientConfigurationObject : {
            GetMicrophoneConfigurationObject: function() {
                return {
                    AEC: ClientConfiguration.AudioSettings.AcousticEchoCancellation,
                    AGC: ClientConfiguration.AudioSettings.AudioGainControl,
                    ANS: ClientConfiguration.AudioSettings.AutomaticNoiseSuppression,
                    microphoneId: ClientConfiguration.AudioSettings.MicrophoneId
                }
            },
            GetWebcamConfigurationObject: function() {
                return {
                    cameraId: ClientConfiguration.WebcamSettings.CameraId,
                    optimizationMode: ClientConfiguration.WebcamSettings.OptimizationMode ? "detail" : "motion"
                }
            },
            GetScreenShareConfigurationObject: function() {
                return {
                    systemAudio: ClientConfiguration.ScreenShareSettings.CaptureSystemAudio,
                    optimizationMode: ClientConfiguration.ScreenShareSettings.OptimizationMode ? "detail" : "motion"
                }
            }
        },
        removeVideoTrack: function() {
            if(ClientConfiguration.LocalTracks.VideoTrack != null){
                ClientConfiguration.LocalTracks.VideoTrack.stop();
                ClientConfiguration.LocalTracks.VideoTrack.close();
                client.unpublish(ClientConfiguration.LocalTracks.VideoTrack)
                ClientConfiguration.LocalTracks.VideoTrack = null;
            }
            ClientConfiguration.WebcamSettings.IsCameraStreamEnabled = false;
            ClientConfiguration.ScreenShareSettings.IsScreenShareEnabled = false;
            let player = document.getElementById(`user-container-${ClientConfiguration.UID}>.video-player`)
            if (player != null){
                player.remove()
            }
            _updateBtnIcon(_selectors.streamWrapper.streamControls.btnCamera, _icons.streamControls.webcam, false);
            _updateBtnIcon(_selectors.streamWrapper.streamControls.btnScreen, _icons.streamControls.screenshare, false);
        }
    }


    var _readPhpPageData = function() {
        _fromPhpPage = JSON.parse($("#fromPhpPage").val());
        _texts = JSON.parse($("#fromPhpLocale").val());
        $("#fromPhpPage").remove();
        $("#fromPhpLocale").remove();
    }
    var _initialize = async function(){
        await chatProject.fh.time.sleep(500);
        _readPhpPageData();
        ClientConfiguration.setClientConfiguration(
            _fromPhpPage.app_id, 
            _fromPhpPage.channelName, 
            _fromPhpPage.token,
            _fromPhpPage.start_date
        );
        $(_selectors.streamWrapper.header.chatName).text(_fromPhpPage.chat_name);
        _getDeviceList();
        _doBindings();
        _timeouts.tmrTimeElapsed = setInterval(_tmrElapsed_Tick, 1000);
    };




    //Logical function
    var _getDeviceList = async function () {
        let cameras = await AgoraRTC.getCameras();
        cameras.forEach(x => {
            let opt = document.createElement("option");
            opt.innerHTML = x.label;
            opt.value = x.deviceId;
            document.getElementById("webcams").appendChild(opt);
            _deviceList.webcams.push({deviceId: x.deviceId, deviceName: x.label});
        });
        let microphones = await AgoraRTC.getMicrophones();
        microphones.forEach(x => {
            let opt = document.createElement("option");
            opt.innerHTML = x.label;
            opt.value = x.deviceId;
            document.getElementById("microphones").appendChild(opt);
            _deviceList.microphones.push({deviceId: x.deviceId, deviceName: x.label});
        });
        let speakers = await AgoraRTC.getPlaybackDevices();
        speakers.forEach(function(x,i) {
            let num = i+1;
            let opt = document.createElement("option");
            if(_isFirefox)
                opt.innerHTML = "Speaker "+num;
            else
                opt.innerHTML = x.label;
            opt.value = x.deviceId;
            document.getElementById("speakers").appendChild(opt);
            _deviceList.speakers.push({deviceId: x.deviceId, deviceName: x.label});
        });
        ClientConfiguration.WebcamSettings.CameraId = _deviceList.webcams.length > 0 ? _deviceList.webcams[0].deviceId : null;
        ClientConfiguration.AudioSettings.MicrophoneId = _deviceList.microphones.length > 0 ? _deviceList.microphones[0].deviceId : null;
        ClientConfiguration.SpeakerSettings.SpeakerId = _deviceList.speakers.length > 0 ? _deviceList.speakers[0].deviceId : null; 
    }
    var _tmrElapsed_Tick = function () {
        let InitialTimeStamp =  new Date(ClientConfiguration.CallStartedTimestamp);
        let currDiff = new Date(new Date() - InitialTimeStamp);
        $(_selectors.streamWrapper.header.timeSpan).text(`${currDiff.getHours().toString().padStart(2,"0")}:${currDiff.getMinutes().toString().padStart(2,"0")}:${currDiff.getSeconds().toString().padStart(2,"0")}`);
    }
    //Graphical function
    var _updateBtnIcon = function(button, icon, iconStatus) {
        let _icon = icon[iconStatus == true ? "on" : "off"];
        if(icon == _icons.streamControls.microphones)
            iconStatus != iconStatus;
        let _color = _icons.streamControls._colors[iconStatus == true ? "on" : "off"];
        $(button).find("span")[0].innerHTML = _icon;
        $(button).css("background-color", _color);        
    }
    //Generative function
    var joinAndDisplayLocalStream = async function() {
        client.on('user-published', handleUserJoined)
    
        client.on('user-left', handleUserLeft)
        ClientConfiguration.UID = await client.join(ClientConfiguration.APP_ID, ClientConfiguration.Channel, ClientConfiguration.Token, _fromPhpPage.personalUserId)
        ClientConfiguration.LocalTracks.AudioTrack = await AgoraRTC.createMicrophoneAudioTrack(ClientConfiguration.ClientConfigurationObject.GetMicrophoneConfigurationObject());
        ClientConfiguration.LocalTracks.AudioTrack.setMuted(ClientConfiguration.AudioSettings.IsMicrophoneMuted);
        if(ClientConfiguration.WebcamSettings.IsCameraStreamEnabled){
            ClientConfiguration.LocalTracks.VideoTrack = await AgoraRTC.createCameraVideoTrack(ClientConfiguration.ClientConfigurationObject.GetWebcamConfigurationObject());
        }
    
        let player = `<div class="video-container" id="user-container-${ClientConfiguration.UID}">
                            <div class="video-player" id="user-${ClientConfiguration.UID}"></div>
                            <p class="subvideo" id="subvideo-user-${ClientConfiguration.UID}"></p>
                      </div>`
        $(_selectors.streamWrapper.videoStreams).append(player);
        chatProject.ajaxCall.getUserInformation(ClientConfiguration.UID, function(response) {
                $(`#subvideo-user-${response.id}`).text(response.username);
                $(`#user-${response.id}`).css("background-image", `url('${response.profile_pic}')`);
        }, function(err){console.error(err)});
        let localTracks = [];
        localTracks.push(ClientConfiguration.LocalTracks.AudioTrack);
        if(ClientConfiguration.WebcamSettings.IsCameraStreamEnabled){
            ClientConfiguration.LocalTracks.VideoTrack.play(`user-${ClientConfiguration.UID}`)
            localTracks.push(ClientConfiguration.LocalTracks.VideoTrack);
        }
        await client.publish(localTracks);
    }
    //Handlers
    let handleUserJoined = async (user, mediaType) => {
        ClientConfiguration.remoteUsers[user.uid] = user 
        
        await client.subscribe(user, mediaType)
    
        let player = document.getElementById(`user-container-${user.uid}`)

        if (mediaType === 'video'){
            if (player != null){
                player.remove()
            }
            player = null;
        }
        if (player == null) {
                player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div> 
                <p class="subvideo" id="subvideo-user-${user.uid}"></p>
                </div>`
                document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        }
        var _successCallback = function(data) {
            console.log(data);
            $(`#subvideo-user-${data.id}`).text(data.username);
            $(`#user-${data.id}`).css("background-image", `url('${data.profile_pic}')`);
        }
        var _errorCallback = function(error) {
            console.error(error);
        }
        chatProject.ajaxCall.getUserInformation(user.uid, _successCallback, _errorCallback);
        if(mediaType === 'video'){
            user.videoTrack.play(`user-${user.uid}`)
        }
        if (mediaType === 'audio'){
            if(!_isFirefox)
                await user.audioTrack.setPlaybackDevice(ClientConfiguration.SpeakerSettings.SpeakerId);
            user.audioTrack.play()
        }
    }
    let initVolumeIndicator = async () => {

        //1
        AgoraRTC.setParameter('AUDIO_VOLUME_INDICATION_INTERVAL', 200);
        client.enableAudioVolumeIndicator();
        
        //2
        client.on("volume-indicator", volumes => {
          volumes.forEach((volume) => {
            let actualBorder = ""     
            if(Number(volume.level) >= 50) {
                actualBorder = "2px solid #209A49" 
            } else {
                actualBorder = "2px solid #204A49"
            }
                $(`#user-container-${volume.uid}`).css("border", ` ${actualBorder}`);
          });
        })
      }
    let handleUserLeft = async (user) => {
        delete ClientConfiguration.remoteUsers[user.uid]
        document.getElementById(`user-container-${user.uid}`).remove()
    }

    //Bindings

    //Prejoin
    var _onJoinBtn_Click = async function() {
        //Getting Webcam settings
        ClientConfiguration.WebcamSettings.CameraId = $(_selectors.preJoin.cbxWebcams).val();
        ClientConfiguration.WebcamSettings.IsCameraStreamEnabled = document.querySelector(_selectors.preJoin.chkWebcams).checked;
        ClientConfiguration.AudioSettings.MicrophoneId = $(_selectors.preJoin.cbxMicrophones).val();
        ClientConfiguration.AudioSettings.IsMicrophoneMuted = !document.querySelector(_selectors.preJoin.chkMicrophones).checked;
        ClientConfiguration.SpeakerSettings.SpeakerId = $(_selectors.preJoin.cbxSpeakers).val();
        ClientConfiguration.WebcamSettings.OptimizationMode = $(_selectors.preJoin.options.chkWebcamOptimizationMode)[0].checked;
        ClientConfiguration.WebcamSettings.OptimizationMode = document.querySelector(_selectors.preJoin.options.chkWebcamOptimizationMode).checked;
        ClientConfiguration.AudioSettings.AcousticEchoCancellation = document.querySelector(_selectors.preJoin.options.chkAcousticEchoCancellation).checked;
        ClientConfiguration.AudioSettings.AudioGainControl = document.querySelector(_selectors.preJoin.options.chkAudioGainControl).checked;
        ClientConfiguration.AudioSettings.AutomaticNoiseSuppression = document.querySelector(_selectors.preJoin.options.chkAutomaticNoiseSuppression).checked;
        await joinAndDisplayLocalStream()
        await initVolumeIndicator();
        $(_selectors.preJoin.window).css("display", "none");
        $(_selectors.preJoin.btnJoin).css("display","none");
        $(_selectors.streamWrapper.streamControls.btnLeave).css("display", "initial");
        $(_selectors.streamWrapper.streamControls.window).css("display", "flex");
        $(_selectors.streamWrapper.window).css("display","initial");
        _updateBtnIcon(_selectors.streamWrapper.streamControls.btnMic, _icons.streamControls.microphones, ClientConfiguration.AudioSettings.IsMicrophoneMuted);
        _updateBtnIcon(_selectors.streamWrapper.streamControls.btnCamera, _icons.streamControls.webcam, ClientConfiguration.WebcamSettings.IsCameraStreamEnabled);
        _updateBtnIcon(_selectors.streamWrapper.streamControls.btnScreen, _icons.streamControls.screenshare, ClientConfiguration.ScreenShareSettings.IsScreenShareEnabled);
    }
    var _onBtnSaveSettings_Click = async function() {
        //Read All Settings
        ClientConfiguration.WebcamSettings.CameraId = $(_selectors.preJoin.cbxWebcams).val();
        ClientConfiguration.AudioSettings.MicrophoneId = $(_selectors.preJoin.cbxMicrophones).val();
        ClientConfiguration.SpeakerSettings.SpeakerId = $(_selectors.preJoin.cbxSpeakers).val();
        ClientConfiguration.WebcamSettings.OptimizationMode = document.querySelector(_selectors.preJoin.options.chkWebcamOptimizationMode).checked;
        ClientConfiguration.AudioSettings.AcousticEchoCancellation = document.querySelector(_selectors.preJoin.options.chkAcousticEchoCancellation).checked;
        ClientConfiguration.AudioSettings.AudioGainControl = document.querySelector(_selectors.preJoin.options.chkAudioGainControl).checked;
        ClientConfiguration.AudioSettings.AutomaticNoiseSuppression = document.querySelector(_selectors.preJoin.options.chkAutomaticNoiseSuppression).checked;
        //Update Camera Settings
        if(ClientConfiguration.WebcamSettings.IsCameraStreamEnabled){
            ClientConfiguration.LocalTracks.VideoTrack.stop();
            ClientConfiguration.LocalTracks.VideoTrack.close();
            client.unpublish(ClientConfiguration.LocalTracks.VideoTrack);
            ClientConfiguration.LocalTracks.VideoTrack = null;
            ClientConfiguration.LocalTracks.VideoTrack = await AgoraRTC.createCameraVideoTrack(ClientConfiguration.ClientConfigurationObject.GetWebcamConfigurationObject());
            ClientConfiguration.LocalTracks.VideoTrack.play(`user-${ClientConfiguration.UID}`)
            client.publish(ClientConfiguration.LocalTracks.VideoTrack);
        }
        //Update Microphone Settings
            ClientConfiguration.LocalTracks.AudioTrack.stop();
            ClientConfiguration.LocalTracks.AudioTrack.close();
            client.unpublish(ClientConfiguration.LocalTracks.AudioTrack)
            ClientConfiguration.LocalTracks.AudioTrack = null;
            ClientConfiguration.LocalTracks.AudioTrack = await AgoraRTC.createMicrophoneAudioTrack(ClientConfiguration.ClientConfigurationObject.GetMicrophoneConfigurationObject());
            ClientConfiguration.LocalTracks.AudioTrack.setMuted(ClientConfiguration.AudioSettings.IsMicrophoneMuted);
            client.publish(ClientConfiguration.LocalTracks.AudioTrack);

        //Update Speaker Settings
        if(!_isFirefox){
            ClientConfiguration.SpeakerSettings.SpeakerId = $(_selectors.preJoin.cbxSpeakers).val();
            Object.keys(ClientConfiguration.remoteUsers).forEach(async key => {
                await ClientConfiguration.remoteUsers[key].audioTrack.setPlaybackDevice(ClientConfiguration.SpeakerSettings.SpeakerId);
            });
        }

        //Close Settings page
        $(_selectors.preJoin.window).css("display", "none");
        $(_selectors.streamWrapper.streamControls.window).css("display", "flex");
        $(_selectors.streamWrapper.window).css("display","initial");
    }
    var _onBtnCancelSettings_Click = function () {
        $(_selectors.preJoin.cbxWebcams).val(ClientConfiguration.WebcamSettings.CameraId);
        $(_selectors.preJoin.cbxMicrophones).val(ClientConfiguration.AudioSettings.MicrophoneId);
        $(_selectors.preJoin.cbxSpeakers).val(ClientConfiguration.SpeakerSettings.SpeakerId);
        document.querySelector(_selectors.preJoin.options.chkWebcamOptimizationMode).checked = ClientConfiguration.WebcamSettings.OptimizationMode;
        document.querySelector(_selectors.preJoin.options.chkAcousticEchoCancellation).checked = ClientConfiguration.AudioSettings.AcousticEchoCancellation;
        document.querySelector(_selectors.preJoin.options.chkAudioGainControl).checked = ClientConfiguration.AudioSettings.AudioGainControl;
        document.querySelector(_selectors.preJoin.options.chkAutomaticNoiseSuppression).checked = ClientConfiguration.AudioSettings.AutomaticNoiseSuppression;
        //Close Settings page
        $(_selectors.preJoin.window).css("display", "none");
        $(_selectors.streamWrapper.streamControls.window).css("display", "flex");
        $(_selectors.streamWrapper.window).css("display","initial");
    }
    //Stream Controls
    var _onBtnCameraClick = async function(e) {
        
        if(ClientConfiguration.WebcamSettings.IsCameraStreamEnabled ){
           ClientConfiguration.removeVideoTrack(); 
        } else {
            if(ClientConfiguration.ScreenShareSettings.IsScreenShareEnabled)
                ClientConfiguration.removeVideoTrack(); 
            ClientConfiguration.LocalTracks.VideoTrack = await AgoraRTC.createCameraVideoTrack(ClientConfiguration.ClientConfigurationObject.GetWebcamConfigurationObject());
            ClientConfiguration.LocalTracks.VideoTrack.play(`user-${ClientConfiguration.UID}`)
            client.publish(ClientConfiguration.LocalTracks.VideoTrack);
            ClientConfiguration.WebcamSettings.IsCameraStreamEnabled = true;
            _updateBtnIcon(_selectors.streamWrapper.streamControls.btnCamera, _icons.streamControls.webcam, true);
        }
    }
    var _onBtnScreenClick = async function(e) {
        if(ClientConfiguration.ScreenShareSettings.IsScreenShareEnabled){
            ClientConfiguration.removeVideoTrack(); 
         } else {
            if(ClientConfiguration.WebcamSettings.IsCameraStreamEnabled)
                ClientConfiguration.removeVideoTrack();
             ClientConfiguration.LocalTracks.VideoTrack = await AgoraRTC.createScreenVideoTrack(ClientConfiguration.ClientConfigurationObject.GetScreenShareConfigurationObject());
             ClientConfiguration.LocalTracks.VideoTrack.play(`user-${ClientConfiguration.UID}`)
             client.publish(ClientConfiguration.LocalTracks.VideoTrack);
             ClientConfiguration.ScreenShareSettings.IsScreenShareEnabled = true;
             _updateBtnIcon(_selectors.streamWrapper.streamControls.btnScreen, _icons.streamControls.screenshare, true);
         }
    }
    var _onLeaveBtnClick = async function() {
        if(ClientConfiguration.LocalTracks.AudioTrack != null){
            ClientConfiguration.LocalTracks.AudioTrack.stop()
            ClientConfiguration.LocalTracks.AudioTrack.close()
        }
        if(ClientConfiguration.LocalTracks.VideoTrack != null){
            ClientConfiguration.LocalTracks.VideoTrack.stop()
            ClientConfiguration.LocalTracks.VideoTrack.close()
        }
        await client.leave()
        $(_selectors.preJoin.window).css("display", "block");
        $(_selectors.streamWrapper.window).css("display","none");
        $(_selectors.streamWrapper.videoStreams).html("");
        window.close();
    }
    var _onBtnMicClick = async function() {
        ClientConfiguration.AudioSettings.IsMicrophoneMuted = !ClientConfiguration.AudioSettings.IsMicrophoneMuted;
            await ClientConfiguration.LocalTracks.AudioTrack.setMuted(ClientConfiguration.AudioSettings.IsMicrophoneMuted);
            _updateBtnIcon(_selectors.streamWrapper.streamControls.btnMic, _icons.streamControls.microphones, ClientConfiguration.AudioSettings.IsMicrophoneMuted);
    }
    var _onBtnSettingsClick = function() {
        $(_selectors.preJoin.window).css("display", "flex");
        $(_selectors.streamWrapper.streamControls.window).css("display", "none");
        $(_selectors.streamWrapper.window).css("display","none");
        $(_selectors.preJoin.settingsBtnContainer).css("display","block");
        $(".switch").each(function(index) {
            $(this).css("display","none");
        });
    }
    var _doBindings = function() {
        $(_selectors.preJoin.btnJoin).bind("click", _onJoinBtn_Click);
        $(_selectors.preJoin.btnSaveSettings).bind("click", _onBtnSaveSettings_Click);
        $(_selectors.preJoin.btnCancelSettings).bind("click", _onBtnCancelSettings_Click);
        $(_selectors.streamWrapper.streamControls.btnCamera).bind("click", _onBtnCameraClick);
        $(_selectors.streamWrapper.streamControls.btnMic).bind("click", _onBtnMicClick);
        $(_selectors.streamWrapper.streamControls.btnLeave).bind("click", _onLeaveBtnClick);
        $(_selectors.streamWrapper.streamControls.btnScreen).bind("click", _onBtnScreenClick);
        $(_selectors.streamWrapper.streamControls.btnSettings).bind("click", _onBtnSettingsClick);
    }
    me.initialize = _initialize;
    return me;
})(chatProject.videoCall || {});
$(document).ready(chatProject.videoCall.initialize);