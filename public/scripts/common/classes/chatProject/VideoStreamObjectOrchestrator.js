import { ajaxCall } from "../../ajaxCalls";
import { VideoStreamObject } from "./VideoStreamObject";

class VideoStreamObjectOrchestrator {
    constructor(localVideoSelector, videoElementContainer, stunServerConfiguration){
        this.videoConferenceId = 0;
        this.stunServerConfiguration = stunServerConfiguration;
        this.localStream = new MediaStream();
        this.userMedia = {
            webcamStatus: false,
            audioStatus: false,
            screenStatus: false,
            audioOptions: {
                echoCancellation: true,
                noiseSuppression: true
            },
            audioStream: new MediaStream(),
            videoStream: new MediaStream()
        }
        this.localVideoObject = document.getElementById(localVideoSelector);
        this.videoStreamObjectCollection = [];
        this.videoElementContainer = document.getElementById(videoElementContainer);
        this.ajaxCall = ajaxCall();
    }
        addVideoStreamObject(object) {
            if(object instanceof VideoStreamObject) {
                this.videoStreamObjectCollection.push(object);
            }
        }

        //User Media Management
        async #setupAudioStream(doBind = true) {
            this.userMedia.audioStream.getTracks().forEach(track => track.stop());
            this.userMedia.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    noiseSuppression: this.userMedia.audioOptions.noiseSuppression,
                    echoCancellation: this.userMedia.audioOptions.echoCancellation
                }
            });
            if (doBind)
                this.#bindLocalStream();
        }
        async #setupWebcam(doBind = true) {
            this.userMedia.webcamStatus = true;
            this.userMedia.screenStatus = false;
            this.userMedia.videoStream.getTracks().forEach(track => track.stop());
            let webcamStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: this.userMedia.webcamStatus });
            this.userMedia.videoStream = webcamStream;
            if (doBind)
                this.#bindLocalStream();
        }
        async #setupScreen(doBind = true) {
            this.userMedia.webcamStatus = false;
            this.userMedia.screenStatus = true;
            let screenStream = await navigator.mediaDevices.getDisplayMedia(
                {
                    video: {
                        mediaSource: "screen"
                    }
                });
            this.userMedia.videoStream.getTracks().forEach(track => track.stop());
            this.userMedia.videoStream = screenStream;
            if (doBind)
                this.#bindLocalStream();
        }
        async #bindLocalStream() {
            let mixedStream = new MediaStream();
            this.userMedia.videoStream.getTracks().forEach(videoTrack => mixedStream.addTrack(videoTrack));
            this.userMedia.audioStream.getTracks().forEach(audioTrack => mixedStream.addTrack(audioTrack));
            this.localStream = mixedStream;
            let senders = this.connection.getSenders();
            senders.forEach(sender => {
                this.videoStreamObjectCollection.forEach(
                    VSO => {
                        VSO.connection.removeTrack(sender);
                    }
                );
            });
            let orchestrator = this;
            this.localStream.getTracks().forEach((track) => {
                this.videoStreamObjectCollection.forEach(
                    VSO => 
                    {
                        VSO.connection.addTrack(track, orchestrator.localStream);
                    });
            })
            this.localVideoObject.srcObject = this.localStream;

        }
        async initializeUserMedia(isWebcamEnabled = this.userMedia.webcamStatus, isAudioEnabled = this.userMedia.audioStatus, isScreenEnabled = this.userMedia.screenStatus) {
            if (isAudioEnabled)
                await this.#setupAudioStream(false);
            else
                this.userMedia.audioStream = new MediaStream();
            if (isWebcamEnabled)
                await this.#setupWebcam(false);
            if (isScreenEnabled && !isWebcamEnabled)
                await this.#setupScreen(false);
            this.#bindLocalStream();
        }
        async createConference(userIds) {
            let videoConferenceData = await this.ajaxCall.videoCall.createConference(
                {
                    userIdCollection: userIds,
                    '_token': this.csrf_token
                });
            this.videoConferenceId = videoConferenceData.conference_id;
        }
        async createCalls(userIds) {
            await this.ajaxCall.videoCall.createSoundCall({
                userIdCollection: userIds,
                conferenceId: this.conferenceId,
                '_token': this.csrf_token
            });
            return true;
        }
        #createVideoElement(userId) {
            this.videoElementContainer.append(
                `
                <video id="remoteVideo-${userId}-${this.conferenceId}" autoplay playsinline></video>
                `
            );
            return `remoteVideo-${userId}-${this.conferenceId}`;
        }
        async startCall(userIds) {
            await this.createConference(userIds);
            await this.initializeUserMedia(this.userMedia.webcamStatus, this.userMedia.audioStatus, this.userMedia.screenStatus);
            await this.createCalls(userIds);
            userIds.forEach(userId => {
                videoElement = this.#createVideoElement(userId);
                this.addVideoStreamObject(new VideoStreamObject(videoElement, this.stunServerConfiguration));
            });
            this.videoStreamObjectCollection.forEach(
                videoStream => {
                    videoStream.call(this.videoConferenceId);
                }
            )
        }
        async getOrCreateDocumentIds(conferenceId) {
            let documentIds = await this.ajaxCall.videoCall.getDocumentId({
                
            })
        }
        async answerCall(conferenceId) {
            await this.getDocumentId(conferenceId);
        }
}