// {"name": "Colored Triangle", "author": "Alinani", "version": "1.0", "file": "triangle.js"}

var font = new Font("default");
var pad = Pads.get(0);

var v1 = { x: 320, y: 100 };
var v2 = { x: 200, y: 350 };
var v3 = { x: 440, y: 350 };

var color1 = Color.new(255, 0, 0, 128);
var color2 = Color.new(0, 255, 0, 128);
var color3 = Color.new(0, 0, 255, 128);

os.setInterval(() => {
    Screen.clear();
    pad.update();
    // In your app, to return to file manager:
    if (pad.justPressed(Pads.SELECT)) {
        std.loadScript("host:/main.js");
    }
    font.print(10, 20, "Select: Return to Dashboard");

    Draw.triangle(
        v1.x, v1.y,
        v2.x, v2.y,
        v3.x, v3.y,
        color1, color2, color3
    );

    font.print(10, 10, "Colored Triangle Demo");

    Screen.flip();
}, 0);