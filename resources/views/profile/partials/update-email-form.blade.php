<section>
    <header>
        <h2 class="text-lg font-medium text-gray-900">
            {{ __('Update Email Information') }}
        </h2>

        <p class="mt-1 text-sm text-gray-600">
            {{ __("Insert your email connection data to allow Email function to start") }}
        </p>
    </header>

    <form id="send-verification" method="post" action="{{ route('verification.send') }}">
        @csrf
    </form>

    <form method="post" action="{{ route('profile.editEmailConfiguration') }}" class="mt-6 space-y-6">
        @csrf
        @method('patch')

        <div>
            <x-input-label for="hostname" :value="__('Hostname')" />
            <x-text-input id="hostname" name="hostname" type="text" class="mt-1 block w-full" :value="old('hostname', $user->profile->emailConfiguration->hostname)" required autofocus autocomplete="hostname" />
            <x-input-error class="mt-2" :messages="$errors->get('hostname')" />
        </div>

        <div>
            <x-input-label for="username" :value="__('Username/Email')" />
            <x-text-input id="username" name="username" type="text" class="mt-1 block w-full" :value="$user->profile->emailConfiguration->getUsername()" required autocomplete="username" />
            <x-input-error class="mt-2" :messages="$errors->get('username')" />

        </div>

        <div>
            <x-input-label for="mailConfigurationPassword" :value="__('Password')" />
            <x-text-input id="mailConfigurationPassword" name="mailConfigurationPassword" type="password" class="mt-1 block w-full" value="" required />
            <x-input-error class="mt-2" :messages="$errors->get('mailConfigurationPassword')" />

        </div>

        <div class="flex items-center gap-4">
            <x-primary-button>{{ __('Save') }}</x-primary-button>

            @if (session('status') === 'email-configuration-updated')
                <p
                    x-data="{ show: true }"
                    x-show="show"
                    x-transition
                    x-init="setTimeout(() => show = false, 2000)"
                    class="text-sm text-gray-600"
                >{{ __('Saved.') }}</p>
            @endif
        </div>
    </form>
</section>
