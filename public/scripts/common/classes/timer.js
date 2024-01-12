export class Timer {
    constructor(name = "", callback,interval = 10, executeOnce = false){
        this._name = name;
        this._callback = callback;
        this._interval = interval;
        this._tickExecuted = 0;
        this.enabled = false;
        this._executeOnce = executeOnce;
    }

    tick() {
        if (this.enabled) {
            if(this._tickExecuted == this._interval){
                try {
                    this._tickExecuted = 0;
                    this._callback();
                    if(this._executeOnce)
                        this.enabled = false;
                } catch (exception) {
                    console.error(exception);
                }
            } else {
                this._tickExecuted+=1;
            }
        }
        setTimeout(() => {
            this.tick();
        }, 1000);
    }
    setCallback(callback) {
        this._callback = callback;
        return this;
    }
    executeOnce(){
        this._executeOnce = true;
        return this;
    }
    start() {
        this.enabled = true;
        this._tickExecuted = 0;
        this._callback();
        this.tick();
    }

    stop() {
        this.enabled = false;
    }
}

