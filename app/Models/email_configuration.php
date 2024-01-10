<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
class email_configuration extends Model
{
    use HasFactory;

    public function getUsername(){
        return  Crypt::decryptString($this->username);
    }
    public function setUsername($username){
        $this->username = Crypt::encryptString($username);
    }
    public function setPassword($password) {
        $this->password = Crypt::encryptString($password);
    }
    public function getPassword(){
        return  Crypt::decryptString($this->password);
    }
}
