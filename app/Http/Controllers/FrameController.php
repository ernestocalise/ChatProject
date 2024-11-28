<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FrameController extends Controller
{
    public function FrameChat() {
        return view('chat.chat');
    }
    public function FrameEmail() {
        return view('email.index');
    }
}
