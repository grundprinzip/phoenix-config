var NAMED_FRAMES = {
    'left_half': [0, 0, 0.5, 1], 
    'right_half': [0.5, 0, 0.5, 1],
    'top_half': [0, 0, 1, 0.5],
    'bottom_half': [0, 0.5, 1, 0.5],
    'v_third_one': [0, 0, 0.333, 1],
    'v_third_two': [0.333, 0, 0.333, 1],
    'v_third_three': [0.666, 0, 0.333, 1],
    'reset': null,
};

var INC_PX = 10;

// Get the named frames key list
var CYCLE_LIST = Object.keys(NAMED_FRAMES);
var CYCLE = 0;
var CONFIG = {"cache": {}};

var dump_rect = function(r) {
    return r.x + ":" + r.y + "@" + r.width + ":" + r.height;
}

var set_frame = function(name) {
    var visible_screen = Window.focused().screen().flippedVisibleFrame();
    if (name == "reset") {
        var app = Window.focused().app();
        if (!(app.hash() in CONFIG["cache"])) return;
        Window.focused().setFrame(CONFIG["cache"][app.hash()]);
    } else {

        var f = NAMED_FRAMES[name];
        var nf = {x: visible_screen.x + (visible_screen.width * f[0]), 
            y: visible_screen.y + (visible_screen.height * f[1]),
            width: visible_screen.width *f[2],
            height: visible_screen.height * f[3]};
        Phoenix.log(name + " " + dump_rect(nf) + " " + f + dump_rect(visible_screen));
        Window.focused().setFrame(nf);
    }
}


/**
 * Helper function to debug print information about the current App
 */
App.prototype.stringify = function() {
    return this.name() + "(" + this.bundleIdentifier() + ")@" + this.hash();
}


Window.prototype.stringify = function() {
    var buffer = this.app().stringify() + "\n";
    var frame = this.frame();
    buffer += frame.x + ":" + frame.y + "@" + frame.width + ":" +  frame.height;
    return buffer;
}


var handler = new Key('c', [ 'cmd', 'ctrl', 'alt' ], function () {
    // Capture the current frame of the window and store it somewhere
    var wd = Window.focused();
    var current = wd.frame();

    // Get the app identifier
    var app = wd.app();

    Phoenix.notify(wd.stringify());

    // Check if we had the window already in cache
    if (!(app.hash() in CONFIG["cache"])) {
        CONFIG["cache"][app.hash()] = current;
    }
    // Set based on cycle
    set_frame(Object.keys(NAMED_FRAMES)[CYCLE]);
    CYCLE = ++CYCLE % Object.keys(NAMED_FRAMES).length;
});

var grow_right = new Key("right", ["cmd", "ctrl", "alt","shift"], function(){
    var frame = Window.focused().frame();
    var screen = Window.focused().screen().flippedVisibleFrame();

    // Modify frame
    Phoenix.log(dump_rect(frame));
    frame.width += INC_PX;
    Window.focused().setFrame(frame);
});

var launched = new Event('didLaunch', function() {
    Phoenix.log("Ready to roll...");
});