<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conference;
use App\Models\VideochatDocument;
use App\Models\VideoChatOfferIceCandidates;
use App\Models\VideoChatAnswerIceCandidates;
use App\Models\User;
use Illuminate\Support\Facades\Http;
class VideoConferenceController extends Controller
{
    public static function retriveStunServerConfiguration(){
        $apiKey =  VideoConferenceController::RetriveMeteredApiKey();
        $res = Http::get('https://chatapplication.metered.live/api/v1/turn/credentials?apiKey='.$apiKey);
        return $res->body();
    }
    public function index () {
        $users = User::all()->except(array(auth()->user()->id, 0));
        $stunServerConfiguration = json_encode(VideoConferenceController::retriveStunServerConfiguration());
         return view("chat.videocall", compact("users", "stunServerConfiguration"));
    }
    public static function RetriveMeteredApiKey() {
        return config("application-cluster.metered_api_key");
    }
    public function StartVideoConference (Request $request) {
        $data = $request->validate([
            "userIdCollection" => "string|required"
        ]);
        $userIdCollection = json_decode($data["userIdCollection"]);
        $conf = new Conference();
         $conf->save();
         foreach($userIdCollection as $userId) {
            $conf->addParticipant($userId);
         }
         return (object) [
            "status" => true,
            "conferenceId" => $conf->id
         ];
    }

    //Starting a call
    public function CreateCallDocument (Request $request) {
        $data = $request->validate([
            "offerDescription" => "string|required",
            "conference_id" => "numeric|required"
        ]);
        $offerDescription = $data["offerDescription"];
        $conference_id = $data["conference_id"];
         $doc = new VideochatDocument();
         $doc->offer_candidates = $offerDescription;
         $doc->conference_id = $conference_id;
         $doc->save();
         return (object)[
            "documentId" => $doc->id,
            "status" => true
         ];
    }

    public function InsertOfferIceCandidates (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "candidate" => "string|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $candidate = $data["candidate"];
        $offer = new VideoChatOfferIceCandidates();
        $offer->candidate = $candidate;
        $offer->videochat_document_id = $callDocumentId;
        $offer->save();
        return (object)[
            "status" => true
        ];
    }

    public function CheckAnswerDescriptionChanges (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userAnswerDescription" => "string"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userAnswerDescription = $data["userAnswerDescription"] ?? null;
        $doc = VideochatDocument::find($callDocumentId);
        if($doc->answer_candidates != $userAnswerDescription) {
            return (object)[
                "changed"  => true,
                "answer_candidate" => $doc->answer_candidate
            ];
        }
        return (object)[
            "changed" => false
        ];
    }

    public function CheckNewAnswerIceCandidates (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userIceCandidateCount" => "numeric|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userIceCandidateCount = $data["userIceCandidateCount"];
        $doc = VideochatDocument::find($callDocumentId);
        $ic = $doc->AnswerIceCandidates;
        $arrOutput = [];
        if($ic->count() > $userIceCandidateCount) {
            $userIceCandidateCount-=1;
            for($i = 0; $i<= $userIceCandidateCount; $i++){
                $arrOutput[]=$userIceCandidate->candidate;
            }
        }
        return (object)[
            "status" => (count($arrOutput) > 0),
            "iceCandidates" => $arrOutput
        ];
    }

    //Answering a call
    public function GetOfferDescription (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $doc = VideochatDocument::find($callDocumentId);
        $offerDescription = $doc->offer_candidates;
        return (object) [
            "status" => true,
            "offer" => $offerDescription
        ];
    }

    public function InsertAnswerIceCandidates (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "candidate" => "string|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $candidate = $data["candidate"];
        $offer = new VideoChatAnswerIceCandidates();
        $offer->candidate = $candidate;
        $offer->videochat_document_id = $callDocumentId;
        $offer->save();
        return (object)[
            "status" => true
        ];
    }

    public function CheckNewOfferIceCandidates (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userIceCandidateCount" => "numeric|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userIceCandidateCount = $data["userIceCandidateCount"];
        $doc = VideochatDocument::find($callDocumentId);
        $ic = $doc->OfferIceCandidates;
        $arrOutput = [];
        if($ic->count() > $userIceCandidateCount) {
            $userIceCandidateCount-=1;
            for($i = 0; $i<= $userIceCandidateCount; $i++){
                $arrOutput[]=$userIceCandidate->candidate;
            }
        }
        return (object)[
            "status" => (count($arrOutput) > 0),
            "data" => $arrOutput
        ];
    }

    public function SetAnswerDescription (Request $request) {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userAnswerDescription" => "string|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userAnswerDescription = $data["userAnswerDescription"];
        $doc = VideochatDocument::find($callDocumentId);
        $doc->answer_candidates = $userAnswerDescription;
        $doc->save();
        return (object) [
            "status" => true
        ];
    }

    public function CreateConference (Request $request) {
        $data = $request->validate([
            "userIds" => "required",
        ]);
        $userIds = $data["userIds"];
        $conference = new Conference();
        $conference->user_id = auth()->user()->id;
        $conference->save();
        foreach($userIds as $userId) {
            $conference->addParticipant($userId);
        }
        return (object)[
            "status" => true,
            "conference_id" => $conference->id
        ];
    }
}
