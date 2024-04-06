import { ajaxCall } from "../../ajaxCalls.js";
import { VideoStreamObject } from "./VideoStreamObject.js";

export class VideoStreamObjectOrchestrator {
    constructor(localVideoSelector, videoElementContainer, stunServerConfiguration, userId){
        this.videoConferenceId = 0;
        this.csrf_token = null;
        this.userId = userId;
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
        window.VSO = this;
    }
        addVideoStreamObject(object) {
            if(object instanceof VideoStreamObject) {
                object.localStream = this.localStream;
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
            if(this.videoStreamObjectCollection.length > 0){

                let senders = this.videoStreamObjectCollection[0].connection.getSenders();
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
            }
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
        async createSoundCalls(userIds) {
            await this.ajaxCall.videoCall.createSoundCall({
                userIdCollection: userIds,
                conferenceId: this.videoConferenceId,
                '_token': this.csrf_token
            });
            return true;
        }
        #createVideoElement(userId) {
            let videoContent = `
            <h3>Video From ${userId}.</h3>
            <video id="remoteVideo-${userId}-${this.videoConferenceId}" autoplay playsinline></video>`;
            let span = document.createElement("span");
            span.innerHTML = videoContent;
            this.videoElementContainer.appendChild(span);
            return `remoteVideo-${userId}-${this.videoConferenceId}`;
        }
        async startCall(userIds) {
            await this.createConference(userIds);
            userIds = userIds.filter(item => item !== this.userId)
            this.userMedia.webcamStatus = true;
            this.userMedia.audioStatus = true;
            await this.initializeUserMedia(true,false,false);
            await this.createSoundCalls(userIds);
            userIds.forEach(targetId => {
                let videoElement = this.#createVideoElement(targetId);
                let VSO = new VideoStreamObject(videoElement, this.stunServerConfiguration, this.userId, targetId);
                VSO.csrf_token = this.csrf_token;
                this.addVideoStreamObject(VSO);
            });
            this.videoStreamObjectCollection.forEach(
                videoStream => {
                    videoStream.call(this.videoConferenceId);
                }
            )
        }
        async answerCall(conferenceId) {
            this.videoConferenceId = conferenceId;
            let participants = await this.ajaxCall.videoCall.getConferenceParticipants({
                "_token": this.csrf_token,
                "conferenceId":  this.videoConferenceId
            });
            this.userMedia.webcamStatus = true;
            this.userMedia.audioStatus = true;
            await this.initializeUserMedia();
            participants.forEach(
                async (participant) => {
                    let videoElement = this.#createVideoElement(participant.id);
                    let callDocument = await this.ajaxCall.videoCall.getOrCreateDocumentId({
                        conference_id: conferenceId,
                        target_id: participant.id,
                        "_token": this.csrf_token
                    })
                    let VSO = new VideoStreamObject(videoElement, this.stunServerConfiguration, callDocument.callerId, callDocument.targetId);
                    VSO.csrf_token = this.csrf_token;
                    if(callDocument.isCaller) {
                        await VSO.answerAsCaller(callDocument.documentId);
                    } else {
                        await VSO.answer(callDocument.documentId);
                    }
                }
            )
        }
}