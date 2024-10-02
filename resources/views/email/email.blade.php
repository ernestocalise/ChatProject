@extends('layouts.app')
@section("content")
<link rel="stylesheet" href="css/email.css">
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
			<ul class="list-unstyled" id="folderContainer"></ul>
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
			<button id="btnShowFolders"><i class="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Folders</span></button>
			<button id="btnShowEmails"><i class="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Mails</span></button>
			<button id="btnShowContacts"><i class="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Contacts</span></button>
		</div>
	</div>
	<div class="content">
		<div id="email-object" class="contact-profile">
			<p>Ultima Release LC</p>
			<span id="emailFrom"></br>Da: <a href="mailto:e.calise@3em.it">Ernesto Calise <e.calise@3em.it></a></span>
			<span id="emailTo"></br>A: <a href="mailto:Andrea.Carfizzi@emeal.nttdata.com">Andrea Carfizzi <Andrea.Carfizzi@emeal.nttdata.com></a></span>
			<span id="emailCC"></br>CC: <a href="mailto:Andrea.Carfizzi@emeal.nttdata.com">Andrea Carfizzi <Andrea.Carfizzi@emeal.nttdata.com></a></span>
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
<form method="POST" action="#" enctype="multipart/form-data" id="fileUploader">
        <input id="iptFileUpload" type="file" accept="image/*, .zip, .rar, .pdf, .doc, .txt" name="iptFileUpload">
    </form>

<script type="module" src="/scripts/view/email.js"></script>

@stop