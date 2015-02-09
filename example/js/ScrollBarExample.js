var ScrollBarExample;

(function() {
    ScrollBarExample = function(stage) {
        var btn;
        createjs_ui.Application.call(this, stage);

        // initialize theme
        new createjs_ui.AeonTheme();

        /*
         #################################
         #######     HORIZONTAL   ########
         #################################
         */

        var inner_horizontal = new createjs_ui.LayoutGroup();
        inner_horizontal.layout = new createjs_ui.HorizontalLayout();
        inner_horizontal.layout.gap = 10;
        
        // add some buttons
        for (var i = 0; i < 10; i++) {
            btn = new createjs_ui.Button();
            btn.height = 25;
            btn.label = (i+1)+". button";
            inner_horizontal.addChild(btn);
        }
        var inner_scroll_horizontal = new createjs_ui.ScrollArea();
        inner_scroll_horizontal.content = inner_horizontal;
        inner_scroll_horizontal.width = 500;
        this.addChild(inner_scroll_horizontal);

        var sb_horizontal = new createjs_ui.ScrollBar(inner_scroll_horizontal);
        this.addChild(sb_horizontal);
        sb_horizontal.y = inner_scroll_horizontal.height;
        sb_horizontal.width = inner_scroll_horizontal.width;


        /*
            ##################################
            ########     VERTICAL    #########
            ##################################
         */

        var grp = new createjs_ui.LayoutGroup();
        var inner = new createjs_ui.LayoutGroup();
        inner.layout = new createjs_ui.VerticalLayout();
        inner.layout.gap = 10;

        // add some buttons
        for (var i = 0; i < 12; i++) {
            btn = new createjs_ui.Button();
            btn.height = 25;
            btn.label = (i+1)+". button";
            inner.addChild(btn);
        }
        var inner_scroll = new createjs_ui.ScrollArea(inner);
        inner_scroll.width = 100;
        inner_scroll.height = 150;
        grp.addChild(inner_scroll);


        var sb = new createjs_ui.ScrollBar(inner_scroll);
        grp.addChild(sb);
        sb.x = inner_scroll.width;
        sb.height = inner_scroll.height;

        this.addChild(grp);
        grp.y = 150;
    };

    var p = createjs.extend(ScrollBarExample, createjs_ui.Application);

    p.tick = function(event) {
        this.stage.update(event);
    };
})();
