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
         $this->conferenceId = $conference_id;
         $this->caller_id = $callerId;
         $this->target_id = $targetId;
    }
}
