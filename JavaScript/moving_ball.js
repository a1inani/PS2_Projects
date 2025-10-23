// Example App that can return to File Manager
// Save this as "example_app.js"
//
// To return to file manager, press SELECT

var font = new Font("default");
var pad = Pads.get(0);

var x = 320;
var y = 224;
var colorHue = 0;

os.setInterval(() => {
    Screen.clear();
    pad.update();
    
    // Move with D-Pad
    if (pad.pressed(Pads.UP)) y -= 3;
    if (pad.pressed(Pads.DOWN)) y += 3;
    if (pad.pressed(Pads.LEFT)) x -= 3;
    if (pad.pressed(Pads.RIGHT)) x += 3;
    
    // Keep in bounds
    x = Math.max(20, Math.min(620, x));
    y = Math.max(20, Math.min(428, y));
    
    // Animate color
    colorHue += 2;
    if (colorHue >= 360) colorHue = 0;
    
    // Simple HSV to RGB (simplified)
    var r = Math.floor(128 + 127 * Math.sin(colorHue * Math.PI / 180));
    var g = Math.floor(128 + 127 * Math.sin((colorHue + 120) * Math.PI / 180));
    var b = Math.floor(128 + 127 * Math.sin((colorHue + 240) * Math.PI / 180));
    
    var color = Color.new(r, g, b, 128);
    
    // Draw moving circle
    Draw.circle(x, y, 30, color, true);
    
    // Draw instructions
    font.color = Color.new(255, 255, 255, 128);
    font.scale = 1.0;
    font.print(10, 10, "Example App - Moving Circle");
    font.scale = 0.8;
    font.print(10, 35, "D-Pad: Move");
    font.print(10, 55, "SELECT: Return to File Manager");
    font.print(10, 400, `Position: ${Math.floor(x)}, ${Math.floor(y)}`);
    
    // Return to file manager on SELECT
    if (pad.justPressed(Pads.SELECT)) {
        // Use std.reload to completely restart with the file manager
        std.reload("host:/main.js");
    }
    
    Screen.flip();
}, 0);