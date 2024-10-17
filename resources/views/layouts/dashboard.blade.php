<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @yield('head')
    <title>{{ config('app.name', 'Laravel') }}</title>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="/css/layouts/dashboard.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <script src="scripts/common/layout.js" type="module"></script>
</head>
<body>
<input type="hidden" id="hidden-components-data" value="" />
<div class="layout-menu-bar">
    <div class="itemsContainer">
        <a href="#" class="layout-menu-bar-menu-item layout-menu-bar-menu-item-active">
            <span class="material-symbols-outlined">
                dashboard
            </span>
            <div class="tooltip right">
                <p>{{ __('Dashboard') }}</p>
            </div>
        </a>
        <a href="#" class="layout-menu-bar-menu-item">
            <span class="material-symbols-outlined">
                mail
            </span>
            <div class="tooltip right">
                <p>Email</p>
            </div>
        </a>
        <a href="#" class="layout-menu-bar-menu-item" id="chat-btn">
            <span class="material-symbols-outlined">
                sms
            </span>
            <div class="tooltip right">
                <p>Chat</p>
            </div>
            <div class="notification-bubble">
                12
            </div>
        </a>
        <a href="#" class="layout-menu-bar-menu-item">
            <span class="material-symbols-outlined">
                flight_takeoff
            </span>
            <div class="tooltip right">
                <p>Gestione Trasferte</p>
            </div>
        </a>
    </div>
    <div class="userContainer">
        <a class="layout-menu-bar-menu-item" id="profile-btn" href="#" onclick="">
            <span class="material-symbols-outlined">
                person
            </span>
            <div class="notification-bubble notification-bubble-active status-active" id="layout-notification-bubble-user-status">
            </div>
            <div class="tooltip right">
                <p>{{ __('Profile') }}</p>
            </div>
        </a>
        <form method="POST" action="{{ route('logout') }}">
        @csrf
                <a class="layout-menu-bar-menu-item" id="logout-btn" href="{{ route('logout') }}" onclick="event.preventDefault();
                    this.closest('form').submit();">
                    <span class="material-symbols-outlined">
                        logout
                    </span>
                    <div class="tooltip right">
                        <p>{{ __('Log Out') }}</p>
                    </div>
                </a>
        </form>
    </div>    
    </div>
</div>
<div class="layout-main">
    <div class="layout-panel" id="layout-panel-chat">
         @include("chat.chat")
    </div>
    <div class="layout-panel" id="layout-panel-profile">
         @include('profile.edit')
    </div>
</div>
<div class="layout-panel-incoming-call" id="layout-panel-incoming-call">
    <img src="https://thispersondoesnotexist.com/" class="layout-panel-incoming-call-image" id="layout-panel-incoming-call-image">
    <span class="layout-panel-incoming-call-name" id="layout-panel-incoming-call-name">Claudio</span>
    <div class="layout-panel-incoming-call-btnContainer">
        <button class="layout-panel-incoming-call-btn layout-panel-incoming-call-btnAnswer" id="layout-panel-incoming-call-btnAnswer">
            <span class="material-symbols-outlined">
            call
            </span>
        </button>
        <button class="layout-panel-incoming-call-btn layout-panel-incoming-call-btnCancel" id="layout-panel-incoming-call-btnCancel">
            <span class="material-symbols-outlined">
                call_end
                </span>
        </button>
    </div>
</div>
</body>
<script>
    //Getting PhpVariables to Single Components
    var dataForComponents = {
        user: {
            userId: {{auth()->user()->id}},
            status: {{auth()->user()->getStatus()}},
        }
    }
    let dataForComponents_Value = JSON.stringify(dataForComponents);
    document.getElementById("hidden-components-data").value =dataForComponents_Value 

</script>
<audio controls loop autostart="0" autostart="false" preload="none" id="chatRingSound">
    <source src="/sounds/call.mp3" type="audio/mp3">
</audio>
</html>