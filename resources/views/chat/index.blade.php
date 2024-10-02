@extends('layouts.app')
@section('content')
<link rel="stylesheet" href="chat.css">
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
				<i class="fa fa-chevron-down expand-button" id="#btnStatus"></i>
				<div id="status-options">
					<ul>
						<li id="status-online" class="active"><span class="status-circle"></span> <p>Online</p></li>
						<li id="status-away" ><span class="status-circle"></span> <p>Away</p></li>
						<li id="status-busy" ><span class="status-circle"></span> <p>Busy</p></li>
						<li id="status-invisible" ><span class="status-circle"></span> <p>Invisible</p></li>
						<li id="status-reset"><span class="status-circle"></span> <p>Reset</p></li>
					</ul>
				</div>
				<div id="expanded">
					<label for="twitter"><i class="fa fa-facebook fa-fw" aria-hidden="true"></i></label>
					<input name="twitter" type="text" value="mikeross" />
					<label for="twitter"><i class="fa fa-twitter fa-fw" aria-hidden="true"></i></label>
					<input name="twitter" type="text" value="ross81" />
					<label for="twitter"><i class="fa fa-instagram fa-fw" aria-hidden="true"></i></label>
					<input name="twitter" type="text" value="mike.ross" />
				</div>
			</div>
		</div>
		<div id="search">
			<label for=""><i class="fa fa-search" aria-hidden="true"></i></label>
			<input type="text" placeholder="Search contacts..." />
		</div>
		<div id="contacts">
			<ul class="list-unstyled" id="chatContainer">
			</ul>
            <ul class="list-unstyled" id="contactContainer">
                @foreach($users as $user)
                    <li class="contact" id="{{$user->id}}">
                        <div class="wrap">
                            <span class="contact-status online"></span>
                            <img src="https://ui-avatars.com/api/?name={{$user->name}}" alt="" />
                            <div class="meta" id="{{$user->id}}">
                                <p class="name">{{$user->name}}</p>
                                <p class="preview">Programmer</p>
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
			<a id="btnStartCall"><i class="fa-solid fa-phone"></i></a>
			<i class="fa-solid fa-video"></i>
			<i class="fa-solid fa-bars-staggered"></i>
			</div>
		</div>
		<div class="messages" id="messageTarget">
			<ul>
			</ul>
		</div>
		<div class="message-input">
			<div class="wrap">
			<input type="text" placeholder="Write your message..." id="txtMessage"/>
			<i class="fa fa-paperclip attachment" id="btnFileUpload" aria-hidden="true"></i>
			<button class="submit" id="btnSendMessage"><i class="fa fa-paper-plane" aria-hidden="true" ></i></button>
			</div>
		</div>
	</div>
</div>
<form method="POST" action="#" enctype="multipart/form-data" id="fileUploader">
        <input id="iptFileUpload" type="file" accept="image/*, .zip, .rar, .pdf, .doc, .txt" name="iptFileUpload">
    </form>

<script type="module" src="/scripts/view/chat.js"></script>
@stop