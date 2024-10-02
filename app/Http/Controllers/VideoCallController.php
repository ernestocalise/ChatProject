<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Chat;
use App\Models\Conference;
use Illuminate\Http\Request;
use BoogieFromZk\AgoraToken\RtcTokenBuilder2;
use Carbon\Carbon;
use Illuminate\Support\Facades\View;

class VideoCallController extends Controller
{

    protected $layout = "";
    //TokenGeneration
    public function getToken ($channelName) {
         
        $appID = "4de78852bad54011b78f104338d92405";
        $appCertificate = "17f7be0ef5ac4b0da9ddeac0d38f7663";
        $oneDayInSeconds = 60*60*24;
        $expiresInSeconds = $oneDayInSeconds; // For how many seconds this token is kept valid.
        $channelName = $channelName; // Channel name which should be accessible.
        $uid = auth()->user()->id;
        $role = RtcTokenBuilder2::ROLE_PUBLISHER;
        $token = RtcTokenBuilder2::buildTokenWithUid($appID, $appCertificate, $channelName, $uid, $role, $expiresInSeconds);
        return (object)[
            "status" => true,
            "token" => $token,
            "channelName" => $channelName,
            "app_id" => "4de78852bad54011b78f104338d92405"
        ];
        
    }



    public function StartOrJoinCall ($chatId) {
         $conferenceExists = Conference::where(
            "chat_id", $chatId
         )->where("expire_date", ">", Carbon::now())->exists();
         
        if($conferenceExists) {
         $conference = Conference::where(
            "chat_id", $chatId
         )->where("expire_date", ">", Carbon::now())->get();

            return $this->joinCall($conference[0]);
        } else {
            return $this->startCall(Chat::find($chatId));
        }

    }


    public function joinCall(Conference $Conference) {
        $users = $Conference->getParticipants();
        $objToken = $this->getToken("Channel-{$Conference->id}");
        $chat = Chat::where(
            "id", $Conference->chat_id
         )->get()[0];
        $objConference = (object)[
            "start_date" => $Conference->created_at,
            "chat_name" => $chat->description
        ];
        return View::make("chat.webStart", compact("users", "objToken", "objConference"));
    }
    public function startCall(Chat $Chat)
    {

        $users = $Chat->getParticipants();
        $userIdCollection = [];
        foreach($users as $user) {
            $userIdColleciton[]=$user->id;
        }
        $conference = $this->CreateConference($Chat->id, $userIdColleciton);

        $objToken = $this->getToken("Channel-{$conference->id}");
        $objConference = (object)[
            "chat_name" => $Chat->description,
            "start_date" => $conference->created_at
        ];
        return view("chat.webStart", compact("users", "objToken", "objConference"));
    }
    //ConferenceCreation
    public function CreateConference($chatId, $userIdCollection)
    {
        $conference = new Conference();
        $conference->chat_id = $chatId;
        $conference->expire_date = Carbon::now()->addHours(1);
        $conference->save();
        foreach ($userIdCollection as $userId) {
            $conference->addParticipant($userId);
        }
        return $conference;
    }
}
