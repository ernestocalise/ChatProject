@extends('layouts.empty')
@section('head')
<!-- HTML in your document's head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
@stop
@section('content')
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
<link rel="stylesheet" href="/css/view/chat/videocall.css">
<div class="csrf-container">
@csrf
</div>
<!-- SECTION PAGE SETUP -->
<input type="hidden" id="fromPhpPage" />
<input type="hidden" id="fromPhpLocale" />
<script>
    	var phpPageData;
	var phpLocaleData;
	function setPageData() {
	phpPageData = {
		personalUserId: {{auth()->user()->id}},
		initialUserStatus: {{auth()->user()->getStatus()}},
		token: "{{$objToken->token}}",
		channelName: "{{$objToken->channelName}}",
		app_id: "{{$objToken->app_id}}",
		start_date: "{{$objConference->start_date}}",
		chat_name: "{{$objConference->chat_name}}"
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
	document.onLoad += setTimeout(setPageData, 100);
</script>
<body>
	<div class="container">
		<div class="grid-container">
			<div id="header">
				<p id="timeSpan">00:00:00</p>
				<p id="chatName">Videochiamata di Test</p>
				<div>
					<button id="leave-btn">Abbandona</button>
				</div>
			</div>
			<div id="main">
				<div id="prejoin">
					<div id="prejoin-configuration">
						<div id="webcamContainer">
							<label for="webcams">{{__("Stato Webcam")}}
								<label class="switch">
									<input type="checkbox" id="chkWebcams">
									<span class="slider round"></span>
							  	</label>
							</label>
								<div class="select-container">
									<select id="webcams" name="webcams" class="select-box">
									</select>
									<div class="icon-container">
										<span class="material-symbols-outlined">
											keyboard_arrow_down
											</span>
									</div>
								</div>
								<div class="option-container">
									<label class="checkbox-label">
										<input type="checkbox" name="chkWebcamOptimizationMode" id="chkWebcamOptimizationMode" >
										Optimization Mode</label>

								</div>
						</div>

						</label>
						<div id="microphoneContainer">
							<label for="microphones">{{__("Stato Microfono")}}
								<label class="switch">
									<input type="checkbox" id="chkMicrophones" checked>
									<span class="slider round"></span>
							  	</label>
							</label>
							<div class="select-container">
								<select id="microphones" name="microphones" class="select-box">
								</select>
								<div class="icon-container">
									<span class="material-symbols-outlined">
										keyboard_arrow_down
										</span>
								</div>
							</div>
							<div class="option-container">
								<label class="checkbox-label"><input type="checkbox" name="chkAcousticEchoCancellation" id="chkAcousticEchoCancellation" >AcousticEchoCancellation</label>
								<label class="checkbox-label"><input type="checkbox" name="chkAudioGainControl" id="chkAudioGainControl" >AudioGainControl</label>
								<label class="checkbox-label"><input type="checkbox" name="chkAutomaticNoiseSuppression" id="chkAutomaticNoiseSuppression" >AutomaticNoiseSuppression</label>

							</div>
						</div>
						<div id="speakerContainer">
							<label for="speakers">{{__("Seleziona Dispositivo di output")}}
							</label>
								<div class="select-container">
									<select id="speakers" name="speakers" class="select-box">
									</select>
									<div class="icon-container">
										<span class="material-symbols-outlined">
											keyboard_arrow_down
											</span>
									</div>
								</div>
						</div>

					</div>
					<div id="prejoin-btnContainer">
						<button class="prejoin-btn" id="join-btn">Unisciti</button>
					</div>
					<div id="settings-btnContainer" style="display:none">
						<button class="prejoin-btn" id="btnSaveSettings">Salva Modifiche</button>
						<button class="prejoin-btn" id="btnCancelSettings">Annulla</button>
					</div>
				</div>
				<div id="stream-wrapper">
					<div id="video-streams"></div>
			

				</div>
			</div>
			<div id="footer">
				<div id="stream-controls">
					<button id="mic-btn">
						<span class="material-symbols-outlined">
							mic
						</span>
						</button>
					<button id="camera-btn">
						<span class="material-symbols-outlined">
							videocam
						</span>
					</button>
					<button id="screen-btn">
						<span class="material-symbols-outlined">
							screen_share
						</span>
					</button>
					<button id="settings-btn">
						<span class="material-symbols-outlined">
							settings
							</span>
					</button>
				</div>
			</div>
			
		</div>
	</div>

    
</body>
<!-- <script src="https://download.agora.io/sdk/release/AgoraRTC_N.js"></script> -->
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.22.1.js"></script>
<script type="module" src="/scripts/view/videocall.js"></script>
</html>
@stop