<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conference;
use App\Models\VideochatDocument;
use App\Models\VideoChatOfferIceCandidates;
use App\Models\VideoChatAnswerIceCandidates;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use App\Models\SoundCall;
use Carbon\Carbon;

class VideoConferenceController extends Controller
{
    //Configuration
    public static function retriveStunServerConfiguration()
    {
        $apiKey =  VideoConferenceController::RetriveMeteredApiKey();
        $res = Http::get('https://chatapplication.metered.live/api/v1/turn/credentials?apiKey=' . $apiKey);
        return $res->body();
    }
    public static function RetriveMeteredApiKey()
    {

        return config("application-cluster.metered_api_key");
    }

    //UI Interface
    public function index()
    {
        $users = User::all()->except(array(auth()->user()->id, 0));
        $stunServerConfiguration = json_encode(VideoConferenceController::retriveStunServerConfiguration());
        return view("chat.videocall", compact("users", "stunServerConfiguration"));
    }

    //Sound Call Related
    public function checkIncomingSoundCall(Request $request)
    {
        $soundCallsExists = SoundCall::where("target_id", auth()->user()->id)
            ->where("hasAnswered", "0")
            ->where("created_at", ">", Carbon::now()->subSecond(30))->exists();
        $soundCalls = SoundCall::where("target_id", auth()->user()->id)
            ->where("hasAnswered", "0")
            ->where("created_at", ">", Carbon::now()->subSecond(30))->get();

        return (object)[
            "status" => $soundCallsExists,
            "data" => $soundCalls
        ];
    }

    //Starting a call
    public function CreateConference(Request $request)
    {
        $data = $request->validate([
            "userIdCollection" => "required",
        ]);
        $userIdCollection = $data["userIdCollection"];
        $conference = new Conference();
        $conference->user_id = auth()->user()->id;
        $conference->save();
        foreach ($userIdCollection as $userId) {
            $conference->addParticipant($userId);
        }
        return (object)[
            "status" => true,
            "conference_id" => $conference->id
        ];
    }
    public function GetConferenceParticipants(Request $request)
    {
        $data = $request->validate([
            "conferenceId" => "required|numeric",
        ]);
        $conference = Conference::findOrFail($data["conferenceId"]);
        return $conference->getParticipants();
    }
    public function CheckVideoDocumentExists(Request $request)
    {
        $videoDocumentExists = false;
        $isTarget = false;
        $videoDocumentId = 0;
        $data = $request->validate([
            "targetId" => "required|numeric",
            "conferenceId" => "required|numeric"
        ]);
        $targetId = $data["targetId"];
        $conferenceId = $data["conferenceId"];
        if (VideochatDocument::where('caller_id', $targetId)
            ->where("target_id", auth()->user()->id)
            ->where("conference_id", $conferenceId)->exists()
        ) {
            $isTarget = true;
            $videoDocumentExists = true;
            $videoDocument = VideochatDocument::where('caller_id', $targetId)
                ->where("target_id", auth()->user()->id)
                ->where("conference_id", $conferenceId)->get();
            $videoDocumentId = $videoDocument[0]->id;
        } else if (VideochatDocument::where('caller_id', auth()->user()->id)
            ->where("target_id", $targetId)
            ->where("conference_id", $conferenceId)->exists()
        ) {
            $isTarget = false;
            $videoDocumentExists = true;
            $videoDocument = VideochatDocument::where('caller_id', auth()->user()->id)
                ->where("target_id", $targetId)
                ->where("conference_id", $conferenceId)->get();
            $videoDocumentId = $videoDocument[0]->id;
        }
        return (object)[
            "DocumentExists" => $videoDocumentExists,
            "IsTarget" => $isTarget,
            "VideoDocumentId" => $videoDocumentId
        ];
    }

    public function CreateSoundCall(Request $request)
    {
        $data = $request->validate([
            "userIdCollection" => "required",
            "conferenceId" => "numeric|required"
        ]);
        $userIdCollection = $data["userIdCollection"];
        $conferenceId = $data["conferenceId"];
        foreach ($userIdCollection as $targetId) {
            $soundCall = new SoundCall();
            $soundCall->setupCall($conferenceId, auth()->user()->id, $targetId);
            $soundCall->save();
        }
    }
    //Starting a call
    public function CreateCallDocument(Request $request)
    {
        $data = $request->validate([
            "offerDescription" => "string|required",
            "conference_id" => "numeric|required",
            "targetId" => "numeric|required"
        ]);
        $offerDescription = $data["offerDescription"];
        $conference_id = $data["conference_id"];
        $doc = new VideochatDocument();
        $doc->offer_candidates = $offerDescription;
        $doc->conference_id = $conference_id;
        $doc->caller_id = auth()->user()->id;
        $doc->target_id = $data["targetId"];
        $doc->save();
        return (object)[
            "documentId" => $doc->id,
            "status" => true
        ];
    }
    public function GetOrCreateCallDocument(Request $request)
    {
        $data = $request->validate([
            "conference_id" => "numeric|required",
            "target_id" => "string|required"
        ]);
        $targetId = auth()->user->id;
        $callerId = $data["target_id"];
        $conferenceId = $data["conference_id"];
        $videoChatDocument = null;
        if (VideochatDocument::where('caller_id', $callerId)
            ->where("target_id", $targetId)
            ->where("conference_id", $conferenceId)->exists()
        ) {
            $videoChatDocument = VideochatDocument::where('caller_id', $callerId)
                ->where("target_id", $targetId)
                ->where("conference_id", $conferenceId)->get();
        } else if (VideochatDocument::where('caller_id', $targetId)
            ->where("target_id", $callerId)
            ->where("conference_id", $conferenceId)->exists()
        ) {
            $videoChatDocument = VideochatDocument::where('caller_id', $targetId)
                ->where("target_id", $callerId)
                ->where("conference_id", $conferenceId)->get();
        } else {
            return (object)[
                "status" => false,
                "caller_id" => 0,
                "target_id" => 0,
                "conference_id" => $conferenceId
            ];
        }
    }
    public function InsertOfferIceCandidates(Request $request)
    {
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
    public function CheckAnswerDescriptionChanges(Request $request)
    {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userAnswerDescription" => "string"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userAnswerDescription = $data["userAnswerDescription"] ?? null;
        $doc = VideochatDocument::find($callDocumentId);
        if ($doc->answer_candidates != $userAnswerDescription) {
            return (object)[
                "changed"  => true,
                "answer_candidate" => $doc->answer_candidates
            ];
        }
        return (object)[
            "changed" => false
        ];
    }
    public function CheckNewAnswerIceCandidates(Request $request)
    {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userIceCandidateCount" => "numeric|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userIceCandidateCount = $data["userIceCandidateCount"];
        $doc = VideochatDocument::find($callDocumentId);
        $userIceCandidate = $doc->AnswerIceCandidates;
        $arrOutput = [];
        if ($userIceCandidate->count() > $userIceCandidateCount) {
            $userIceCandidateCount -= 1;
            for ($i = 0; $i <= $userIceCandidateCount; $i++) {
                $arrOutput[] = $userIceCandidate->candidate;
            }
        }
        return (object)[
            "status" => (count($arrOutput) > 0),
            "iceCandidates" => $arrOutput
        ];
    }
    //Answering a call
    public function GetOfferDescription(Request $request)
    {
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
    public function InsertAnswerIceCandidates(Request $request)
    {
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
    public function CheckNewOfferIceCandidates(Request $request)
    {
        $data = $request->validate([
            "callDocumentId" => "numeric|required",
            "userIceCandidateCount" => "numeric|required"
        ]);
        $callDocumentId = $data["callDocumentId"];
        $userIceCandidateCount = $data["userIceCandidateCount"];
        $doc = VideochatDocument::find($callDocumentId);
        $userIceCandidate = $doc->OfferIceCandidates;
        $arrOutput = [];
        if ($userIceCandidate->count() > $userIceCandidateCount) {
            $userIceCandidateCount -= 1;
            for ($i = 0; $i <= $userIceCandidateCount; $i++) {
                $arrOutput[] = $userIceCandidate->candidate;
            }
        }
        return (object)[
            "status" => (count($arrOutput) > 0),
            "data" => $arrOutput
        ];
    }
    public function SetAnswerDescription(Request $request)
    {
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
    public function GetOrCreateDocumentId(Request $request)
    {
        $data = $request->validate([
            "conference_id" => "numeric|required",
            "target_id" => "numeric|required"
        ]);
        $conferenceId = $data["conference_id"];
        $targetId = $data["target_id"];
        $conference = Conference::findOrFail($conferenceId);
        $callDocument = $conference->findOrCreateVideoChatDocument($targetId);
        
        $_isCaller = $callDocument->caller_id == auth()->user()->id;
        if ($_isCaller) {
            $callDocument->OfferIceCandidates()->delete();
        } else {
            $callDocument->AnswerIceCandidates()->delete();
        }
        return (object)array(
            "documentId" => $callDocument->id,
            "isCaller" => $_isCaller,
            "callerId" => $callDocument->caller_id,
            "targetId" => $callDocument->target_id
        );
    }
}
