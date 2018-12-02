// Note in case there are asynchronous calls in render function
// to make sure only one rendering happens at a time
var renderId = 0;

// TODO: replace this function to create your own rendering idea
var renderToken = async function(tokenValue) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var currX = (c.width / 2) | 0;
    var currY = (c.height / 2) | 0;
    var nextX, nextY;
    if (!tokenValue) {
        return;
    }
    var moveList = [];
    var range = new Object();
    range.minX = currX;
    range.minY = currY;
    range.maxX = currX;
    range.maxY = currY;
    do {
        var dir = tokenValue.modulo(8);
        tokenValue = tokenValue.dividedToIntegerBy(8);

        var xyIncrement = getXYIncrement(dir.toNumber());
        moveList.push(xyIncrement);
        nextX = currX + xyIncrement.x;
        nextY = currY + xyIncrement.y;

        range.minX = (range.minX > nextX) ? nextX : range.minX;
        range.minY = (range.minY > nextY) ? nextY : range.minY;
        range.maxX = (range.maxX < nextX) ? nextX : range.maxX;
        range.maxY = (range.maxY < nextY) ? nextY : range.maxY;

        currX = nextX;
        currY = nextY;
    } while(tokenValue > 8);

    ctx.clearRect(0, 0, c.width, c.height);
    var currX = (c.width / 2) | 0;
    var currY = (c.height / 2) | 0;
    var biggestChange = Math.max(range.maxX - range.minX, range.maxY - range.minY);
    var increment = ((c.width / biggestChange) | 0) - 1;
    var xChange = (currX - ((range.maxX + range.minX) / 2)) * increment;
    var yChange = (currY - ((range.maxY + range.minY) / 2)) * increment;
    renderId++;
    var currRender = renderId;
    for (var i = 0; i < moveList.length; ++i) {
        ctx.beginPath();
        ctx.moveTo(currX + xChange, currY + yChange);

        nextX = currX + moveList[i].x * increment;
        nextY = currY + moveList[i].y * increment;

        ctx.lineTo(nextX + xChange, nextY + yChange);
        currX = nextX;
        currY = nextY;

        red   = (Math.sin(0.0117647059*5*(i) + 0) * 127 + 128) | 0;
        green = (Math.sin(0.0117647059*5*(i) + 2) * 127 + 128) | 0;
        blue  = (Math.sin(0.0117647059*5*(i) + 4) * 127 + 128) | 0;
        while (red.length < 2) { red = '0' + red; }
        while (green.length < 2) { green = '0' + green; }
        while (blue.length < 2) { blue = '0' + blue; }
        var str = red.toString(16) + green.toString(16) + blue.toString(16);
        ctx.strokeStyle="#" + str;

        ctx.stroke();

        // used to animate the drawing
        await sleepFor(15);

        // make sure we're still the active rendering
        if (currRender != renderId) {
            break;
        }
    }
};

// helper functions specifically for squiggle rendering
var getXYIncrement = function(dir) {
    var xyIncrement = new Object();
    switch (dir) {
        case 0: // Down-Right
            xyIncrement.x = 1;
            xyIncrement.y = -1;
            break;
        case 1:  // Right
            xyIncrement.x = 1;
            xyIncrement.y = 0;
            break;
        case 2:  // Up-Right
            xyIncrement.x = 1;
            xyIncrement.y = 1;
            break;
        case 3:  // Up
            xyIncrement.x = 0;
            xyIncrement.y = 1;
            break;
        case 4: // Up-Left
            xyIncrement.x = -1;
            xyIncrement.y = 1;
            break;
        case 5: // Left
            xyIncrement.x = -1;
            xyIncrement.y = 0;
            break;
        case 6: // Down-Left
            xyIncrement.x = -1;
            xyIncrement.y = -1;
            break;
        case 7: // Down
            xyIncrement.x = 0;
            xyIncrement.y = -1;
            break;
    }
    return xyIncrement;
};

// utility for sleeping for a certain time in an async function
var sleepFor = function(millis) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(true);
        }, millis);
    });
};
