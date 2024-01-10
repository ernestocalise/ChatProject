<link rel="stylesheet" href="chat.css">
<x-app-layout>
<div class="csrf-container">
@csrf
</div>
<!-- SECTION PAGE SETUP -->
<input type="hidden" id="fromPhpPage" />
<input type="hidden" id="fromPhpLocale" />
<script>
//Setup for JS page
	var phpPageData;
	var phpLocaleData;
	function setPageData() {
	phpPageData = {
		personalUserId: {{auth()->user()->id}},
		initialUserStatus: {{auth()->user()->getStatus()}},
		hostname: `{{$hostname}}`
	};
	phpLocaleData = {
		"show_contact": `{{__("chat.show_contact")}}`,
		"show_chats": `{{__("chat.show_chats")}}`,
		"You": `{{__("chat.You")}}`,
		"status-online" : `{{__("chat.status-online")}}`,
    	"status-away" : `{{__("chat.status-away")}}`,
    	"status-call" : `{{__("chat.status-call")}}`,
    	"status-busy" : `{{__("chat.status-busy")}}`,
    	"status-invisible" : `{{__("chat.status-invisible")}}`,
    	"status-offline" : `{{__("chat.status-offline")}}`,
	};
	let fromPhpPageValue = JSON.stringify(phpPageData);
	$("#fromPhpPage").val(fromPhpPageValue);
	let fromPhpLocaleValue = JSON.stringify(phpLocaleData)
	$("#fromPhpLocale").val(fromPhpLocaleValue);
	phpPageData = undefined;
	phpLocaleData = undefined;
	setPageData = undefined;
	}
	setTimeout(setPageData, 100);
</script>
<div id="frame">
	<div id="sidepanel">
		<div id="profile">
			<div class="wrap">
				<img id="profile-img" src="{{auth()->user()->profileImage()}}" class="" alt="" />
				<p>{{auth()->user()->name}}</p>
				<span>&lt;{{auth()->user()->profile->EmailConfiguration->getUsername()}}&gt;</span>
			</div>
		</div>
		<div id="search">
			<label for=""><i class="fa fa-search" aria-hidden="true"></i></label>
			<input type="text" placeholder="Search contacts..." />
		</div>
		<div id="contacts">
			<ul class="list-unstyled" id="emailContainer">
			</ul>
            <ul class="list-unstyled" id="contactContainer">
                @foreach($users as $user)
                    <li class="contact" id="{{$user->id}}">
                        <div class="wrap">
                            <span class="contact-status online"></span>
                            <img src="https://ui-avatars.com/api/?name={{$user->name}}" alt="" />
                            <div class="meta" id="{{$user->id}}">
                                <p class="name">{{$user->name}}</p>
                                <p class="preview">{{$user->profile->EmailConfiguration ?? $user->email}}</p>
                            </div>
                        </div>
                    </li>
                @endforeach

            </ul>
		</div>
		<div id="bottom-bar">
			<button id="addcontact"><i class="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Contatti</span></button>
			<button id="settings"><i class="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span></button>
		</div>
	</div>
	<div class="content">
		<div class="contact-profile">
			<img src="" alt="" />
			<p></p>
			<div class="social-media">
			<i class="fa-solid fa-phone"></i>
			<i class="fa-solid fa-video"></i>
			<i class="fa-solid fa-bars-staggered"></i>
			</div>
		</div>
		<div class="messages" id="emailTarget">
			
		</div>
		<div class="message-input">
			<div class="wrap">
			<input type="text" placeholder="Write your message..." id="txtMessage"/>
			<i class="fa fa-paperclip attachment" id="btnFileUpload" aria-hidden="true"></i>
			<button class="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
			</div>
		</div>
	</div>
</div>
</x-app-layout>
<form method="POST" action="#" enctype="multipart/form-data" id="fileUploader">
        <input id="iptFileUpload" type="file" accept="image/*, .zip, .rar, .pdf, .doc, .txt" name="iptFileUpload">
    </form>

<script type="module" src="/scripts/view/email.js"></script>