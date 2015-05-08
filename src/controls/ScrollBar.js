// namespace
this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    var ScrollBar = function(scrollArea, theme) {
        this.scrollArea = scrollArea;
        this.skinName = this.skinName || ScrollBar.SKIN_NAME;
        this.mode = ScrollBar.DESKTOP_MODE;

        if (this.orientation === undefined) {
            this.orientation = ScrollBar.HORIZONTAL;
            if (scrollArea && scrollArea.content &&
                    scrollArea.content.layout.alignment ==
                    createjs_ui.LayoutAlignment.VERTICAL_ALIGNMENT) {
                this.orientation = ScrollBar.VERTICAL;
            }
        }

        createjs_ui.Control.call(this, theme);

        this.thumb = new createjs_ui.ScrollThumb(this.orientation, theme);
        this.addChild(this.thumb);

        this.thumb.on('pressmove', this.handleMove, this);
        this.thumb.on('mousedown', this.handleMouseDown, this);
        this.on("mousewheel", this.handleWheel, this);
        this.on('pressmove', this.handleMouseOnBarDown, this);
        this.on('mousedown', this.handleMouseOnBarDown, this);

        this.invalidTrack = true;
        this.start = [0, 0];

        // # of pixel you scroll at a time (if the event delta is 1 / -1)
        this.scrolldelta = 10;
    };
    
    ScrollBar.SKIN_NAME = "scroll_bar";
    
    ScrollBar.DESKTOP_MODE = "desktop";
    ScrollBar.MOBILE_MODE = "mobile";
    
    ScrollBar.HORIZONTAL = "horizontal";
    ScrollBar.VERTICAL = "vertical";

    var p = createjs.extend(ScrollBar, createjs_ui.Control);


    p.handleMouseOnBarDown = function(e) {
        if(this.thumb != e.target) {
            var x = e.localX;
            var y = e.localY;
            if (this.moveThumb(x, y)) {
                // do not override localX/localY in start
                // if we do not move the thumb
                this.scrollContent(x, y);
                this.start[0] = e.localX;
                this.start[1] = e.localY;
            }
        }

        /*if () {
            this.start = [e.x, e.y];
        }*/
    };

    p.handleMove = function(e) {
        var x = this.thumb.x + e.localX - this.start[0];
        var y = this.thumb.y + e.localY - this.start[1];
        if (this.moveThumb(x, y)) {
            // do not override localX/localY in start
            // if we do not move the thumb
            this.scrollContent(x, y);
            this.start[0] = e.localX;
            this.start[1] = e.localY;
        }
    };

    /**
     * scroll content to position
     */
    p.scrollContent = function(x, y) {
        if (this.scrollArea && this.scrollArea.content) {
            if (this.orientation == ScrollBar.HORIZONTAL) {
                this.scrollArea._scrollContent(
                    -(this.scrollArea.content.width - this.scrollArea.width) *
                        (x / (this.scrollArea.width - this.thumb.width)),
                    0);
            } else {
                this.scrollArea._scrollContent(
                    0,
                    -(this.scrollArea.content.height - this.scrollArea.height) *
                        (y / (this.scrollArea.height - this.thumb.height)));
            }
        }
    };

    p.handleWheel = function (event) {
        if(event.delta) {
            var x = this.thumb.x - event.delta * this.scrolldelta;
            var y = this.thumb.y - event.delta * this.scrolldelta;

            if (this.moveThumb(x, y)) {
                this.scrollContent(x, y);
            }
        }
    };

    /**
     * move the thumb on the scroll bar within its bounds
     * @param x new calculated x position of the thumb
     * @param y new calculated y position of the thumb
     * @returns {boolean} returns true if the position of the thumb has been
     * moved
     */
    p.moveThumb = function(x, y) {
        if(this.orientation == ScrollBar.HORIZONTAL) {
            x = Math.min(x, this.width - this.thumb.width);
            x = Math.max(x, 0);
            if (x != this.thumb.x) {
                this.thumb.x = x;
                return true;
            }
        } else {
            y = Math.min(y, this.height - this.thumb.height);
            y = Math.max(y, 0);
            if (y != this.thumb.y) {
                this.thumb.y = y;
                return true;
            }
        }
        return false;
    };

    p._set_width = function(width) {
        this._width = width;
        if(this.thumb) {
            this.thumb.invalidTrack = true;
        }
        this.invalidTrack = true;
    };

    p._get_width = function() {
        return this._width;
    };

    p._set_height = function(height) {
        this._height = height;
        if(this.thumb) {
            this.thumb.invalidTrack = true;
        }
        this.invalidTrack = true;
    };

    p._get_height = function() {
        return this._height;
    };

    p.handleMouseDown = function(e) {
        this.start[0] = e.localX;
        this.start[1] = e.localY;
    };

    p.showTrack = function(skin) {
        if(!this.skin) {
            this.skin = skin;
            this.addChildAt(this.skin, 0);
        }

        if (this.orientation == ScrollBar.HORIZONTAL) {
            this.skin.width = this.width;
            var center = (this.height - this.thumb.height)/ 2;
            if(center > 0) {
                this.thumb.y = center;
            }
        } else {
            this.skin.height = this.height;
            var center = (this.width - this.thumb.width)/ 2;
            if(center > 0) {
                this.thumb.x = center;
            }
        }

        this.invalidTrack = false;
    };

    p.redraw = function() {
        if (this.invalidTrack && this.thumb) {
            this.fromSkin(this.orientation+"_track", this.showTrack);
            this.thumb.width = this.thumb.width || 20;
            if (this.scrollArea) {
                if (this.orientation == ScrollBar.HORIZONTAL) {
                    this.thumb.width = Math.max(100, this.scrollArea.width / (this.scrollArea.content.width / this.scrollArea.width));
                } else {
                    this.thumb.height = Math.max(50, this.scrollArea.height / (this.scrollArea.content.height / this.scrollArea.height));
                }
            }


            this.invalidTrack = false;
        }
    };

    Object.defineProperties(p, {
        width: {
            set: p._set_width,
            get: p._get_width
        },
        height: {
            set: p._set_height,
            get: p._get_height
        }
    });

    createjs_ui.ScrollBar = createjs.promote(ScrollBar, "Control");
})();