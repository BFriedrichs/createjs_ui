// namespace
this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    var ScrollThumb = function(orientation, theme) {
        this.orientation = orientation || createjs_ui.ScrollBar.HORIZONTAL;
        this.skinName = this.skinName || ScrollThumb.SKIN_NAME;
        this._validStates = ['horizontal_up', 'vertical_up', 'horizontal_down', 'vertical_down', 'horizontal_hover', 'vertical_hover'];
        createjs_ui.Button.call(this, theme);
        this.invalidTrack = true;
    };

    var p = createjs.extend(ScrollThumb, createjs_ui.Button);

    ScrollThumb.SKIN_NAME = "scroll_thumb";

    p._setCurrentState = function(value) {
        value = this.orientation + '_' + value;

        createjs_ui.Button.prototype._setCurrentState.call(this, value);
    };

    p.showTrack = function(skin) {
        if(!this.skin) {
            this.skin = skin;
            this.addChild(skin);
        }
        if(skin.getBounds() ) {
            this.skin.x = (this.width - skin.getBounds().width )/ 2;
            this.skin.y = (this.height - skin.getBounds().height )/ 2;
        }


        this.invalidTrack = false;
    };

    p.redraw = function() {
        createjs_ui.Button.prototype.redraw.call(this);
        if (this.invalidTrack) {
            this.fromSkin(this.orientation+"_thumb", this.showTrack);
        }
    };

    createjs_ui.ScrollThumb = createjs.promote(ScrollThumb, "Button");
})();