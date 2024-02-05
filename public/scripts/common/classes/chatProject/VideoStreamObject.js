import { Timer } from "./../timer.js";
import { ajaxCall } from "../../ajaxCalls.js";
export class VideoStreamObject {
    constructor(localVideoSelector, remoteVideoSelector, stunServerConfiguration) {
        this.videoConferenceId = 0;
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
        this.localStream = new MediaStream();
        this.remoteStream = new MediaStream();
        this.localVideoObject = document.getElementById(localVideoSelector);
        this.remoteVideoObject = document.getElementById(remoteVideoSelector);
        this.comunicationData = {
            stunServers: stunServerConfiguration,
            localIceCandidates: [],
            remoteIceCandidates: [],
            answerDescription: null,
            callId: 0,
            conferenceId: 0
        },
            this.connection = new RTCPeerConnection(this.comunicationData.stunServers);
        this.timers = {
            tmrAnswerDescription: null,
            tmrAnswerCandidate: null,
            tmrOfferCandidate: null
        }
        this.csrf_token = "";
        this.ajaxCall = ajaxCall();
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
        senders.forEach(sender => this.connection.removeTrack(sender));
        this.localStream.getTracks().forEach((track) => {
            this.connection.addTrack(track, this.localStream);
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
    async #listenToRemoteStream() {
        this.connection.addEventListener('track', async (event) => {
            this.remoteStream = event.streams;
            this.remoteVideoObject.srcObject = this.remoteStream;
        });
    }
    //SetupConference
    async createConference(userIds) {
        let videoConferenceData = await this.ajaxCall.videoCall.createConference(
            {
                userIds: userIds,
                '_token': this.csrf_token
            });
        this.videoConferenceId = videoConferenceData.conference_id;
    }

    //Setup a call
    async #createCallDocument(CallObject) {
        let callDocumentData = await this.ajaxCall.videoCall.createCallDocument(
            {
                offerDescription: CallObject,
                conference_id: this.videoConferenceId,
                '_token': this.csrf_token
            });
        this.comunicationData.callId = callDocumentData.documentId;
    }
    async #insertOfferIceCandidateInDatabase(iceCandidate) {

        let callDocumentData = await this.ajaxCall.videoCall.insertOfferIceCandidates(
            {
                callDocumentId: this.comunicationData.callId,
                candidate: JSON.stringify(iceCandidate),
                '_token': this.csrf_token
            });

    }
    async #checkAnswerDescriptionChanges() {
        let answerDescriptionChanges = await this.VSO().ajaxCall.videoCall.checkAnswerDescriptionChanges(
            {
                callDocumentId: this.VSO().comunicationData.callId,
                userAnswerDescription: this.VSO().answerDescription,
                '_token': this.VSO().csrf_token
            });
        if (answerDescriptionChanges.changed) {
            if (!this.VSO().connection.currentRemoteDescription && answerDescriptionChanges.answer_candidate) {
                const answerDescription = new RTCSessionDescription(answerDescriptionChanges.answer_candidate);
                this.VSO().answerDescription = answerDescriptionChanges.answer_candidate;
                this.VSO().connection.setRemoteDescription(answerDescription);
            }
        }

    }
    async #checkNewAnswerCandidates() {
        let data = await this.VSO().ajaxCall.videoCall.checkNewAnswerCandidates(
            {
                callDocumentId: this.VSO().comunicationData.callId,
                userIceCandidateCount: this.VSO().comunicationData.remoteIceCandidates.length,
                '_token': this.VSO().csrf_token
            }
        );
        if (data.status) {
            if (!this.VSO().connection.currentRemoteDescription && data.answer_candidate) {
                data.iceCandidates.forEach(iceCandidate => {
                    this.VSO().comunicationData.remoteIceCandidates.push(iceCandidate);
                });
                const candidate = new RTCIceCandidate(data.answer_candidate[0]);
                this.answerDescription = data.answer_candidate;
                this.VSO().connection.addIceCandidate(candidate);
            }
        }
    }
    async call() {
        const offerDescription = await this.connection.createOffer();
        this.connection.onicecandidate = event => {
            if (event.candidate) {
                this.comunicationData.localIceCandidates.push(event.candidate.toJSON());
                this.#insertOfferIceCandidateInDatabase(event.candidate);
            }
        };
        let offer = JSON.stringify(offerDescription);
        await this.#createCallDocument(offer);
        await this.connection.setLocalDescription(offerDescription);
        this.timers.tmrAnswerDescription = new Timer("tmrAnswerDescription", this.#checkAnswerDescriptionChanges, 3, false);
        this.timers.tmrAnswerDescription.VSO = () => {return this};
        this.timers.tmrAnswerDescription.start();
        this.timers.tmrAnswerCandidate = new Timer("tmrAnswerCandidate", this.#checkNewAnswerCandidates, 3, false);
        this.timers.tmrAnswerCandidate.VSO = () => {return this};
        this.timers.tmrAnswerCandidate.start();
        this.#listenToRemoteStream();

    }
    //Answer a call
    async #checkNewOfferCandidates() {
        //Request stuff
        let data = await this.VSO().ajaxCall.videoCall.checkNewOfferCandidates(
            {
                callDocumentId: this.VSO().comunicationData.callId,
                userIceCandidateCount: this.VSO().comunicationData.remoteIceCandidates.length,
                '_token': this.VSO().csrf_token
            }
        );
        if (data.status) {
            if (!this.VSO().connection.currentRemoteDescription && data.answer_candidate) {
                data.iceCandidates.forEach(iceCandidate => {
                    this.VSO().comunicationData.remoteIceCandidates.push(iceCandidate);
                });
                const candidate = new RTCIceCandidate(data.answer_candidate[0]);
                this.VSO().answerDescription = data.answer_candidate;
                this.VSO().connection.addIceCandidate(candidate);
            }
        }
    }
    async #insertAnswerIceCandidateInDatabase(iceCandidate) {
        let data = await this.ajaxCall.videoCall.insertAnswerIceCandidates(
            {
                callDocumentId: this.comunicationData.callId,
                candidate: JSON.stringify(iceCandidate),
                '_token': this.csrf_token,
            });
    }
    async #getOfferDescription() {
        let data = await this.ajaxCall.videoCall.getOfferDescription(
            {
                callDocumentId: this.comunicationData.callId,
                '_token': this.csrf_token
            }
        )
        if (data.status) {
            return data.offer;
        }

    }
    async #insertAnswerDescriptionOnDatabase(answerDescription) {
        let data = await this.ajaxCall.videoCall.setAnswerDescription(
            {
                callDocumentId: this.comunicationData.callId,
                userAnswerDescription: JSON.stringify(answerDescription),
                '_token': this.csrf_token
            }
        );
        if (data.status) {
            return data.offer;
        }
    }
    async answer(_callId) {
        this.comunicationData.callId = _callId;
        this.connection.onicecandidate = event => {
            if (event.candidate) {
                this.comunicationData.localIceCandidates.push(event.candidate.toJSON());
                this.#insertAnswerIceCandidateInDatabase(event.candidate);
            }
        };
        let offerDescription = await this.#getOfferDescription();
        this.connection.setRemoteDescription(JSON.parse(offerDescription));
        let answerDescription = await this.connection.createAnswer();
        this.connection.setLocalDescription(answerDescription);
        this.#insertAnswerDescriptionOnDatabase(answerDescription);
        this.timers.tmrOfferCandidate = new Timer("tmrOfferCandidate", this.#checkNewOfferCandidates, 3, false);
        this.timers.tmrOfferCandidate.VSO = () => {return this};
        this.timers.tmrOfferCandidate.start();
        this.#listenToRemoteStream();
    }
}
