let myWorld;

class FlyingObject {
  constructor(x, y, z, worldOptions, offsetWidth, offsetHeight) {
    this.el = document.createElement("div");
    this.img_el = document.createElement("img");
    this.img_el.src =
      "https://dl.dropbox.com/s/gsi2nal4nd0smnf/image2vector.svg";
    this.img_el.width = 20;
    this.el.appendChild(this.img_el);
    this.pos = {
      x: x,
      y: y,
      z: z,
    };
    this.rotation = {
      axis: "X",
      value: 0,
      speed: 0,
      x: 0,
    };
    var i = Math.random();
    if (i > 0.5) {
      this.rotation.axis = "X";
    } else if (i > 0.25) {
      this.rotation.axis = "Y";
      this.rotation.x = 180 * Math.random() + 90;
    } else {
      this.rotation.axis = "Z";
      this.rotation.x = 360 * Math.random() - 180;
      this.rotation.speed = 3 * Math.random();
    }
    this.xSpeedVariation =  0.8 * Math.random() - 0.4;
    this.ySpeed = Math.random() + 1.5;
    this.path = {
      type: 1,
      start: 0,
    };
    this.image = 1;
    this.width = offsetWidth;
    this.height = offsetHeight;
    this.options = worldOptions;
    this.startTimestamp = window.performance.now();
    this.lastTimestamp = this.startTimestamp;
    this.alive = true;
  }

  updateObject(timestamp) {
    var deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    // Update its position
    var i =
      this.options.wind.speed(deltaTime, this.pos.y) + this.xSpeedVariation;
    this.pos.x -= i;
    this.pos.y += this.ySpeed;
    this.rotation.value += this.rotation.speed;
    transformElement(
      this.el,
      this.pos.x,
      this.pos.y,
      this.pos.z,
      this.rotation.value,
      this.rotation.axis
    );
    if (this.pos.x < -10 || this.pos.y > this.height + 10) {
      this.alive = false;
    }
    // Update its opacity
    var timeSinceCreation_sec = (timestamp - this.startTimestamp) / 1000;
    this.img_el.style.opacity = Math.max(0, 1.0 - timeSinceCreation_sec / 3);
  }
}

$(document).ready(function () {
  var World = function (t) {
    this.viewport = t;
    this.world = document.createElement("div");
    this.objects = [];
    this.numObjects = 3;
    this.options = {
      wind: {
        magnitude: 1.2,
        maxSpeed: 2,
        duration: 200,
        start: 0,
        speed: 0,
      },
    };
    this.width = this.viewport.offsetWidth;
    this.height = this.viewport.offsetHeight;
    this.timer = 0;

    this.updateGlobalFallingValues = function () {
      let vOptions = this.options.wind;
      if (0 === this.timer || this.timer > vOptions.start + vOptions.duration) {
        vOptions.magnitude = Math.random() * vOptions.maxSpeed;
        vOptions.duration = 50 * vOptions.magnitude + (20 * Math.random() - 10);
        vOptions.start = this.timer;
        var t = this.height;
        vOptions.speed = function (i, e) {
          var s = ((this.magnitude / 2) * (t - (2 * e) / 3)) / t;
          var somethingA =
            ((2 * Math.PI) / this.duration) * i + (3 * Math.PI) / 2;
          return s * Math.sin(somethingA) + s;
        };
      }
    };
  };

  World.prototype.init = function () {
    this.world.className = "heart-objects";
    this.viewport.appendChild(this.world);
    this.world.style.webkitPerspective = "400px";
    this.world.style.MozPerspective = "400px";
    this.world.style.oPerspective = "400px";
    this.world.style.perspective = "400px";
    var e = this;
    window.onresize = function () {
      e.width = e.viewport.offsetWidth;
      e.height = e.viewport.offsetHeight;
    };
  };

  World.prototype.render = function (timestamp) {
    this.updateGlobalFallingValues();
    for (var t = 0; t < this.objects.length; t++) {
      let heart = this.objects[t];
      if (heart === undefined) {
        continue;
      }
      if (!heart.alive) {
        heart.el.remove();
        delete this.objects[t];
        continue;
      }

      this.objects[t].updateObject(timestamp);
    }
    this.timer++;
    requestAnimationFrame(this.render.bind(this));
  };

  var parentDiv = document.querySelector(".parent-div");
  document.addEventListener("mousedown", mouse_down_event);
  myWorld = new World(parentDiv);
  myWorld.init();
  myWorld.render();
});

/** Callback for mousedown event
 * @param {object} e - event
 */
function mouse_down_event(e) {
  for (var t = 0; t < myWorld.numObjects; t++) {
    let i = new FlyingObject(
      e.clientX,
      e.clientY,
      0,
      myWorld.options,
      myWorld.viewport.offsetWidth,
      myWorld.viewport.offsetHeight
    );
    myWorld.objects.push(i);
    myWorld.world.appendChild(i.el);
  }
}

/**  Transform CSS element
 * @param {object} el - CSS Element to modify
 * @param {number} x - x translation
 * @param {number} y - y transation
 * @param {number} z - z translation
 * @param {number} rotationValue - Amount of rotation
 * @param {string} rotationAxis - Axis to rotate around.  Either 'X', 'Y', or 'Z'
 *
 */
function transformElement(el, x, y, z, rotationValue, rotationAxis) {
  var e = "";
  e += `translateX( ${x.toFixed(0)}px )`;
  e += `translateY( ${y.toFixed(0)}px )`;
  e += `translateZ( ${z.toFixed(0)}px )`;
  e += ` rotate${rotationAxis}( ${rotationValue.toFixed(0)}deg )`;
  if ("X" !== rotationAxis) {
    e += " rotateX(" + x + "deg )";
  }
  el.style.webkitTransform = e;
  el.style.MozTransform = e;
  el.style.oTransform = e;
  el.style.transform = e;
}
