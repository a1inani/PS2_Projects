// {"name": "Colored Triangle", "author": "Alinani", "version": "1.0", "file": "triangle.js"}

const font = new Font("default");

const v1 = { x: 320, y: 100 };
const v2 = { x: 200, y: 350 };
const v3 = { x: 440, y: 350 };

const color1 = Color.new(255, 0, 0, 128);
const color2 = Color.new(0, 255, 0, 128);
const color3 = Color.new(0, 0, 255, 128);

os.setInterval(() => {
    Screen.clear();

    draw.triangle(
        v1.x, v1.y,
        v2.x, v2.y,
        v3.x, v3.y,
        color1, color2, color3
    );

    font.print(10, 10, "Colored Triangle Demo");

    Screen.flip();
}, 0);