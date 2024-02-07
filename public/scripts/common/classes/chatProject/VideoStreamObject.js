import { Timer } from "./../timer.js";
import { ajaxCall } from "../../ajaxCalls.js";
export class VideoStreamObject {
    constructor(remoteVideoSelector, stunServerConfiguration, callerId, targetId) {
        this.remoteVideoObject = document.getElementById(remoteVideoSelector);
        this.comunicationData = {
            stunServers: stunServerConfiguration,
            localIceCandidates: [],
            remoteIceCandidates: [],
            answerDescription: null,
            callId: 0,
            conferenceId: 0
        },
        this.callerId = callerId;
        this.targetId = targetId;
            this.connection = new RTCPeerConnection(this.comunicationData.stunServers);
        this.timers = {
            tmrAnswerDescription: null,
            tmrAnswerCandidate: null,
            tmrOfferCandidate: null
        }
        this.localStream = new MediaStream();
        this.csrf_token = "";
        this.ajaxCall = ajaxCall();
    }

    async #listenToRemoteStream() {
        this.connection.addEventListener('track', async (event) => {
            this.remoteStream = event.streams;
            this.remoteVideoObject.srcObject = this.remoteStream;
        });
    }
    //SetupConference


    //Setup a call
    async #createCallDocument(CallObject, videoConferenceId) {
        let callDocumentData = await this.ajaxCall.videoCall.createCallDocument(
            {
                offerDescription: CallObject,
                conference_id: videoConferenceId,
                callerId: this.callerId,
                targetId: this.targetId,
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
    async call(videoConferenceId) {
        const offerDescription = await this.connection.createOffer();
        this.connection.onicecandidate = event => {
            if (event.candidate) {
                this.comunicationData.localIceCandidates.push(event.candidate.toJSON());
                this.#insertOfferIceCandidateInDatabase(event.candidate);
            }
        };
        let offer = JSON.stringify(offerDescription);
        await this.#createCallDocument(offer, videoConferenceId);
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
