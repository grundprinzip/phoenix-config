var MOD = ["cmd", "ctrl", "alt"];

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

// Number of pixels to move / extend a frame in one iteration.
var INC_PX = 10;

// Get the named frames key list.
var CYCLE_LIST = Object.keys(NAMED_FRAMES);
var CYCLE = 0;

// Current transient configuration. The cache key is used to remember the last
// non-named position of a frame for a window. This behaviro relies on the fact
// that App objects are Identifiable using hash().
var CONFIG = {"cache": {}};

var dump_rect = function(r) {
    return r.x + ":" + r.y + "@" + r.width + ":" + r.height;
}

// Given a named frame will set it's position.
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
 * Helper function that extends a given frame in a particular direction by 
 * increment pixels.
 * 
 * @param {String} direction 
 * @param {Number} increment 
 */
Window.prototype.extendFrame = function(direction, increment) {
    var frame = this.frame();
    var screen = this.screen().flippedVisibleFrame();
    switch (direction) {
        case "up":
            frame.y -= increment;
            frame.height += increment;
            break;
        case "down":
            frame.height += increment;
            break;
        case "left":
            frame.width += increment;
            frame.x -= increment;
            break;
        case "right":
            frame.width += increment;
            break;
    }
    this.setFrame(frame);
    this.updateCachedLocation();
}

Window.prototype.moveFrame = function(direction, increment) {
    var frame = this.frame();
    var screen = this.screen().flippedVisibleFrame();
    switch (direction) {
        case "up":
            frame.y -= increment;
            break;
        case "down":
            frame.y += increment;
            break;
        case "left":
            frame.x -= increment;
            break;
        case "right":
            frame.x += increment;        
            break;
    }
    this.setFrame(frame);
    this.updateCachedLocation();
}

/**
 * Helper function that will cache the location of the current window frame given it's
 * application hash. This is needed to be able to restore to a given size.
 */
Window.prototype.updateCachedLocation = function() {
    var key = this.app().hash();
    CONFIG["cache"][key] = this.frame();
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

////////////////////////////////////////////////////////////////////////////////
// List of Handlers
////////////////////////////////////////////////////////////////////////////////
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


var handlers = [];
////////////// EXTEND //////////////////////////////////////////////////////////
handlers.push(
    new Key("right", MOD.concat(["shift"]), function() {
        Window.focused().extendFrame("right", INC_PX);
    })
);

handlers.push(
    new Key("left", MOD.concat(["shift"]), function() {
        Window.focused().extendFrame("left", INC_PX);
    })
);

handlers.push(
    new Key("up", MOD.concat(["shift"]), function() {
        Window.focused().extendFrame("up", INC_PX);
    })
);

handlers.push(
    new Key("down", MOD.concat(["shift"]), function() {
        Window.focused().extendFrame("down", INC_PX);
    })
);

////////////// MOVE// //////////////////////////////////////////////////////////
handlers.push(
    new Key("right", MOD, function() {
        Window.focused().moveFrame("right", INC_PX);
    })
);

handlers.push(
    new Key("left", MOD, function() {
        Window.focused().moveFrame("left", INC_PX);
    })
);

handlers.push(
    new Key("up", MOD, function() {
        Window.focused().moveFrame("up", INC_PX);
    })
);

handlers.push(
    new Key("down", MOD, function() {
        Window.focused().moveFrame("down", INC_PX);
    })
);





var launched = new Event('didLaunch', function() {
    Phoenix.log("Ready to roll...");
});