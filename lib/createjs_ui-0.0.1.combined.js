

//##############################################################################
// ScaleBitmap.js
//##############################################################################

"use strict";

/*
 * ScaleBitmap
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 * (adaptions for createjs-0.8 and createjs_ui by Andreas Bresser)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


this.createjs_ui = this.createjs_ui||{};

(function() {

    /**
     * A ScaleBitmap represents an Image, Canvas, or Video in the display list and is split into nine separate regions
     * to allow independent scaling of each region. This display object can be used to create scaling UI skins, such as
     * buttons and backgrounds with rounded corners. A ScaleBitmap can be instantiated using an existing HTML element,
     * or a string, similar to a Bitmap.
     *
     * <h4>Example</h4>
     *      var bitmap = new createjs_ui.ScaleBitmap("imagePath.jpg", new createjs.Rectangle(14, 14, 3, 3));
     *      bitmap.setDrawSize(100, 100);
     *
     * Note: When a string path or image tag that is not yet loaded is used, the stage may need to be redrawn before it
     * will be displayed.
     *
     * @class ScaleBitmap
     * @extends DisplayObject
     * @constructor
     * @param {Image | HTMLCanvasElement | HTMLVideoElement | String} imageOrUri The source object or URI to an image to display. This can be either an Image, Canvas, or Video object, or a string URI to an image file to load and use. If it is a URI, a new Image object will be constructed and assigned to the .image property.
     * @param {Rectangle} scale9Grid The inner rectangle of the nine region grid.
     **/
    var ScaleBitmap = function(imageOrUri, scale9Grid) {
        if (typeof imageOrUri == "string") {
            this.image = new Image();
            this.image.src = imageOrUri;
        } else {
            this.image = imageOrUri;
        }
        this.drawWidth = this.image.width;
        this.drawHeight = this.image.height;
        this.scale9Grid = scale9Grid;
        createjs.DisplayObject.call(this, this.image);
    };
    var p = createjs.extend(ScaleBitmap, createjs.DisplayObject);

// public properties:

    /**
     * The image to render. This can be an Image, a Canvas, or a Video.
     * @property image
     * @type Image | HTMLCanvasElement | HTMLVideoElement
     **/
    p.image = null;

    /**
     * Whether or not the ScaleBitmap should be draw to the canvas at whole pixel coordinates.
     * @property snapToPixel
     * @type Boolean
     * @default true
     **/
    p.snapToPixel = true;

    /**
     * Specifies the inner rectangle of the nine region scaling grid.
     * @property scale9Grid
     * @type Rectangle
     */
    p.scale9Grid = null;

    /**
     * Specifies the width of the drawn ScaleBitmap.
     * @property drawWidth
     * @type Number
     * @default The original width of the image.
     */
    p.drawWidth = 0;

    /**
     * Specifies the height of the drawn ScaleBitmap.
     * @property drawHeight
     * @type Number
     * @default The original height of the image.
     */
    p.drawHeight = 0;

    // constructor:

    /**
     * @property DisplayObject_initialize
     * @type Function
     * @private
     **/
    p.DisplayObject_initialize = p.initialize;

// public methods:

    /**
     * Changes the dimensions used the draw the ScaleBitmap.
     *
     * @method setDrawSize
     * @param {Number} newWidth The new width of the drawn ScaleBitmap.
     * @param {Number} newHeight The new height of the drawn ScaleBitmap.
     */
    p.setDrawSize = function(newWidth, newHeight) {
        this.drawWidth = newWidth;
        this.drawHeight = newHeight;
    };
    
    /**
     * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
     * This does not account for whether it would be visible within the boundaries of the stage.
     * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
     * @method isVisible
     * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
     **/
    p.isVisible = function() {
        var hasContent = this.cacheCanvas || (this.image && (this.image.complete || this.image.getContext || this.image.readyState >= 2));
        return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
    };

    /**
     * @property DisplayObject_draw
     * @type Function
     * @private
     **/
    p.DisplayObject_draw = p.draw;

    /**
     * Draws the display object into the specified context ignoring it's visible, alpha, shadow, and transform.
     * Returns true if the draw was handled (useful for overriding functionality).
     * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
     * @method draw
     * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
     * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
     * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
     * into itself).
     **/
    p.draw = function(ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }

        var centerX = this.scale9Grid.width;
        var centerY = this.scale9Grid.height;
        if(centerX == 0) //vertical
        {
            if(centerY == 0)
            {
                throw "One of scale9Grid width or height must be greater than zero.";
            }
            var imageWidth = this.image.width;
            var scale3Region1 = this.scale9Grid.y;
            var scale3Region3 = this.image.height - scale3Region1 - centerY;
            var oppositeEdgeScale = this.drawWidth / imageWidth;
            var scaledFirstRegion = scale3Region1 * oppositeEdgeScale;
            var scaledThirdRegion = scale3Region3 * oppositeEdgeScale;
            var scaledSecondRegion = this.drawHeight - scaledFirstRegion - scaledThirdRegion;

            ctx.drawImage(this.image, 0, 0, imageWidth, scale3Region1, 0, 0, this.drawWidth, scaledFirstRegion);
            ctx.drawImage(this.image, 0, scale3Region1, imageWidth, centerY, 0, scaledFirstRegion, this.drawWidth, scaledSecondRegion);
            ctx.drawImage(this.image, 0, scale3Region1 + centerY, imageWidth, scale3Region3, 0, scaledFirstRegion + scaledSecondRegion, this.drawWidth, scaledThirdRegion);
        }
        else if(centerY == 0) //horizontal
        {
            var imageHeight = this.image.height;
            scale3Region1 = this.scale9Grid.x;
            scale3Region3 = this.image.width - scale3Region1 - centerX;
            oppositeEdgeScale = this.drawHeight / this.image.height;
            scaledFirstRegion = scale3Region1 * oppositeEdgeScale;
            scaledThirdRegion = scale3Region3 * oppositeEdgeScale;
            scaledSecondRegion = this.drawWidth - scaledFirstRegion - scaledThirdRegion;

            ctx.drawImage(this.image, 0, 0, scale3Region1, imageHeight, 0, 0, scaledFirstRegion, this.drawHeight);
            ctx.drawImage(this.image, scale3Region1, 0, centerX, imageHeight, scaledFirstRegion, 0, scaledSecondRegion, this.drawHeight);
            ctx.drawImage(this.image, scale3Region1 + centerX, 0, scale3Region3, imageHeight, scaledFirstRegion + scaledSecondRegion, 0, scaledThirdRegion, this.drawHeight);
        }
        else
        {
            var left = this.scale9Grid.x;
            var top = this.scale9Grid.y;
            var right = this.image.width - centerX - left;
            var bottom = this.image.height - centerY - top;
            var scaledCenterX = this.drawWidth - left - right;
            var scaledCenterY = this.drawHeight - top - bottom;

            ctx.drawImage(this.image, 0, 0, left, top, 0, 0, left, top);
            ctx.drawImage(this.image, left, 0, centerX, top, left, 0, scaledCenterX, top);
            ctx.drawImage(this.image, left + centerX, 0, right, top, left + scaledCenterX, 0, right, top);

            ctx.drawImage(this.image, 0, top, left, centerY, 0, top, left, scaledCenterY);
            ctx.drawImage(this.image, left, top, centerX, centerY, left, top, scaledCenterX, scaledCenterY);
            ctx.drawImage(this.image, left + centerX, top, right, centerY, left + scaledCenterX, top, right, scaledCenterY);

            ctx.drawImage(this.image, 0, top + centerY, left, bottom, 0, top + scaledCenterY, left, bottom);
            ctx.drawImage(this.image, left, top + centerY, centerX, bottom, left, top + scaledCenterY, scaledCenterX, bottom);
            ctx.drawImage(this.image, left + centerX, top + centerY, right, bottom, left + scaledCenterX, top + scaledCenterY, right, bottom);
        }

        return true;
    };

    /**
     * Returns a clone of the ScaleBitmap instance.
     * @method clone
     * @return {ScaleBitmap} a clone of the ScaleBitmap instance.
     **/
    p.clone = function() {
        var o = new ScaleBitmap(this.image, this.scale9Grid.clone());
        if (this.sourceRect) { o.sourceRect = this.sourceRect.clone(); }
        this.cloneProps(o);
        return o;
    };

    /**
     * Returns a string representation of this object.
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    p.toString = function() {
        return "[ScaleBitmap (name="+  this.name +")]";
    };

    p._setWidth = function(width) {
        this.drawWidth = width;
    };

    p._getWidth = function() {
        return this.drawWidth;
    };

    p._setHeight = function(height) {
        this.drawHeight = height;
    };

    p._getHeight = function() {
        return this.drawHeight;
    };

    Object.defineProperties(p, {
        width: {
            set: p._setWidth,
            get: p._getWidth
        },
        height: {
            set: p._setHeight,
            get: p._getHeight
        }
    });

// private methods:

    createjs_ui.ScaleBitmap = createjs.promote(ScaleBitmap, "DisplayObject");
}());

//##############################################################################
// mouseWheelSupport.js
//##############################################################################

(function() {
    "use strict";

    /**
     * enable or disable mouse wheel support for canvas (e.g. for scroller)
     * using HTML 5 scrolling. will do nothing if it is already activated/
     * deactivated
     * based on http://www.sitepoint.com/html5-javascript-mouse-wheel/
     * @param stage the EaselJS-stage
     * @param enable true to enable mouse support, false to disable,
     */
    function mouseWheelSupport(stage, enable) {
        var canvas = stage.canvas;
        if (enable || enable === undefined) {
            if (createjs_ui._mouseWheelHandler !== undefined) {
                return;
            }
            createjs_ui._mouseWheelHandler = function(event) {
                event = window.event || event;
                var delta = Math.max(-1, Math.min(1,
                    (event.wheelDelta || -event.detail)));

                //var target = stage._getObjectsUnderPoint(stage.mouseX, stage.mouseY, null, true);
                var target = stage.getObjectsUnderPoint(stage.mouseX, stage.mouseY);
                if (!target) {
                    return;
                }
                var evt = new createjs.MouseEvent(
                    "mousewheel", true, false,
                    target.x, target.y, 
                    event, -1, true, target.rawX, target.rawY);
                evt.delta = delta;
                for(var i = 0; i < target.length; i++) {
                    target[i].dispatchEvent(evt);
                }
            };
            if (canvas.addEventListener) {
                canvas.addEventListener("mousewheel", 
                    createjs_ui._mouseWheelHandler, false);
                canvas.addEventListener("DOMMouseScroll", 
                    createjs_ui._mouseWheelHandler, false);
            } else {
                canvas.attachEvent("onmousewheel",
                    createjs_ui._mouseWheelHandler);
            }
        } else {
            if (createjs_ui._mouseWheelHandler === undefined) {
                return;
            }
            if (canvas.removeEventListener) {
                canvas.removeEventListener("mousewheel",
                    createjs_ui._mouseWheelHandler);
                canvas.removeEventListener("DOMMouseScroll", 
                    createjs_ui._mouseWheelHandler);
            } else {
                canvas.detachEvent("onmousewheel",
                    createjs_ui._mouseWheelHandler);
            }
            createjs_ui._mouseWheelHandler = undefined;
        }
    }

    createjs_ui.mouseWheelSupport = mouseWheelSupport;
})();

//##############################################################################
// resizeSupport.js
//##############################################################################

(function() {
    "use strict";
    
    function removeResizeSupport() {
        if (window.removeEventListener) {
            window.removeEventListener("resize",
                createjs_ui._resizeHandler);
        } else {
            window.detachEvent("onresize",
                createjs_ui._resizeHandler);
        }
        createjs_ui._resizeHandler = undefined;
    }
    
    //TODO: test this in IE
    /**
     * throw an event on the stage that the canvas has been resized.
     * @param stage the EaselJS-stage
     * @param enable true to enable resize support, false to disable,
     * @param fullwindow automatically resize the canvas to full window inner size
     */
    function resizeSupport(stage, enable, fullwindow) {
        if (enable || enable === undefined) {
            if (createjs_ui._resizeHandler !== undefined) {
                removeResizeSupport();
            }
            createjs_ui._resizeHandler = function(event) {
                var evt = new createjs.Event("resize");
                stage.dispatchEvent("resize");
                if (fullwindow) {
                    stage.canvas.width = window.innerWidth;
                    stage.canvas.height = window.innerHeight;
                }
            };
            if (window.addEventListener) {
                window.addEventListener("resize",
                    createjs_ui._resizeHandler, false);
            } else {
                window.attachEvent("onresize",
                    createjs_ui._resizeHandler);
            }
        } else {
            removeResizeSupport();
        }
    }

    createjs_ui.resizeSupport = resizeSupport;
})();

//##############################################################################
// Theme.js
//##############################################################################

// namespace
this.createjs_ui = this.createjs_ui || {};

/*
When the Theme constructor is called, it creates a mapping of UI-components
and functions that render their states.
As default your theme is registered globally (as createjs_ui.theme) but
you can create a special theme just for single controls
 */

(function() {
    "use strict";

    /**
     * base functions for all themes
     */
    var Theme = function(global) {
        // at its core a theme is just a dict that holds a collection of skins
        this._skins = {};
        // default color for label (e.g. buttons)
        this.labelColor = this.labelColor || "#000";
        // default font for label (e.g. buttons)
        this.labelFont = this.labelFont || "12px Arial";
        if (global === true || global === undefined) {
            createjs_ui.theme = this;
        }
    };

    var p = createjs.extend(Theme, createjs.EventDispatcher);

    p.loadComplete = function(event) {
        this.dispatchEvent("ui_complete");
    };

    p.createImageQueue = function(imagePath, manifest) {
        var queue = new createjs.LoadQueue(
            window.location.protocol != 'file:',
            imagePath);

        // TODO: setting the max. connections in the theme feels strange -
        // maybe create the queue somewhere else?

        // default for IE 10/11 is 8 connections
        queue.setMaxConnections(8);
        queue.addEventListener(
            "complete", createjs.proxy(this.loadComplete, this));
        queue.loadManifest(manifest);
        return queue;
    };

    /**
     * set skin for ui component
     * @param comp ui-component that we want to skin, e.g. "button"
     * @param id id for the skin
     * (e.g. state when the skinning function will be applied
     * @param skin skin-function that will executed once the component gets
     * updated
     */
    p.setSkin = function(comp, id, skin) {
        this._skins[comp] = this._skins[comp] || {};
        this._skins[comp][id] = skin;
        // TODO: dispatch event - the skin of "comp"
        // for state "state" has changed
    };

    p.getSkin = function(obj, comp, state) {
        if (this._skins[comp] && this._skins[comp][state]) {
            return this._skins[comp][state](obj);
        }
        return null;
    };

    /**
     * remove theme from global context
     */
    Theme.removeTheme = function() {
        createjs_ui.theme = undefined;
    };

    createjs_ui.Theme = createjs.promote(Theme, "EventDispatcher");
})();

//##############################################################################
// ViewPortBounds.js
//##############################################################################

/**
 * LayoutBoundsResult
 */


this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    var ViewPortBounds = function() {
    };

    var p = ViewPortBounds.prototype;

    /**
     * The explicit width of the view port, in pixels. If <code>NaN</code>,
     * there is no explicit width value.
     */
    p.explicitWidth = NaN;

    /**
     * The explicit height of the view port, in pixels. If <code>NaN</code>,
     * there is no explicit height value.
     */
    p.explicitHeight = NaN;

    p.x = 0;
    
    p.y = 0;


    createjs_ui.ViewPortBounds = ViewPortBounds;
})();

//##############################################################################
// Layout.js
//##############################################################################

this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    /**
     * basic layout stub - see LayoutAlignment
     */
    var Layout = function() {
        this.gap = 0;
        this.padding = 0
    };

    /**
     * If the total item height is smaller than the height of the bounds,
     * the items will be aligned to the top.
     */
    Layout.VERTICAL_ALIGN_TOP = "top";

    /**
     * If the total item height is smaller than the height of the bounds,
     * the items will be aligned to the middle.
     */
    Layout.VERTICAL_ALIGN_MIDDLE = "middle";

    Layout.ALIGN_JUSTIFY = "justify";

    /**
     * If the total item height is smaller than the height of the bounds,
     * the items will be aligned to the bottom.
     */
    Layout.VERTICAL_ALIGN_BOTTOM = "bottom";

    /**
     * If the total item width is smaller than the width of the bounds, the
     * items will be aligned to the left.
     */
    Layout.HORIZONTAL_ALIGN_LEFT = "left";

    /**
     * If the total item width is smaller than the width of the bounds, the
     * items will be aligned to the center.
     */
    Layout.HORIZONTAL_ALIGN_CENTER = "center";

    /**
     * If the total item width is smaller than the width of the bounds, the
     * items will be aligned to the right.
     */
    Layout.HORIZONTAL_ALIGN_RIGHT = "right";

    var p = Layout.prototype;

    /**
     * The space, in pixels, between items.
     */
    p._getGap = function() {
        return this._gap;
    };


    p._setGap = function(value) {
        if(this._gap == value) {
            return;
        }
        this._gap = value;
        this._needUpdate = true;
    };

    /**
     * The space, in pixels, between items.
     */
    p._getNeedUpdate = function() {
        return this._needUpdate;
    };

    /**
     * shotrtcut to set all paddings
     */
    p._setPadding = function(value) {
        this._paddingLeft = value;
        this._paddingRight = value;
        this._paddingBottom = value;
        this._paddingTop = value;
        this._needUpdate = true;
    };

    /**
     * The minimum space, in pixels, above the items.
     *
     * @default 0
     */
    p._getPaddingTop = function() {
        return this._paddingTop;
    };


    p._setPaddingTop = function(value) {
        if(this._paddingTop == value) {
            return;
        }
        this._paddingTop = value;
        this._needUpdate = true;
    };

    /**
     * The minimum space, in pixels, below the items.
     *
     * @default 0
     */
    p._getPaddingBottom = function() {
        return this._paddingBottom;
    };


    p._setPaddingBottom = function(value) {
        if(this._paddingBottom == value) {
            return;
        }
        this._paddingBottom = value;
        this._needUpdate = true;
    };

    /**
     * The space, in pixels, that appears to the left, before the first
     * item.
     *
     * @default 0
     */
    p._getPaddingLeft = function() {
        return this._paddingLeft;
    };


    p._setPaddingLeft = function(value) {
        if(this._paddingLeft == value) {
            return;
        }
        this._paddingLeft = value;
        this._needUpdate = true;
    };

    /**
     * The space, in pixels, that appears to the right, after the last item.
     *
     * @default 0
     */
    p._getPaddingRight = function() {
        return this._paddingRight;
    };

    p._setPaddingRight = function(value) {
        if(this._paddingRight == value)
        {
            return;
        }
        this._paddingRight = value;
        this._needUpdate = true;
    };

    /**
     * Positions (and possibly resizes) the supplied items.
     * @param items items that will be layouted
     * @param viewPortBounds
     */
    p.layout = function (items, viewPortBounds) {

    };

    Object.defineProperties(p, {
        padding: {
            set: p._setPadding,
            // just return paddingTop, because we do not save the
            // overall padding value (just like feathers)
            get: p._getPaddingTop
        },
        paddingLeft: {
            set: p._setPaddingLeft,
            get: p._getPaddingLeft
        },
        paddingRight: {
            set: p._setPaddingRight,
            get: p._getPaddingRight
        },
        paddingTop: {
            set: p._setPaddingTop,
            get: p._getPaddingTop
        },
        paddingBottom: {
            set: p._setPaddingBottom,
            get: p._getPaddingBottom
        },
        gap: {
            set: p._setGap,
            get: p._getGap
        },
        needUpdate: {
            get: p._getNeedUpdate
        }
    });
    createjs_ui.Layout = Layout;
}());

//##############################################################################
// LayoutAlignment.js
//##############################################################################

this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    /**
     * TODO: write documentation & tutorial
     * basic layout
     */
    var LayoutAlignment = function() {
        createjs_ui.Layout.call(this);
    };

    var p = createjs.extend(LayoutAlignment, createjs_ui.Layout);
    LayoutAlignment.VERTICAL_ALIGNMENT = "vertical";
    LayoutAlignment.HORIZONTAL_ALIGNMENT = "horizontal";

    /**
     * apply percentage width/height to items.
     * percentages have higher priorities than fixed with.
     * So if you set a width higher than 0 but also percentWidth,
     * the width will be recalculated according to percentWidth.
     * @param items
     * @param explicit space we have for the components
     * (this function will handle padding and gap, so the explicitWidth is
     *  for the whole available width)
     */
    p.applyPercent = function(items, explicit) {
        var _hor = (this.alignment == LayoutAlignment.HORIZONTAL_ALIGNMENT);

        var itemCount = items.length;
        var remaining = explicit;
        var totalExplicit = 0;
        var totalPercent = 0;

        var i, itemPercent, item;
        // sum up width/height required for all items
        for (i = 0; i < itemCount; i++) {
            item = items[i];
            var itemSpace;
            itemPercent = _hor ? item.percentWidth : item.percentHeight;
            itemSpace = _hor ? item.width : item.height;

            if (!isNaN(itemPercent) && itemPercent != null) {
                totalPercent += itemPercent;
            } else if (!isNaN(itemSpace)) {
                // no percentWidth/percentHeight set for this item
                totalExplicit += itemSpace;
            }
        }

        // add space for all gaps
        totalExplicit += this._firstGap > 0 ? this._firstGap : this._gap;
        totalExplicit += (this._gap * (itemCount - 3));
        totalExplicit += this._lastGap > 0 ? this._lastGap : this._gap;

        var padding = _hor ?
            this._paddingLeft + this._paddingRight :
            this._paddingTop + this._paddingBottom;
        totalExplicit += padding;

        // use whole available space - if we do not sum up to 100 we will
        // stretch the items
        if(totalPercent < 100) {
            totalPercent = 100;
        }

        remaining -= totalExplicit;
        var percentToPixels = remaining / totalPercent;
        // claculate width/height for each item based on remaining width/height
        for(i = 0; i < itemCount; i++) {
            item = items[i];
            itemPercent = _hor ? item.percentWidth : item.percentHeight;
            if (itemPercent > 0) {
                if (_hor) {
                    item.width = percentToPixels * itemPercent;
                } else {
                    item.height = percentToPixels * itemPercent;
                }
            }
        }
    };

    /**
     * get current gap (includes first and last gap)
     * @param i current item position
     * @param items list of items (to determine if we are at the last gap)
     */
    p._currentGap = function(i, items) {
        if(!isNaN(this._firstGap) && i == 0)
        {
            return this._firstGap;
        }
        else if(!isNaN(this._lastGap) && i > 0 && i == items.length - 2)
        {
            return this._lastGap;
        }
        return this._gap;
    };

    p.layout = function(items, viewPortBounds) {
        var _hor = (this.alignment == LayoutAlignment.HORIZONTAL_ALIGNMENT);

        // get max. dimensions from viewport bounds
        var explicitWidth = viewPortBounds ? viewPortBounds.explicitWidth : NaN;
        var explicitHeight = viewPortBounds ? viewPortBounds.explicitHeight : NaN;

        var explicitSpace = _hor ? explicitWidth : explicitHeight;
        var paddingStart = _hor ? this._paddingLeft : this._paddingTop;

        // recalculate width/height
        this.applyPercent(items, explicitSpace);

        var position = paddingStart;

        // calculate item position (x/y coordinates)
        for(var i = 0; i < items.length; i++)
        {
            var item = items[i];

            // move item to position calculated in previous loop
            if (_hor) {
                item.x = position;
            } else {
                item.y = position;
            }
            var itemSpace = _hor ? item.width : item.height;
            // calculate position for next item
            position += itemSpace + this._currentGap(i, items);
        }
    };

    p._setFirstGap = function(value) {
        if (value == this._firstGap) {
            return;
        }
        this._firstGap = value;
        this._needUpdate = true;
    };

    p._getFirstGap = function() {
        return this._firstGap;
    };

    p._setLastGap = function(value) {
        if (value == this._lastGap) {
            return;
        }
        this._lastGap = value;
        this._needUpdate = true;
    };

    p._getLastGap = function() {
        return this._lastGap;
    };

    Object.defineProperties(p, {
        firstGap: {
            set: p._setFirstGap,
            get: p._getFirstGap
        },
        lastGap: {
            set: p._setLastGap,
            get: p._getLastGap
        }
    });
    
    createjs_ui.LayoutAlignment = createjs.promote(LayoutAlignment, "Layout");
})();

//##############################################################################
// VerticalLayout.js
//##############################################################################

(function() {
    "use strict";

    /**
     * VerticalLayout - just set alignment to
     * LayoutAlignment.Vertical_ALIGNMENT
     */
    var VerticalLayout = function() {
        createjs_ui.LayoutAlignment.call(this);
        this.alignment = createjs_ui.LayoutAlignment.VERTICAL_ALIGNMENT;
    };

    var p = createjs.extend(VerticalLayout, createjs_ui.LayoutAlignment);

    createjs_ui.VerticalLayout = createjs.promote(VerticalLayout, "LayoutAlignment");
}());

//##############################################################################
// HorizontalLayout.js
//##############################################################################

(function() {
    "use strict";

    /**
     * HorizontalLayout - just set alignment to
     * LayoutAlignment.HORIZONTAL_ALIGNMENT
     */
    var HorizontalLayout = function() {
        createjs_ui.LayoutAlignment.call(this);
        this.alignment = createjs_ui.LayoutAlignment.HORIZONTAL_ALIGNMENT;
    };

    var p = createjs.extend(HorizontalLayout, createjs_ui.LayoutAlignment);

    createjs_ui.HorizontalLayout = createjs.promote(HorizontalLayout, "LayoutAlignment");
}());

//##############################################################################
// TiledLayout.js
//##############################################################################

(function() {
    "use strict";

    /**
     * HorizontalLayout - just set alignment to
     * LayoutAlignment.HORIZONTAL_ALIGNMENT
     */
    var TiledLayout = function() {
        createjs_ui.Layout.call(this);
        this._useSquareTiles = false;
        this._horizontalGap = 0;
        this._verticalGap = 0;
        this._tileHorizontalAlign = TiledLayout.TILE_HORIZONTAL_ALIGN_CENTER;
        this._tileVerticalAlign = TiledLayout.TILE_VERTICAL_ALIGN_MIDDLE;
        this._paging = TiledLayout.PAGING_NONE;
        this._orientation = TiledLayout.ORIENTATION_ROWS;
        this._needUpdate = true;
    };

    var p = createjs.extend(TiledLayout, createjs_ui.Layout);

    TiledLayout.ORIENTATION_ROWS = "rows";
    TiledLayout.ORIENTATION_COLUMNS = "columns";

    /**
     * If an item height is smaller than the height of a tile, the item will
     * be aligned to the top edge of the tile.
     *
     * @see #tileVerticalAlign
     */
    TiledLayout.TILE_VERTICAL_ALIGN_TOP = "top";

    /**
     * If an item height is smaller than the height of a tile, the item will
     * be aligned to the middle of the tile.
     *
     * @see #tileVerticalAlign
     */
    TiledLayout.TILE_VERTICAL_ALIGN_MIDDLE = "middle";

    /**
     * If an item height is smaller than the height of a tile, the item will
     * be aligned to the bottom edge of the tile.
     *
     * @see #tileVerticalAlign
     */
    TiledLayout.TILE_VERTICAL_ALIGN_BOTTOM = "bottom";

    /**
     * The item will be resized to fit the height of the tile.
     *
     * @see #tileVerticalAlign
     */
    TiledLayout.TILE_VERTICAL_ALIGN_JUSTIFY = "justify";

    /**
     * If an item width is smaller than the width of a tile, the item will
     * be aligned to the left edge of the tile.
     *
     * @see #tileHorizontalAlign
     */
    TiledLayout.TILE_HORIZONTAL_ALIGN_LEFT = "left";

    /**
     * If an item width is smaller than the width of a tile, the item will
     * be aligned to the center of the tile.
     *
     * @see #tileHorizontalAlign
     */
    TiledLayout.TILE_HORIZONTAL_ALIGN_CENTER = "center";

    /**
     * If an item width is smaller than the width of a tile, the item will
     * be aligned to the right edge of the tile.
     *
     * @see #tileHorizontalAlign
     */
    TiledLayout.TILE_HORIZONTAL_ALIGN_RIGHT = "right";

    /**
     * The item will be resized to fit the width of the tile.
     *
     * @see #tileHorizontalAlign
     */
    TiledLayout.TILE_HORIZONTAL_ALIGN_JUSTIFY = "justify";

    /**
     * The items will be positioned in pages horizontally from left to right.
     *
     * @see #paging
     */
    TiledLayout.PAGING_HORIZONTAL = "horizontal";

    /**
     * The items will be positioned in pages vertically from top to bottom.
     *
     * @see #paging
     */
    TiledLayout.PAGING_VERTICAL = "vertical";

    
    /**
     * Positions (and possibly resizes) the supplied items.
     * @param items items that will be layouted
     * @param viewPortBounds
     */
    p.layout = function (items, viewPortBounds) {
        var _rows = this._orientation == TiledLayout.ORIENTATION_ROWS;
        if(items.length == 0) {
            return;
        }

        var maxWidth = viewPortBounds ? viewPortBounds.maxWidth : Number.POSITIVE_INFINITY;
        var maxHeight = viewPortBounds ? viewPortBounds.maxHeight : Number.POSITIVE_INFINITY;
        var explicitWidth = viewPortBounds ? viewPortBounds.explicitWidth : NaN;
        var explicitHeight = viewPortBounds ? viewPortBounds.explicitHeight : NaN;

        var i, item;
        var tileWidth = 0;
        var tileHeight = 0;
        
        // get size for tiles by saving the highest/widest tile.
        for(i = 0; i < items.length; i++) {
            item = items[i];
            if(!item) {
                continue;
            }
            var itemWidth = item.width;
            var itemHeight = item.height;
            if(itemWidth > tileWidth) {
                tileWidth = itemWidth;
            }
            if(itemHeight > tileHeight) {
                tileHeight = itemHeight;
            }
        }
        
        // assure width & height for tiles is at least 0
        if(tileWidth < 0) {
            tileWidth = 0;
        }
        
        if(tileHeight < 0) {
            tileHeight = 0;
        }
        
        // make tiles square
        if (this._useSquareTiles) {
            if(tileWidth > tileHeight) {
                tileHeight = tileWidth;
            }
            else if(tileHeight > tileWidth) {
                tileWidth = tileHeight;
            }
        }
        
        // calculate tiles needed (and their width/height)
        var availableWidth = NaN;
        var availableHeight = NaN;

        var horizontalTileCount = _rows ? item.length : 1;

        if(!isNaN(explicitWidth)) {
            availableWidth = explicitWidth;
            horizontalTileCount = (explicitWidth - 
                this._paddingLeft - this._paddingRight + 
                this._horizontalGap) / (tileWidth + this._horizontalGap);
        }
        else if(!isNaN(maxWidth)) {
            availableWidth = maxWidth;
            horizontalTileCount = (maxWidth - 
                this._paddingLeft - this._paddingRight + 
                this._horizontalGap) / (tileWidth + this._horizontalGap);
        }
        if(horizontalTileCount < 1) {
            horizontalTileCount = 1;
        }
        var verticalTileCount = _rows ? 1 : item.length;
        if(!isNaN(explicitHeight)) {
            availableHeight = explicitHeight;
            verticalTileCount = (explicitHeight - 
                this._paddingTop - this._paddingBottom + 
                this._verticalGap) / (tileHeight + this._verticalGap);
        } else if(!isNaN(maxHeight)) {
            availableHeight = maxHeight;
            verticalTileCount = (maxHeight - 
                this._paddingTop - this._paddingBottom + 
                this._verticalGap) / (tileHeight + this._verticalGap);
        }
        if(verticalTileCount < 1) {
            verticalTileCount = 1;
        }
        horizontalTileCount = Math.floor(horizontalTileCount);
        verticalTileCount = Math.floor(verticalTileCount);

        var startX = this._paddingLeft;
        var startY = this._paddingTop;

        var perPage = horizontalTileCount * verticalTileCount;
        var pageIndex = 0;
        var nextPageStartIndex = perPage;
        var pageStart = _rows ? startX : startY;
        var positionX = startX;
        var positionY = startY;
        var itemIndex = 0;
        for(i = 0; i < items.length; i++)
        {
            item = items[i];
            if (_rows) {
                if(itemIndex != 0 && itemIndex % horizontalTileCount == 0)
                {
                    positionX = pageStart;
                    positionY += tileHeight + this._verticalGap;
                }
            } else { // columns
                if(itemIndex != 0 && i % verticalTileCount == 0)
                {
                    positionX += tileWidth + this._horizontalGap;
                    positionY = pageStart;
                }
            }
            if(itemIndex == nextPageStartIndex) {
                pageIndex++;
                nextPageStartIndex += perPage;

                //we can use availableWidth and availableHeight here without
                //checking if they're NaN because we will never reach a
                //new page without them already being calculated.
                if (_rows) {
                    if(this._paging == TiledLayout.PAGING_HORIZONTAL)
                    {
                        positionX = pageStart = startX + availableWidth * pageIndex;
                        positionY = startY;
                    } else if(this._paging == TiledLayout.PAGING_VERTICAL) {
                        positionY = startY + availableHeight * pageIndex;
                    }
                } else { // columns
                    if(this._paging == TiledLayout.PAGING_HORIZONTAL) {
                        positionX = startX + availableWidth * pageIndex;
                    } else if(this._paging == TiledLayout.PAGING_VERTICAL) {
                        positionX = startX;
                        positionY = pageStart = startY + availableHeight * pageIndex;
                    }
                }
            }
            if(item) {
                switch(this._tileHorizontalAlign) {
                    case TiledLayout.TILE_HORIZONTAL_ALIGN_JUSTIFY:
                    {
                        item.x = positionX;
                        item.width = tileWidth;
                        break;
                    }
                    case TiledLayout.TILE_HORIZONTAL_ALIGN_LEFT:
                    {
                        item.x = positionX;
                        break;
                    }
                    case TiledLayout.TILE_HORIZONTAL_ALIGN_RIGHT:
                    {
                        item.x = positionX + tileWidth - item.width;
                        break;
                    }
                    default: //center or unknown
                    {
                        item.x = positionX + (tileWidth - item.width) / 2;
                    }
                }
                switch(this._tileVerticalAlign) {
                    case TiledLayout.TILE_VERTICAL_ALIGN_JUSTIFY:
                    {
                        item.y = positionY;
                        item.height = tileHeight;
                        break;
                    }
                    case TiledLayout.TILE_VERTICAL_ALIGN_TOP:
                    {
                        item.y = positionY;
                        break;
                    }
                    case TiledLayout.TILE_VERTICAL_ALIGN_BOTTOM:
                    {
                        item.y = positionY + tileHeight - item.height;
                        break;
                    }
                    default: //middle or unknown
                    {
                        item.y = positionY + (tileHeight - item.height) / 2;
                    }
                }
            }
            if (_rows) {
                positionX += tileWidth + this._horizontalGap;
            } else { // columns
                positionY += tileHeight + this._verticalGap;
            }
            itemIndex++;
        }
        
        this._needUpdate = false;
    };

    p._setUseSquareTiles = function(useSquareTiles) {
        this._useSquareTiles = useSquareTiles;
        this._needUpdate = true;
    };

    p._getUseSquareTiles = function() {
        return this._useSquareTiles;
    };
    
    Object.defineProperties(p, {
        useSquareTiles: {
            set: p._setUseSquareTiles,
            get: p._getUseSquareTiles
        }
    });
    
    createjs_ui.TiledLayout = createjs.promote(TiledLayout, "Layout");
}());

//##############################################################################
// TiledRowsLayout.js
//##############################################################################

/**
 * Tiled columns Layout
 * (roughly based on starling TiledColumnsLayout)
 */


this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";
    /**
     * basic layout stub
     */
    var TiledRowsLayout = function() {
        createjs_ui.TiledLayout.call(this);
        this._paging = createjs_ui.TiledLayout.PAGING_HORIZONTAL;
        this._orientation = createjs_ui.TiledLayout.ORIENTATION_ROWS;
    };

    var p = createjs.extend(TiledRowsLayout, createjs_ui.TiledLayout);

    /**
     * Quickly sets both <code>horizontalGap</code> and <code>verticalGap</code>
     * to the same value. The <code>gap</code> getter always returns the
     * value of <code>horizontalGap</code>, but the value of
     * <code>verticalGap</code> may be different.
     *
     * @default 0
     *
     * @see #_horizontalGap
     * @see #_verticalGap
     */
    p._set_gap = function(value) {
        this._verticalGap = value;
        this._horizontalGap = value;
        this._needUpdate = true;
    };

    p._get_gap = function() {
        return this._horizontalGap;
    };

    Object.defineProperties(p, {
        gap: {
            set: p._set_gap,
            get: p._get_gap
        }
    });

    createjs_ui.TiledRowsLayout = createjs.promote(TiledRowsLayout, "TiledLayout");
}());

//##############################################################################
// TiledColumnsLayout.js
//##############################################################################

/**
 * Tiled columns Layout
 * (roughly based on starling TiledColumnsLayout)
 */


this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";
    /**
     * basic layout stub
     */
    var TiledColumnsLayout = function() {
        createjs_ui.TiledLayout.call(this);
        this._paging = createjs_ui.TiledLayout.PAGING_VERTICAL;
        this._orientation = createjs_ui.TiledLayout.ORIENTATION_COLUMNS;
    };

    var p = createjs.extend(TiledColumnsLayout, createjs_ui.TiledLayout);

    /**
     * Quickly sets both <code>horizontalGap</code> and <code>verticalGap</code>
     * to the same value. The <code>gap</code> getter always returns the
     * value of <code>verticalGap</code>, but the value of
     * <code>horizontalGap</code> may be different.
     *
     * @default 0
     *
     * @see #_horizontalGap
     * @see #_verticalGap
     */
    p._set_gap = function(value) {
        this._verticalGap = value;
        this._horizontalGap = value;
        this._needUpdate = true;
    };

    p._get_gap = function() {
        return this._verticalGap;
    };

    Object.defineProperties(p, {
        gap: {
            set: p._set_gap,
            get: p._get_gap
        }
    });

    createjs_ui.TiledColumnsLayout = createjs.promote(TiledColumnsLayout, "TiledLayout");
}());

//##############################################################################
// Control.js
//##############################################################################

// namespace
this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    /**
     * base for all UI controls (see controls/)
     * based on createjs-Container that supports adding children, so all
     * controls are containers
     */
    var Control = function(theme) {
        // set defaults
        this.width = this.width || 100;
        this.height = this.height || 100;
        this.percentWidth = this.percentWidth || null;
        this.percentHeight = this.percentHeight || null;
        // controls are enabled by default
        createjs.Container.call(this);
        this.setTheme(theme);
        this.enabled = this.enabled !== false;
        this._last_width = undefined;
        this._last_height = undefined;
        this.invalidState = true; // draw for the first time
    };

    var p = createjs.extend(Control, createjs.Container);

    /**
     * set (another) theme
     * if this is not set the default theme createjs_ui.theme will be used
     * will also be called by constructor to set initial theme
     */
    p.setTheme = function(theme) {
        // remove redraw-proxy on previous theme (if needed)
        if (this._redraw_proxy !== undefined) {
            this.theme.removeEventListener(
                "ui_complete", this._redraw_proxy);
            this._redraw_proxy = undefined;
        }

        this.theme = theme || createjs_ui.theme;
        if (this.theme === undefined) {
            throw new Error("you need to define a theme first");
        }
        // invalidate state so the control will be redrawn next time
        this.invalidState = true;
        this.redraw();
    };

    /**
     * remove old skin and add new one
     */
    p.changeState = function(skin) {
        if (this._currentSkin != skin) {
            if (this._currentSkin) {
                this.removeChild(this._currentSkin);
            }
            this._currentSkin = skin;
            skin.width = this.width;
            skin.height = this.height;
            this.addChildAt(skin, 0);
        }
        this.invalidState = false;
    };

    p._getEnabled = function() {
        return this._enabled;
    };

    p._setEnabled = function(value) {
        this._enabled = value;
    };

    /**
     * returns true if dimensions have changed
     */
    p.invalidDimensions = function() {
        return (this._last_height != this.height ||
            this._last_width != this.width);
    };

    /**
     * get image from skin (will execute a callback with the loaded skin
     * when it is loaded or call it directly when it already is loaded)
     */
    p.fromSkin = function(name, callback) {
        var scope = this;
        var skin = scope.theme.getSkin(scope, scope.skinName, name);
        if (skin) {
            callback.call(scope, skin);
        } else {
            var retry_proxy;
            var theme = this.theme;
            var retry = function(evt) {
                theme.removeEventListener(
                    "ui_complete", retry_proxy);
                var skin = scope.theme.getSkin(scope, scope.skinName, name);
                callback.call(scope, skin);
            };
            retry_proxy = createjs.proxy(retry, this);
            theme.addEventListener(
                "ui_complete", retry_proxy)
        }
    };


    /**
     * redraw control for current state from theme
     */
    p.redraw = function() {
        if (this.invalidState) {
            this.fromSkin(this._currentState, this.changeState);
        }
        if (this._currentSkin &&
            this.invalidDimensions()) {
            this._last_height = this.height;
            this._last_width = this.width;
            this._currentSkin.width = this.width;
            this._currentSkin.height = this.height;
        }
    };

    /**
     * @inheritDoc
     */
    /* istanbul ignore next */
    p.draw = function(ctx, ignoreCase) {
        this.redraw();
        return createjs.Container.prototype.draw.call(this, ctx, ignoreCase);
    };


    /**
     * The current touch state of the button.
     */
    p._getSkinName = function() {
        return this._skinName;
    };

    /**
     * @private
     */
    p._setSkinName = function(value) {
        if ( this._skinName == value ) {
            return;
        }
        this._skinName = value;
        this.invalidState = true;
    };

    Object.defineProperties(p, {
        enabled: {
            set: p._setEnabled,
            get: p._getEnabled
        },
        skinName: {
            set: p._setSkinName,
            get: p._getSkinName
        }
    });

    createjs_ui.Control = createjs.promote(Control, "Container");
})();

//##############################################################################
// Shape.js
//##############################################################################

(function() {
    "use strict";

    /**
     * just a resizable rectangle
     */
    var Shape = function (color, width, height) {
        this.width = width || 100;
        this.height = height || 100;
        this.color = color || "black";
        this._linear_gradient_fill_colors = null;
        this._linear_gradient_fill_ratios = null;
        createjs.Shape.call(this);
    };

    var p = createjs.extend(Shape, createjs.Shape);

    /**
     * the default shape only supports linearGradientFill, for radial gradients
     * override the applyColors function
     * @param colors
     * @param ratios
     */
    p.linearGradientFill = function(colors, ratios) {
        this._linear_gradient_fill_colors = colors;
        this._linear_gradient_fill_ratios = ratios;
    };
    
    p._setWidth = function(width) {
        this._width = width;
        this.invalid = true;
    };

    p._getWidth = function() {
        return this._width;
    };

    p._setHeight = function(height) {
        this._height = height;
        this.invalid = true;
    };

    p._getHeight = function() {
        return this._height;
    };

    p._setColor = function(color) {
        this._color = color;
        this.invalid = true;
    };

    p._getColor = function() {
        return this._color;
    };

    p._setBorder = function(border) {
        this._border = border;
        this.invalid = true;
    };

    p._getBorder = function() {
        return this._border;
    };

    p._setBorderColor = function(color) {
        this._borderColor = color;
        this.invalid = true;
    };

    p._getBorderColor = function() {
        return this._borderColor;
    };

    p.applyColor = function() {
        if (!this._linear_gradient_fill_colors || !this._linear_gradient_fill_ratios) {
            this.graphics.beginFill(this.color);
        } else {
            this.graphics.beginLinearGradientFill(
                this._linear_gradient_fill_colors, this._linear_gradient_fill_ratios,
                0, 0, this._width, this._height
            );
        }
    };

    /**
     * draw the inner of the shape (call one of the draw... functions from
     * easeljs/display/Graphics.js)
     */
    p.drawShape = function() {

    };

    p.drawBorder = function() {
        if (this.border) {
            this.graphics.beginStroke(this.borderColor);
            this.graphics.setStrokeStyle(this.border);
        }
    };

    p.redraw = function() {
        if (this.invalid) {
            this.graphics.clear();
            this.applyColor();
            this.drawBorder();
            this.drawShape();
            this.graphics.endFill();
            this.invalid = false;
        }
    };
    
    /**
     * @inheritDoc
     */
    /* istanbul ignore next */
    p.draw = function(ctx, ignoreCase) {
        this.redraw();
        return createjs.Shape.prototype.draw.call(this, ctx, ignoreCase);
    };

    Object.defineProperties(p, {
        width: {
            set: p._setWidth,
            get: p._getWidth
        },
        height: {
            set: p._setHeight,
            get: p._getHeight
        },
        border: { // border in pixel
            set: p._setBorder,
            get: p._getBorder
        },
        borderColor: { // border in pixel
            set: p._setBorderColor,
            get: p._getBorderColor
        },
        color: {
            set: p._setColor,
            get: p._getColor
        }
    });

    createjs_ui.Shape = createjs.promote(Shape, "Shape");
})();

//##############################################################################
// Rect.js
//##############################################################################

(function() {
    "use strict";

    /**
     * just a resizable rectangle
     */
    var Rect = function (color, width, height) {
        createjs_ui.Shape.call(this, color, width, height);
        // set defaults
        this.redraw();
    };

    var p = createjs.extend(Rect, createjs_ui.Shape);

    p._setRadius = function(radius) {
        this._radiusTL = this._radiusBR = this._radiusTR = this.radiusBL = radius;
        this.invalid = true;
    };

    p._setRadiusTL = function(radius) {
        this._radiusTL = radius;
        this.invalid = true;
    };

    p._getRadiusTL = function() {
        return this._radiusTL;
    };

    p._setRadiusTR = function(radius) {
        this._radiusTR = radius;
        this.invalid = true;
    };

    p._getRadiusTR = function() {
        return this._radiusTR;
    };

    p._setRadiusBR = function(radius) {
        this._radiusBR = radius;
        this.invalid = true;
    };

    p._getRadiusBR = function() {
        return this._radiusBR;
    };

    p._setRadiusBL = function(radius) {
        this._radiusBL = radius;
        this.invalid = true;
    };

    p._getRadiusBL = function() {
        return this._radiusBL;
    };
    
    p.drawShape = function() {
        if (this.radiusTL || this.radiusTR ||
            this.radiusBR || this.radiusBL ) {
            this.graphics.drawRoundRectComplex(0, 0,
                this._width, this._height,
                this.radiusTL, this.radiusTR,
                this.radiusBR, this.radiusBL);
        } else {
            this.graphics.drawRect(0, 0, this._width, this._height);
        }
    };
    
    Object.defineProperties(p, {
        width: {
            set: p._setWidth,
            get: p._getWidth
        },
        height: {
            set: p._setHeight,
            get: p._getHeight
        },
        color: {
            set: p._setColor,
            get: p._getColor
        },
        radius: {
            set: p._setRadius,
            get: p._getRadiusTL
        },
        radiusTL: {
            set: p._setRadiusTL,
            get: p._getRadiusTL
        },
        radiusTR: {
            set: p._setRadiusTR,
            get: p._getRadiusTR
        },
        radiusBL: {
            set: p._setRadiusBL,
            get: p._getRadiusBL
        },
        radiusBR: {
            set: p._setRadiusBR,
            get: p._getRadiusBR
        }
    });

    createjs_ui.Rect = createjs.promote(Rect, "Shape");
})();

//##############################################################################
// Ellipse.js
//##############################################################################

(function() {
    "use strict";

    /**
     * just a resizable rectangle
     */
    var Ellipse = function (color, width, height) {
        createjs_ui.Shape.call(this, color, width, height);
        this.redraw();
    };

    var p = createjs.extend(Ellipse, createjs_ui.Shape);

    p.drawShape = function() {
        this.graphics.drawEllipse(0, 0, this._width, this._height);
    };
    
    Object.defineProperties(p, {
        width: {
            set: p._setWidth,
            get: p._getWidth
        },
        height: {
            set: p._setHeight,
            get: p._getHeight
        },
        color: {
            set: p._setColor,
            get: p._getColor
        }
    });

    createjs_ui.Ellipse = createjs.promote(Ellipse, "Shape");
})();

//##############################################################################
// Diamond.js
//##############################################################################

(function() {
    "use strict";

    /**
     * just a resizable rectangle
     */
    var Diamond = function (color, width, height) {
        createjs_ui.Shape.call(this, color, width, height);
        this.redraw();
    };

    var p = createjs.extend(Diamond, createjs_ui.Shape);

    p.drawShape = function() {
        this.graphics.moveTo(this._width/2, 0)
            .lineTo(this._width, this._height/2)
            .lineTo(this._width/2, this._height)
            .lineTo(0, this._height/2)
            .lineTo(this._width/2, 0);
    };

    Object.defineProperties(p, {
        width: {
            set: p._setWidth,
            get: p._getWidth
        },
        height: {
            set: p._setHeight,
            get: p._getHeight
        },
        color: {
            set: p._setColor,
            get: p._getColor
        }
    });

    createjs_ui.Diamond = createjs.promote(Diamond, "Shape");
})();

//##############################################################################
// Application.js
//##############################################################################

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

//##############################################################################
// Button.js
//##############################################################################

(function() {
    "use strict";

    /**
     * basic button with different stages to show mouse/touch feedback
     */
    var Button = function (theme) {
        this.skinName = this.skinName || Button.SKIN_NAME;
        this._validStates = this._validStates || Button.stateNames;
        this._setCurrentState(Button.UP); // default state is UP
        this._pressed = false; // button is not pressed by default
        this.height = this.height || 20;
        this._over = false; // mouse is not over button by default
        createjs_ui.Control.call(this, theme);
        this.mouseChildren = false;
        this.handleEvent({});
        this.updateLabel = this.updateLabel !== false; // label text changed
    };

    var p = createjs.extend(Button, createjs_ui.Control);

    // name of skin that will be applied
    Button.SKIN_NAME = "button";

    // Identifier for the different button states
    Button.UP = "up";
    Button.DOWN = "down";
    Button.HOVER = "hover";

    Button.stateNames = [
        Button.UP, Button.DOWN, Button.HOVER
    ];

    /**
     * The current touch state of the button.
     */
    p._getCurrentState = function() {
        return this._currentState;
    };

    /**
     * @private
     */
    p._setCurrentState = function(value) {
        if ( this._currentState == value ) {
            return;
        }
        if(this._validStates.indexOf(value) < 0) {
            throw new Error("Invalid state: " + value + ".");
        }
        this._currentState = value;
        // invalidate state so the next draw call will redraw the control
        this.invalidState = true;
    };


    p._getEnabled = function() {
        return createjs_ui.Control.prototype._getEnabled.call(this);
    };

    /**
     * Enables or disables the button functionality on the Butten.
     * @see http://www.createjs.com/Docs/EaselJS/files/easeljs_ui_ButtonHelper.js.html#l39
     * @method setEnabled
     * @param {Boolean} value
     **/
    p._setEnabled = function(value) {
        // update event listeners
        if (value) {
            this.on("rollover", this.handleEvent, this);
            this.on("rollout", this.handleEvent, this);
            this.on("mousedown", this.handleEvent, this);
            this.on("pressup", this.handleEvent, this);
        } else {
            this.off("rollover", this.handleEvent, this);
            this.off("rollout", this.handleEvent, this);
            this.off("mousedown", this.handleEvent, this);
            this.off("pressup", this.handleEvent, this);
        }
        createjs_ui.Control.prototype._setEnabled.call(this, value);
    };

    p._getLabel = function() {
        return this._label;
    };

    p._setLabel = function(value) {
        if(this._label == value)
        {
            return;
        }
        this._label = value;
        this.updateLabel = true;
    };

    /**
     * create or update label
     */
    p.createLabel = function() {
        // TODO: do we want something like a TextRenderer who decides to use
        // DOM elements instead of createjs.Text?
        if(this.labelText) {
            this.labelText.text = this._label;
            this.labelText.font = this.theme.labelFont;
            this.labelText.color = this.theme.labelColor;
        } else {
            this.labelText = new createjs.Text(this._label, this.theme.labelFont, this.theme.labelColor);
            this.addChild(this.labelText);
        }
        this.updateLabelDimensions();
        this.updateLabel = false;
    };

    p.updateLabelDimensions = function () {
        if (this.labelText && this.labelText.text) {
            this.labelText.x = (this.width - this.labelText.getMeasuredWidth()) / 2;
            this.labelText.y = (this.height - this.labelText.getMeasuredHeight()) / 2;
        }
    };

    p.setTheme = function(theme) {
        // this theme has other font or color settings - update the label
        if (this.labelText) {
            this.updateLabel = (this.updateLabel ||
                this.labelText.font != this.theme.labelFont ||
                this.labelText.color != this.theme.labelColor );
        }
        createjs_ui.Control.prototype.setTheme.call(this, theme);
    };

    /**
     * redraw button
     * @see createjs_ui.Control.prototype.redraw
     */
    p.redraw = function() {
        if (this.invalidDimensions()) {
            this.updateLabelDimensions();
        }
        if (this.updateLabel) {
            this.createLabel();
        }
        createjs_ui.Control.prototype.redraw.call(this);
    };

    /**
    * handle Mouse Event
    * TODO: handle multi-touch (?)
    * @see http://www.createjs.com/Docs/EaselJS/files/easeljs_ui_ButtonHelper.js.html#l197
    * @method handleEvent
    * @param {Object} evt The mouse event to handle.
    * @protected
    **/
    p.handleEvent = function(evt) {
        var type = evt.type;
        if (!this._enabled) {
            return;
        }
        if (type == "mousedown") {
            this._setCurrentState(Button.DOWN);
            this._pressed = true;
        } else if (type == "pressup" || type == "mouseup") {
            this._pressed = false;
            if (this._over) {
                this._setCurrentState(Button.HOVER);
            } else {
                this._setCurrentState(Button.UP);
            }
        } else if (type == "rollover") {
            this._over = true;
            if (this._pressed) {
                this._setCurrentState(Button.DOWN);
            } else {
                this._setCurrentState(Button.HOVER);
            }
        } else  { // type == rollout and default
            if (this._over) {
                this._over = false;
            }
            this._setCurrentState(Button.UP);
        }
    };

    Object.defineProperties(p, {
        enabled: {
            set: p._setEnabled,
            get: p._getEnabled
        },
        label: {
            set: p._setLabel,
            get: p._getLabel
        },
        currentState: {
            get: p._getCurrentState
        }
    });

    createjs_ui.Button = createjs.promote(Button, "Control");
})();

//##############################################################################
// ToggleButton.js
//##############################################################################

(function() {
    "use strict";

    /**
     * basic button with different stages to show mouse/touch feedback
     */
    var ToggleButton = function (theme, skin_name) {
        this.skinName = this.skinName || ToggleButton.SKIN_NAME;
        createjs_ui.Button.call(this, theme, skin_name);
        this._selected = false;
        this._validStates = this._validStates.slice(0);
        this._validStates.push(ToggleButton.SELECTED_UP);
        this._validStates.push(ToggleButton.SELECTED_DOWN);
        this._validStates.push(ToggleButton.SELECTED_HOVER);
    };

    var p = createjs.extend(ToggleButton, createjs_ui.Button);

    ToggleButton.SKIN_NAME = "toggle_button";
    
    ToggleButton.SELECTED_UP = "selected_up";
    ToggleButton.SELECTED_DOWN = "selected_down";
    ToggleButton.SELECTED_HOVER = "selected_hover";

    p._setSelected = function(selected) {
        var state = this._currentState;
        this.invalidState = this._selected != selected || this.invalidState;
        if (state.indexOf("selected_") == 0) {
            state = state.substr(9, state.length);
        }
        this._selected = selected;
        this._setCurrentState(state);
    };

    p._getSelected = function(){
        return this._selected;
    };

    p._setCurrentState = function(value) {
        if (this._selected) {
            value = "selected_" + value;
        }
        createjs_ui.Button.prototype._setCurrentState.call(this, value);
    };

    /**
     * toggle state
     */
    p.toggle = function() {
        this._setSelected(!this._selected);
    };
    
    /**
     * handle Mouse Event
     * TODO: handle multi-touch
     * @see http://www.createjs.com/Docs/EaselJS/files/easeljs_ui_ButtonHelper.js.html#l197
     * @method handleEvent
     * @param {Object} evt The mouse event to handle.
     * @protected
     **/
    p.handleEvent = function(evt) {
        var type = evt.type;
        if (!this._enabled) {
            return;
        }

        if (type == "mousedown") {
            this._setCurrentState(createjs_ui.Button.DOWN);
            this._pressed = true;
        } else if (type == "pressup" || type == "mouseup") {
            this._pressed = false;
            if (this._over) {
                this.toggle();
            }
            this._setCurrentState(createjs_ui.Button.UP);
        } else if (type == "rollover") {
            this._over = true;
            if (this._pressed) {
                this._setCurrentState(createjs_ui.Button.DOWN);
            } else {
                this._setCurrentState(createjs_ui.Button.HOVER);
            }
        } else  { // type == rollout and default
            if (this._over) {
                this._over = false;
            }
            this._setCurrentState(createjs_ui.Button.UP);
        }
    };

    Object.defineProperties(p, {
        selected: {
            set: p._setSelected,
            get: p._getSelected
        }
    });
    
    createjs_ui.ToggleButton = createjs.promote(ToggleButton, "Button");
})();

//##############################################################################
// LayoutGroup.js
//##############################################################################

// namespace
this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";

    /**
     * base for all UI controls (see controls/)
     * based on createjs-Container that supports adding children, so all
     * controls are containers
     */
    var LayoutGroup = function() {
        this.percentWidth = this.percentWidth || null;
        this.percentHeight = this.percentHeight || null;
        createjs.Container.call(this);
        this._viewPortBounds = new createjs_ui.ViewPortBounds();
        this._needUpdate = true;
    };

    var p = createjs.extend(LayoutGroup, createjs.Container);

    p.redraw = function() {
        var dimensionChanged = false;
        if (this._width && this._viewPortBounds.explicitWidth != this._width) {
            // width set - change viewport boundaries
            this._viewPortBounds.explicitWidth = this._width;
            dimensionChanged = true;
        }
        if (this._height && this._viewPortBounds.explicitHeight != this._height) {
            // height set - change viewport boundaries
            this._viewPortBounds.explicitHeight = this._height;
            dimensionChanged = true;
        }
        if (this.layout != null &&
            (this._needUpdate || dimensionChanged || this.layout.needUpdate)) {
            this.layout.layout(this.children, this._viewPortBounds);
            this._needUpdate = false;
            this.layout._needUpdate = false;
        }
    };

    p.addChild = function(child) {
        this._needUpdate = true;
        return createjs.Container.prototype.addChild.call(this, child);
    };

    p.addChildAt = function(child, pos) {
        this._needUpdate = true;
        return createjs.Container.prototype.addChildAt.call(this, child, pos);
    };
    
    p.drawArea = function(ctx, ignoreCache, x, y, width, height) {
        this.redraw();
        if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }

        // this ensures we don't have issues with display list changes that occur during a draw:
        var list = this.children.slice();
        for (var i=0,l=list.length; i<l; i++) {
            var child = list[i];
            if (!child.isVisible() ||
                child.x > width + x ||
                child.y > height + y ||
                child.x < x - child.width ||
                child.y < y - child.height) {
                continue; 
            }

            // draw the child:
            ctx.save();
            child.updateContext(ctx);
            child.draw(ctx);
            ctx.restore();
        }
        return true;
    };
    
    p._setWidth = function(width) {
        this._width = width;
    };

    p._getWidth = function() {
        if (this._width) {
            return this._width;
        }
        var width = 0;
        if (this.children) {
            for (var i = 0; i < this.numChildren; i++) {
                var child = this.getChildAt(i);
                width = Math.max(width, child.x+child.width);
            }
        }
        return width;
    };
    
    p._setHeight = function(height) {
        this._height = height;
    };

    p._getHeight = function() {
        if (this._height) {
            return this._height;
        }
        var height = 0;
        if (this.children) {
            for (var i = 0; i < this.numChildren; i++) {
                var child = this.getChildAt(i);
                height = Math.max(height, child.y+child.height);
            }
        }
        return height;
    };

    /**
     * @inheritDoc
     */
    /* istanbul ignore next */
    p.draw = function(ctx, ignoreCase) {
        this.redraw();
        return createjs.Container.prototype.draw.call(this, ctx, ignoreCase);
    };

    Object.defineProperties(p, {
        height: {
            set: p._setHeight,
            get: p._getHeight
        },
        width: {
            set: p._setWidth,
            get: p._getWidth
        }
    });
    
    createjs_ui.LayoutGroup = createjs.promote(LayoutGroup, "Container");
})();

//##############################################################################
// ScrollBar.js
//##############################################################################

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

//##############################################################################
// ScrollThumb.js
//##############################################################################

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

//##############################################################################
// ScrollArea.js
//##############################################################################

// namespace
this.createjs_ui = this.createjs_ui || {};

(function() {
    "use strict";
    
    var ScrollArea = function(content, addListener) {
        this.addListener = addListener || true;
        createjs.Container.call(this);
        this.content = content || null;
        this.mask = undefined;
        this.enabled = true;
        this._useMask = true;

        this.scrolldirection = ScrollArea.SCROLL_AUTO;
        // # of pixel you scroll at a time (if the event delta is 1 / -1)
        this.scrolldelta = 10;
    };

    // scrolls horizontal as default, but will change if a
    // horizontal layout is set in the content
    ScrollArea.SCROLL_AUTO = "auto";
    ScrollArea.SCROLL_VERTICAL = "vertical";
    ScrollArea.SCROLL_HORIZONTAL = "horizontal";

    var p = createjs.extend(ScrollArea, createjs.Container);
    
    /**
     * Enables or disables the button functionality on the Butten.
     * @see http://www.createjs.com/Docs/EaselJS/files/easeljs_ui_ButtonHelper.js.html#l39
     * @method setEnabled
     * @param {Boolean} value
     **/
    p._setEnabled = function(value) {
        // update event listeners
        if (value && this.addListener) {
            this.on("pressmove", this.handleMove, this);
            this.on("pressup", this.handleUp, this);
            this.on("mousewheel", this.handleWheel, this);
        } else if (this.hasEventListener("pressmove")) {
            this.off("pressmove", this.handleMove, this);
            this.off("pressup", this.handleUp, this);
            this.off("mousewheel", this.handleWheel, this);
        }
        this._enabled = value;
    };
    
    /**
     * check, if the layout of the content is horizontally alligned
     */
    p.layoutHorizontalAlign = function() {
        return this.content.layout &&
            this.content.layout.alignment == createjs_ui.LayoutAlignment.HORIZONTAL_ALIGNMENT
    };

    /**
     * test if content width bigger than this width but content height is 
     * smaller than this height (so we allow scrolling in only one direction)
     */
    p.upright = function() {
        return this.content.height <= this.height &&
            this.content.width > this.width
    };
    
    p._scrollContent = function(x, y) {
        // todo: press shift to switch direction
        var scroll_auto = this.scrolldirection == ScrollArea.SCROLL_AUTO;
        var scroll = ScrollArea.SCROLL_VERTICAL;
        // if the scroll direction is set to SCROLL_AUTO we check, if the 
        // layout of the content is set to horizontal or the content
        // width is bigger than the current
        if (this.scrolldirection == ScrollArea.SCROLL_HORIZONTAL || 
            (scroll_auto && (this.layoutHorizontalAlign() || this.upright()) )) {
            scroll = ScrollArea.SCROLL_HORIZONTAL;
        }
        if (scroll == ScrollArea.SCROLL_HORIZONTAL) {
            if (this.content.width > this.width) {
                // assure we are within bounds
                x = Math.min(x, 0);
                if (this.content.width) {
                    x = Math.max(x, -(this.content.width - this.width));
                }
                this.content.x = x;
            }
        } 
        if (scroll == ScrollArea.SCROLL_VERTICAL) {
            if (this.content.height > this.height) {
                // assure we are within bounds
                y = Math.min(y, 0);
                if (this.content.height && this.content.y < 0) {
                    y = Math.max(y, -(this.content.height - this.height));
                }
                this.content.y = y;
            }
        }
    };
    
    p.handleWheel = function(event) {
        this._scrollContent(
            this.content.x + event.delta * this.scrolldelta,
            this.content.y + event.delta * this.scrolldelta
        )
    };

    p._getEnabled = function() {
        return this._enabled;
    };
    
    p.handleMove = function(event) {
        if (!this._start) {
            this._start = [
                event.stageX - this.content.x,
                event.stageY - this.content.y
            ];
        }
        this._scrollContent(
            event.stageX - this._start[0],
            event.stageY - this._start[1]
        );
    };

    p.handleUp = function(event) {
        this._start = null;
    };

    p.draw = function(ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }

        ctx.save();
        this.content.updateContext(ctx);
        if (this.content && this.content.drawArea) {
            this.content.drawArea(ctx, ignoreCache, -this.content.x, -this.content.y, this.width, this.height);
        } else if (this.content && this.content.draw) {
            this.content.draw(ctx, ignoreCache);
            
        }
        ctx.restore();
        return true;
    };

    p._setContent = function(content) {
        if (this._content) {
            this.Container_removeChild(content);
        }
        if (content) {
            this.Container_addChild(content);
        }
        this._content = content;
    };

    p._getContent = function() {
        return this._content;
    };

    /**
     * do not remove children - we just have a content
     * override addChild to prevent the developer from adding more than one context
     * @param child
     */
    p.removeChild = function(child) {
        throw new Error("use .content = null instead of removeChild(child)")
    };

    p.addChild = function(child) {
        throw new Error("use .content = child instead of addChild(child)")
    };


    p.updateMask = function() {
        if (this.height && this.width && this._useMask) {
            if (this.mask === undefined) {
                this.mask = new createjs.Shape();
            }
            this.drawMask();
        } else {
            if (this.mask) {
                this.mask.graphics.clear();
            }
            this.mask = undefined;
        }
    };

    /**
     * draw mask (can be overwritten, e.g. to show something above the 
     * scroll area when using a vertical layout)
     * @private
     */
    p.drawMask = function() {
        this.mask.graphics.clear()
            .beginFill("#fff")
            .drawRect(this.x, this.y, this.width, this.height)
            .endFill();
    };
    
    p._setHeight = function(height) {
        this._height = height;
        this.updateMask();
    };
    
    p._getHeight = function() {
        if (!this._height) {
            return this._content.height;
        }
        return this._height;
    };
    
    p._setWidth = function(width) {
        this._width = width;
        this.updateMask();
    };
    
    p._getWidth = function() {
        if (!this._width) {
            return this._content.width;
        }
        return this._width;
    };
    
    Object.defineProperties(p, {
        height: {
            set: p._setHeight,
            get: p._getHeight
        },
        width: {
            set: p._setWidth,
            get: p._getWidth
        },
        enabled: {
            set: p._setEnabled,
            get: p._getEnabled
        },
        content: {
            set: p._setContent,
            get: p._getContent
        }
    });
    
    createjs_ui.ScrollArea = createjs.promote(ScrollArea, "Container");
})();