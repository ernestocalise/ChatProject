<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoundCall extends Model
{
    use HasFactory;

    public function conference() {
        return $this->belongsTo(Conference::class);
    }
    public function setupCall ($conferenceId, $callerId, $targetId) {
         $this->conference_id = $conferenceId;
         $this->caller_id = $callerId;
         $this->target_id = $targetId;
    }
    public function getProfileData () {
         
        $chat = $this->conference->chat;
        $chatImage = "";
        $chatName = ""; 
         if($chat->groupChat){
            $chatName = $chat->description;
            $chatImage = "https://ui-avatars.com/api/?name=".$chat->description;
         } else {
            $participants = $chat->getParticipants();
            foreach($participants as $participant) {
                if($participant->id != auth()->user()->id){
                    $chatName = $participant->name;
                    $chatImage = $participant->profile->getProfileImage(); 
                }
            }
         }
         return (object)[
            "sound_call_id" => $this->id,
            "chat_name" => $chatName,
            "chat_image" => $chatImage,
            "chat_id" => $chat->id,
            "conference_id" => $this->conference->id
         ];
    }
}
