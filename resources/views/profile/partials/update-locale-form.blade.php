<section class="space-y-6">
    <header>
        <h2 class="text-lg font-medium text-gray-900">
            {{ __('Update Language') }}
        </h2>

        <p class="mt-1 text-sm text-gray-600">
            {{ __('There you can set the language for the application.') }}
        </p>

        </header>
        <form method="post" action="{{ route('setLocale') }}" class="mt-6 space-y-6">
            @csrf
            <div>
                <x-input-label for="locale" :value="__('settings.locale')" />
                <select id="locale" name="locale" :value="old('locale', $user->locale)" class="bg-gray-50 border text-gray-900 text-sm p-2.5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" required autofocus autocomplete="off">
                    <option value="it" {{ old('locale', auth()->user()->locale) == "it" ? 'selected' : null}}>Italiano</option>
                    <option value="en" {{ old('locale', auth()->user()->locale) == "en" ? 'selected' : null}}>Inglese</option>
                </select>

            </div>


            <div class="flex items-center gap-4">
                    <x-primary-button>{{ __('Save') }}</x-primary-button>

                    @if (session('status') === 'locale-updated')
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
