<link rel="stylesheet" href="/css/view/chat/chat.css">
<div class="csrf-container">
    @csrf
    </div>
<div class="chat-container" id="chat-container">

    <div class="chat-container-dialog-box-container" id="chat-container-dialog-box-container">
        <div class="chat-container-dialog-box" id="chat-container-dialog-box">
            <input type="text" class="chat-container-dialog-box-textbox" name="chat-container-dialog-box-textbox-chat-name" id="chat-container-dialog-box-textbox-chat-name" placeholder="Inserisci il nome della chat">
            <input type="text" class="chat-container-dialog-box-textbox" name="chat-container-dialog-box-search-box" id="chat-container-dialog-box-search-box" placeholder="Cerca..">
            <div class="chat-container-dialog-box-search-result" id="chat-container-dialog-box-search-result">

            </div>
        </div>
    </div>

    <div class="search-bar-container" id="search-bar-container">
        <input type="text" name="chat-container-search-bar" id="chat-container-search-bar" placeholder="{{__("Cerca una chat..")}}">
        <span class="material-symbols-outlined" class="chat-container-search-bar-container-btnAdd" id="chat-container-search-bar-container-btnAdd">
            add
            </span>
    </div>
    <div class="topbar" id="chat-container-topbar">
        <div class="profile-information">
            <img src="https://thispersondoesnotexist.com/" class="profile-information-image" id="chat-container-topbar-chat-image"/>
            <span id="chat-container-topbar-chat-name">Username</span>
        </div>
        <div class="action-container" id="chat-container-action-container">
            <a class="chat-container-topbar-action" id="chat-container-topbar-action-call">
                <span class="material-symbols-outlined">
                call
                </span>
                <div class="tooltip bottom">
                    <p>{{ __('Chiama') }}</p>
                </div>
            </a>
            <input type="text" name="chat-container-topbar-textbox" id="chat-container-topbar-search-bar" placeholder="{{__("Cerca nella chat..")}}">
            <a class="chat-container-topbar-action" id="chat-container-topbar-action-details"><span class="material-symbols-outlined">
                person
                </span>
                <div class="tooltip bottom">
                    <p>{{ __('Informazioni ') }}</p>
                </div>
            </a>
        </div>
    </div>
    <div class="userlist-container" id="chat-container-userlist-container">
        
    </div>
    <div class="main-container" id="chatbox-main-container">
        <div class="main-container-content">
            <div class="main-container-content-chat-container" id="main-container-content-chat-container">
                <!--
                <div class="chat-container-main-container-chat-message">
                    <div class="profileInfo profileInfoShow">
                        <img src="https://thispersondoesnotexist.com/" alt="" class="chat-container-userlist-chatbox-image">
                        <span>Ernesto Calise</span>
                    </div>
                    <span> Terzo Messaggio</span>
                </div> -->
            </div>
            <div class="main-container-content-bottombar">
                <input type="text" name="main-container-content-bottombar-textbox" id="main-container-bottombar-textbox" placeholder="{{__("Digita Un Messaggio")}}" />
                <span class="material-symbols-outlined" id="main-container-bottombar-btn-send">
                    send
                    </span>
            </div>
        </div>
        <div class="main-container-sidebar" id="chat-container-main-container-sidebar">
            <div class="chat-container-sidebar-image-container">
                <img src="https://picsum.photos/300/200" alt="" class="chat-container-main-container-sidebar-panorama-image" id="chat-container-main-container-sidebar-panorama-image">
                <img src="https://thispersondoesnotexist.com/" alt="" class="chat-container-main-container-sidebar-profile-image" id="chat-container-main-container-sidebar-profile-image">
            </div>
            <div class="chat-container-sidebar-text-container" id="chat-container-sidebar-text-container">
                <h2 id="chat-container-sidebar-text-container-profile-name"> Carlo Piero </h2>
                <span id="chat-container-sidebar-text-container-skill-description">Programmatore</span>
                <h3>{{__("Lavorando su")}} <a href="#" id="chat-container-sidebar-text-container-job-description">Test</a></h3>
            </div>
        </div>
    </div>
</div>
<script src="/scripts/view/newchat.js" type="module"></script>