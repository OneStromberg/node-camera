var http = require("http");
var pngjs = require("pngjs");
var v4l2camera = require("v4l2camera");
var ipc  = require('node-ipc');

ipc.config.id   = 'api';
ipc.config.retry= 1500;

ipc.connectTo(
    'world',
    function(){
        ipc.of.world.on(
            'message',  //any event or message type your server listens for
            function(data){
                if (data.node == "board" && data.type == "api"){
                }
            }
        );
    }
);

var server = http.createServer(function (req, res) {
    res.writeHead(200, {
        "content-type": "image/png",
        "cache-control": "no-cache",
    });
    var png = toPng();
    return png.pack().pipe(res);
});
server.listen(3000);

var script = function () {
    window.addEventListener("load", function (ev) {
        var cam = document.getElementById("cam");
        (function load() {
            var img = new Image();
            img.addEventListener("load", function loaded(ev) {
                cam.parentNode.replaceChild(img, cam);
                img.id = "cam";
                cam = img;
                load();
            }, false);
            img.src = "/" + Date.now() + ".png";
        })();
    }, false);
};

var toPng = function () {
    var rgb = cam.toRGB();
    var png = new pngjs.PNG({
        width: cam.width, height: cam.height,
        deflateLevel: 1, deflateStrategy: 1,
    });
    var size = cam.width * cam.height;
    for (var i = 0; i < size; i++) {
        png.data[i * 4 + 0] = rgb[i * 3 + 0];
        png.data[i * 4 + 1] = rgb[i * 3 + 1];
        png.data[i * 4 + 2] = rgb[i * 3 + 2];
        png.data[i * 4 + 3] = 255;
    }
    return png;
};

var cam = new v4l2camera.Camera("/dev/video0")
console.log(cam.configGet());
/*if (cam.configGet().formatName !== "YUYV") {
    console.log("YUYV camera required");
    process.exit(1);
}*/
cam.configSet({width: 1920, height: 1080});
cam.start();
cam.capture(function loop() {
    cam.capture(loop);
});
