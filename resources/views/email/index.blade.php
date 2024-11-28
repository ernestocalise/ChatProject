<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" href="/css/layouts/reset.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
<link rel="stylesheet" href="/css/layouts/color-schemes.css">
<link rel="stylesheet" href="/css/layouts/core.css">
<link rel="stylesheet" href="/css/view/email/email.css">
<meta name="csrf-token" content="{{ csrf_token() }}">
<div class="csrf-container">
    @csrf
    </div>
<div class="email-container" id="email-container">
    <div class="email-container-loader-container" id="email-container-loader-container">
    <span class="material-symbols-outlined" id="email-container-email-spinner">
        sync
    </span>
    <div class="email-container-overlay-dialog-box" id="email-container-overlay-dialog-box">
        <h1>Invalid Mail Configuration, update Mail Configuration in settings.</h1>
    </div>
    </div>
    <div class="mailbox-container" id="email-container-mailbox-container">
        <button class="mailbox-container-btn-create" id="mailbox-container-btn-create">
            <span class="material-symbols-outlined">
                edit
            </span>
            Scrivi
        </button>
            <ul class="mailbox-link-container" id="mailbox-link-container">
                
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
                <div class="main-container-commandBar-mailList" id="email-container-main-container-commandBar-mailList">
                    <input type="checkbox" name="" id="">
                    <a href="#" id="email-container-main-container-commandBar-mailList-btnRefresh"><span class="material-symbols-outlined">
                        refresh
                        </span></a>
                </div>
                <div class="main-container-commandBar-openMail" id="email-container-main-container-commandBar-openMail">
                <a href="#" id="email-container-main-container-commandBar-openMail-btnBack">
                    <span class="material-symbols-outlined">
                        arrow_back
                    </span>
                </a>
                </div>
            </div>
            <div class="main-container-commandBar-right">
                <span id="email-container-main-container-commandBar-mailCount">1-50 di 2700</span>
                <a href="#" id="email-container-main-container-commandBar-btnBack"><span class="material-symbols-outlined">
                    arrow_back_ios
                    </span></a>
                <a href="#" id="email-container-main-container-commandBar-btnForward"><span class="material-symbols-outlined">
                        arrow_forward_ios
                        </span></a>
            </div>
        </div>
        <div class="main-container-mail-list-container" id="email-container-main-container-mail-list-container">
            <ul class="main-container-mail-list" id="email-container-main-container-mail-list">

            </ul>
        </div>
        <div class="main-container-email-container" id="email-container-main-container-email-container">
            <div class="main-container-email-container-header">
                <h2 id="mail-container-email-container-header-subject">Con A/R Magic viaggi con sconti fino al -60%!</h2>
                <div class="main-container-email-container-recipients">
                    <div class="main-container-email-container-recipients-image-container"><img id="mail-container-email-container-header-image" src="https://ui-avatars.com/api/?name=ITALO"></div>
                    <div class="main-container-email-container-recipients-text-container">
                        <span id="mail-container-email-container-header-from">Da: <b>ITALO<italo@mailing.italotreno.it></b></span>
                        <span id="mail-container-email-container-header-to">A: 	ernestocalise1999@gmail.com</span>
                        <span id="mail-container-email-container-header-cc">CC: m.grasso@3em.it</span>
                        <span id="mail-container-email-container-header-ccn">CCN: f.scarmozzino@3em.it</span>
                        <span id="mail-container-email-container-header-timestamp">Data: 	5 nov 2024, 17:24</span>
                    </div>
                </div>
            </div>
            <iframe src="" frameborder="0" id="email-container-main-container-email-container-iframe"></iframe>
        </div>
    </div>
</div>
<input type="hidden" id="hidden-components-data" value="" />
<script>
        var dataForComponents = {
        user: {
            userId: {{auth()->user()->id}},
            status: {{auth()->user()->getStatus()}},
            isMailConfigurationValid: JSON.parse(`{!!auth()->user()->profile->isMailConfigurationValid()!!}`)
        }
    }
    let dataForComponents_Value = JSON.stringify(dataForComponents);
    document.getElementById("hidden-components-data").value =dataForComponents_Value;

</script>
<script src="/scripts/view/newemail.js" type="module"></script>