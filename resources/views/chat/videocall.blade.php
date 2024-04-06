<link rel="stylesheet" href="/chat.css">
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
		stunServerConfiguration: JSON.parse({!!$stunServerConfiguration!!})
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
<div class="videos" id="videoContainer">
        <span>
            <h3>Local</h3>
            <video id="localVideo" autoplay playsinline></video>
        </span>
        <span>
            <h3>Remote</h3>
            <video id="remoteVideo" autoplay playsinline></video>
        </span>
    </div>
	
	<button id="createConference" class="btn btn-primary">Send Calls</button>
	<button id="playCallSound" class="btn btn-primary">Play Call Sound</button>
	<input type="text" name="txtCallId" id="txtCallId">
	<button id="answerCall" class="btn btn-primary">Answer Call</button>
</div>

</x-app-layout>
<style>
  .btn {
    @apply font-bold py-2 px-4 rounded;
  }
  .btn-primary {
    @apply bg-blue-500 text-white;
  }
  .btn-primary:hover {
    @apply bg-blue-700;
  }
</style>
<script type="module" src="/scripts/view/videoCall.js"></script>