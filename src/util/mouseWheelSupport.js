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