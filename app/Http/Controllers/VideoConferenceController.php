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

    //Sound Call Related
    public function checkIncomingSoundCall(Request $request)
    {
        $soundCallsExists = SoundCall::where("target_id", auth()->user()->id)
            ->where("hasAnswered", "0")
            ->where("created_at", ">", Carbon::now()->subSecond(30))->exists();
        $soundCalls = SoundCall::where("target_id", auth()->user()->id)
            ->where("hasAnswered", "0")
            ->where("created_at", ">", Carbon::now()->subSecond(30))
            ->get();
            $soundCallArray = [];
            foreach($soundCalls as $soundCall){
                $soundCallArray[]= $soundCall->getProfileData();
            }
        return (object)[
            "status" => $soundCallsExists,
            "data" => $soundCallArray
        ];
    }

    //Starting a call
    public function setIncomingSoundCallAnswerStatus ($soundCallId, $status) {
        try {
            $soundCall = SoundCall::find($soundCallId);
             $soundCall->hasAnswered = $status;
             $soundCall->save();
             return true;
        } catch (\Exception $e) {
            return false;
        }
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
}
