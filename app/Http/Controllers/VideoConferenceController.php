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
            ->where("created_at", ">", Carbon::now()->subSecond(30))->get();

        return (object)[
            "status" => $soundCallsExists,
            "data" => $soundCalls
        ];
    }

    //Starting a call
 

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
