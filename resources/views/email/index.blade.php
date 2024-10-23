<link rel="stylesheet" href="/css/view/email/email.css">
<div class="csrf-container">
    @csrf
    </div>
    <!-- FOR PROPELY VISUALIZE THE EMAIL JUST USE SHADOW DOM https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM -->
<div class="email-container" id="email-container">
    <div class="mailbox-container" id="email-container-mailbox-container">
        <button class="mailbox-container-btn-create" id="mailbox-container-btn-create">
            <span class="material-symbols-outlined">
                edit
            </span>
            Scrivi
        </button>
            <ul class="mailbox-link-container" id="mailbox-link-container">
                <li class="mailbox-link" id="email-container-mailbox-folder-{id}">
                    <a href="#">
                        <span class="material-symbols-outlined">
                        inbox
                        </span>INBOX</a>
                </li>
                <li>
                    <a href="#">
                        <span class="material-symbols-outlined">
                            outgoing_mail
                            </span>
                        SENT</a>
                </li>
                <li>
                    <a href="#">
                        <span class="material-symbols-outlined">
                            block
                            </span>
                        SPAM</a>
                </li>
                <li>
                    <a href="#">
                        <span class="material-symbols-outlined">
                            delete
                            </span>
                        TRASH</a>
                </li>
            </ul>
    </div>
    <div class="topbar" id="email-container-topbar">
        <div class="search-bar-container" id="search-bar-container">
            <input type="text" name="email-container-search-bar" id="email-container-search-bar" placeholder="{{__("Cerca un email..")}}">
            <span class="material-symbols-outlined email-container-search-bar-container-btnSearch" id="email-container-search-bar-container-btnSearch">
                search
                </span>
        </div>
    </div>
    <div class="main-container" id="mailbox-main-container">
        <div class="main-container-commandBar">
            <div class="main-container-commandBar-left">
                <input type="checkbox" name="" id="">
                <a href="#"><span class="material-symbols-outlined">
                    refresh
                    </span></a>
            </div>
            <div class="main-container-commandBar-right">
                <span>1-50 di 2700</span>
                <a href="#"><span class="material-symbols-outlined">
                    arrow_back_ios
                    </span></a>
                <a href="#"><span class="material-symbols-outlined">
                        arrow_forward_ios
                        </span></a>
            </div>
        </div>
        <div class="main-container-mail-list-container">
            <ul class="main-container-mail-list">
                <li class="main-container-mail-element">
                    <input type="checkbox" class="main-container-mail-element-checkbox" />
                    <span class="material-symbols-outlined mail-container-mail-element-btnFavorite">
                        star
                    </span>
                    <span class="main-container-mail-element-sender">Gameforge</span>
                    <span class="main-container-mail-element-content">
                        <b class="main-container-mail-element-content-subject">OGame: Das „Avatare & Achievements”-Update erwartet dich!</b>
                        Mache dein Spielerprofil einzigartig! Das brandneue Update bringt frischen Wind und
                    </span>
                    <span class="main-container-mail-element-timestamp">
                        17:12                        
                    </span>
                </li>
                <li class="main-container-mail-element">
                    <input type="checkbox" class="main-container-mail-element-checkbox" />
                    <span class="material-symbols-outlined mail-container-mail-element-btnFavorite">
                        star
                    </span>
                    <span class="main-container-mail-element-sender">Gameforge</span>
                    <span class="main-container-mail-element-content">
                        <b class="main-container-mail-element-content-subject">OGame: Das „Avatare & Achievements”-Update erwartet dich!</b>
                        Mache dein Spielerprofil einzigartig! Das brandneue Update bringt frischen Wind und
                    </span>
                    <span class="main-container-mail-element-timestamp">
                        17:12                        
                    </span>
                </li>
                <li class="main-container-mail-element">
                    <input type="checkbox" class="main-container-mail-element-checkbox" />
                    <span class="material-symbols-outlined mail-container-mail-element-btnFavorite">
                        star
                    </span>
                    <span class="main-container-mail-element-sender">Gameforge</span>
                    <span class="main-container-mail-element-content">
                        <b class="main-container-mail-element-content-subject">OGame: Das „Avatare & Achievements”-Update erwartet dich!</b>
                        Mache dein Spielerprofil einzigartig! Das brandneue Update bringt frischen Wind und
                    </span>
                    <span class="main-container-mail-element-timestamp">
                        17:12                        
                    </span>
                </li>
                <li class="main-container-mail-element">
                    <input type="checkbox" class="main-container-mail-element-checkbox" />
                    <span class="material-symbols-outlined mail-container-mail-element-btnFavorite">
                        star
                    </span>
                    <span class="main-container-mail-element-sender">Gameforge</span>
                    <span class="main-container-mail-element-content">
                        <b class="main-container-mail-element-content-subject">OGame: Das „Avatare & Achievements”-Update erwartet dich!</b>
                        Mache dein Spielerprofil einzigartig! Das brandneue Update bringt frischen Wind und
                    </span>
                    <span class="main-container-mail-element-timestamp">
                        17:12                        
                    </span>
                </li>
                
                
            </ul>
        </div>
        <div class="main-container-email-container">

        </div>
    </div>
</div>
<script src="/scripts/view/newemail.js" type="module"></script>