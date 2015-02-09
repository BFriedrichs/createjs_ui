(function() {
    "use strict";

    /**
     * basic application stub you can use to create an easy application.
     * Assumes you want to update the stage at 30 fps, listen to resize 
     * events of the browser window and (if you want a mobile )
     * and mousewheel events 
     * @param stage
     * @param mobile
     * @constructor
     */
    var Application = function (stage, mobile) {
        console.log('a');
        createjs.Container.call(this);
        this._stage = stage;
        this.mobile = !!mobile; // we assume desktop browser as default

        stage.addChild(this);
        this.init();
    };
    
    var p = createjs.extend(Application, createjs.Container);

    p.tick = function (event) {
        this._stage.update(event);
    };

    /**
     * add touch events, set fps to 30 and enable mouseover, mousewheel and 
     * resize, not in the constructor but as own function so it can be called
     * after destroy to reinitialize the application
     */
    p.init = function() {
        // there can be multi-touch on a non-mobile device, so we activate it
        createjs.Touch.enable(this._stage);
        createjs.Ticker.setFPS(30);
        this._tickHandler = createjs.proxy(this.tick, this);
        createjs.Ticker.addEventListener("tick", this._tickHandler);

        // we do not need mouseover or wheel on mobile devices
        if (!this.mobile) {
            // enabled mouse over / out events
            this._stage.enableMouseOver(10);
            // keep tracking the mouse even when it leaves the canvas
            this._stage.mouseMoveOutside = true;

            // enable mouse wheel support for the stage
            // (will be ignored outside the canvas)
            createjs_ui.mouseWheelSupport(this._stage);
            console.log("enabled wheel support")
        }
        // listen to resize event
        createjs_ui.resizeSupport(this._stage);

        console.log("init done")
    };

    /**
     * do the opposite of init:
     * remove touch events, disable mouseover, mousewheel and resize
     */
    p.destroy = function() {
        createjs.Touch.disable(this._stage);
        createjs.Ticker.removeEventListener("tick", this._tickHandler);
        if (!this.mobile) {
            // disable MouseOver by passing a frequency of 0
            this._stage.enableMouseOver(0);
            // do not track mouse outside of canvas
            this._stage.mouseMoveOutside = false;
            createjs_ui.mouseWheelSupport(this._stage, false);
        }
        createjs_ui.resizeSupport(this._stage, false);
    };
    
    p._getWidth = function() {
        return this._stage.canvas.width;
    };

    p._getHeight = function() {
        return this._stage.canvas.height;
    };

    Object.defineProperties(p, {
        width: {
            get: p._getWidth
        },
        height: {
            get: p._getHeight
        }
    });
    
    createjs_ui.Application = Application;
})();