<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\VideochatDocument;
use App\Models\User;

class Conference extends Model
{
    use HasFactory;
    
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
}
