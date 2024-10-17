<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\VideochatDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class Conference extends Model
{
    use HasFactory;
    public function chat () {
         return $this->belongsTo(Chat::class);
    }
    public function videoChatDocuments() {
        return $this->hasMany(VideochatDocument::class);
    }
    public function addParticipant($user_id) {
        DB::table('conference_user')->insert([
            'conference_id' => $this->id,
            'user_id' => $user_id
        ]);
    }
    public function getParticipants() {
            $ConferenceUsers = DB::table('conference_user')
                ->selectRaw('user_id')
                ->where('conference_id', '=', $this->id)
                ->get();
            $userColl = [];
            
            foreach($ConferenceUsers as $id) {
                $userColl[]= User::where('id', '=', $id->user_id)->first();
            }
            return $userColl;
    }
    public function findOrCreateVideoChatDocument($callUserId) {
        $videoChatDocument = VideochatDocument::where("target_id", "=", auth()->user()->id)
        ->where("caller_id", "=", $callUserId)->get();
        if($videoChatDocument->count() > 0) {
            return $videoChatDocument->first();
        } else {
            $videoChatDocument = VideochatDocument::where("target_id", "=", $callUserId)
            ->where("caller_id", "=", auth()->user()->id)->get();
            if($videoChatDocument->count() > 0) {
                return $videoChatDocument->first();
            } else {
                $videoChatDocument = new VideochatDocument();
                $videoChatDocument->caller_id = auth()->user()->id;
                $videoChatDocument->target_id = $callUserId;
                $videoChatDocument->conference_id = $this->id;
                $videoChatDocument->save();
                return $videoChatDocument;
            }
        }
    }
    public function CreateSoundCall () {
        $ConferenceUsers = DB::table('conference_user')
            ->selectRaw('user_id')
            ->where('conference_id', '=', $this->id)
            ->where('user_id', "!=", auth()->user()->id)
            ->get();
    
    foreach($ConferenceUsers as $targetId) {
            $soundCall = new SoundCall();
            $soundCall->setupCall($this->id, auth()->user()->id, $targetId->user_id);
            $soundCall->save();
        }
    }
}
