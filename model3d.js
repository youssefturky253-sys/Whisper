/* =====================================================================
   موديل 3D لكل جهاز: زرار "View in 3D" في الكارت
   - اسحب للتدوير، الـ scroll للتكبير، اضغط على أي جزء يطلع شرحه
   - زرار Listen بيقرأ شرح الجزء، واضغط تاني يوقف
   - الموديلات مبسّطة ومبنية بالكود (مش ملفات NASA CAD)
   محتاج three.js (r128) وبيتحمّل بعد app.js
   ===================================================================== */
(() => {
"use strict";
if (typeof THREE === "undefined") { console.warn("three.js مش متحمّل: الـ 3D متوقف"); return; }

/*DATA_START*/
const GOLD = "#c99a2e", FOIL = "#d8b04a", SILVER = "#cfcfcf", LIGHT = "#e6e6e6", SOLAR = "#2f3f7a",
  GRAY = "#8f8f8f", LEG = "#8d93a6", BLACK = "#14161d", DARKGRAY = "#55596a";
const sd = d => Math.sin(d * Math.PI / 180), cd = d => Math.cos(d * Math.PI / 180);

// كل عنصر: [part, shape, dims, pos, rot, color, opts]
//  box [w,h,d] | cyl [rTop,rBot,h,seg] | sph [r,sx,sy,sz] | cone [r,h,seg] | tor [R,r]
//  dish [r, زاوية العمق] (طبق فتحته لفوق) | rod [r,seg] من pos لـ rot (نقطة النهاية)

function tripod(p, part, r0, y0, r1, y1, rad, padR, start) {
  for (let i = 0; i < 3; i++) {
    const a = (start || 0) + i * 120;
    const s = [r0 * sd(a), y0, r0 * cd(a)], e = [r1 * sd(a), y1, r1 * cd(a)];
    p.push([part, "rod", [rad, 8], s, e, LEG]);
    p.push([part, "cyl", [padR, padR, .04, 16], [e[0], e[1] + .02, e[2]], null, GRAY]);
  }
}
function wheels(p, part, xs, zs, y, r, w, color) {
  xs.forEach(x => zs.forEach(z => p.push([part, "cyl", [r, r, w, 20], [x, y, z], [0, 0, 90], color || GRAY])));
}

function ingenuity() {
  const info = {
    blades: ["Rotor blades", "Two carbon-fiber rotors spin in opposite directions. Mars air is very thin, so the blades had to spin extremely fast (about 2,400 times a minute) to lift the helicopter."],
    solar: ["Solar panel", "A solar panel on top recharged the battery with sunlight."],
    antenna: ["Antenna", "A radio antenna. Ingenuity talked to Earth through the Perseverance rover and the Mars orbiters."],
    avionics: ["Body and avionics", "The body holds the helicopter's brain, which helped it navigate and fly. It has insulation and heaters so the electronics survived freezing Martian nights."],
    batteries: ["Batteries", "Six lithium-ion batteries powered the helicopter. (The body is see-through in this model, so you can look inside.)"],
    sensors: ["Sensors and cameras", "Sensors measured how fast the helicopter moved and in which direction. Cameras helped it see the ground below."],
    legs: ["Legs", "Four ultra-light carbon-fiber legs helped it land softly after each flight."]
  };
  const p = [];
  p.push(["blades", "box", [1.9, .025, .14], [0, 1.52, 0], [0, 15, 0], "#4a4a54"]);
  p.push(["blades", "box", [1.9, .025, .14], [0, 1.3, 0], [0, -75, 0], "#555560"]);
  p.push(["blades", "cyl", [.04, .04, .65, 10], [0, 1.43, 0], null, GRAY]);
  p.push(["solar", "box", [.95, .025, .5], [0, 1.74, 0], null, SOLAR]);
  p.push(["antenna", "rod", [.012, 6], [.38, 1.74, 0], [.38, 2.2, 0], "#dddddd"]);
  p.push(["avionics", "box", [.55, .5, .55], [0, .85, 0], null, "#d9d9d9", { op: .5 }]);
  p.push(["batteries", "box", [.34, .3, .34], [0, .85, 0], null, "#ff7a45"]);
  p.push(["sensors", "cyl", [.05, .05, .1, 12], [0, .62, .27], [90, 0, 0], BLACK]);
  p.push(["sensors", "cyl", [.035, .035, .08, 12], [.16, .64, .27], [90, 0, 0], BLACK]);
  [-1, 1].forEach(x => [-1, 1].forEach(z => {
    p.push(["legs", "rod", [.025, 8], [.2 * x, .62, .2 * z], [.78 * x, .02, .78 * z], LEG]);
    p.push(["legs", "cyl", [.09, .09, .02, 12], [.78 * x, .02, .78 * z], null, GRAY]);
  }));
  return { info, prims: p };
}

function eagle() {
  const info = {
    descent: ["Descent stage", "The bottom half. Its engine slowed the lander for the landing, and it also served as the launch pad. This half is still on the Moon today."],
    engine: ["Descent engine", "A rocket engine that could be throttled up and down, so the lander could slow down gently and touch down softly."],
    legs: ["Landing legs", "Four legs with wide footpads that spread the weight, so the lander would not sink into the Moon dust."],
    ladder: ["Ladder", "The ladder on the front leg. Neil Armstrong climbed down it to take the first step on the Moon."],
    ascent: ["Ascent stage", "The top half, the cabin where the two astronauts lived. Its engine flew them back up to meet their spaceship in orbit. Only the bottom half stayed on the Moon."],
    windows: ["Windows", "Small triangle-shaped windows, so the astronauts could see the ground while landing."],
    antenna: ["Antenna", "A dish antenna on top for talking to Earth."],
    thrusters: ["Thrusters", "Small rocket thrusters pushed the lander left, right, up and around to steer it in space."]
  };
  const p = [];
  p.push(["descent", "cyl", [.85, .95, .55, 8], [0, .6, 0], null, FOIL]);
  p.push(["engine", "cone", [.3, .5, 16], [0, .12, 0], [180, 0, 0], DARKGRAY]);
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([x, z]) => {
    p.push(["legs", "rod", [.045, 8], [.65 * x, .5, .65 * z], [1.55 * x, .02, 1.55 * z], LEG]);
    p.push(["legs", "cyl", [.22, .22, .04, 16], [1.55 * x, .03, 1.55 * z], null, "#a8a8a8"]);
  });
  p.push(["ladder", "rod", [.025, 6], [.07, 1.0, .62], [.07, .04, 1.5], LIGHT]);
  p.push(["ladder", "rod", [.025, 6], [-.07, 1.0, .62], [-.07, .04, 1.5], LIGHT]);
  p.push(["ascent", "cyl", [.55, .68, .8, 8], [0, 1.3, 0], null, "#b9bcc4"]);
  p.push(["windows", "box", [.22, .24, .03], [.18, 1.5, .6], [0, 10, 0], BLACK]);
  p.push(["windows", "box", [.22, .24, .03], [-.18, 1.5, .6], [0, -10, 0], BLACK]);
  p.push(["antenna", "rod", [.02, 6], [0, 1.7, 0], [0, 2.0, 0], LIGHT]);
  p.push(["antenna", "dish", [.32, 50], [0, 2.0, 0], [-35, 0, 0], LIGHT]);
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) =>
    p.push(["thrusters", "box", [.14, .14, .14], [.62 * x, 1.5, .42 * z], null, "#888888"]));
  return { info, prims: p };
}

function surveyor(scoop) {
  const info = {
    frame: ["Frame", "A light triangle-shaped frame of aluminum tubes held everything together, with a tall mast in the middle."],
    legs: ["Legs", "Three legs with shock absorbers and footpads. Surveyor touched down gently, which showed the Moon's ground could carry a spacecraft."],
    solar: ["Solar panel", "The solar panel on top of the mast turned sunlight into electricity to charge the battery."],
    antenna: ["Flat antenna", "A small flat antenna on top of the mast sent photos and data back to Earth."],
    camera: ["TV camera", "A TV camera looked through a tilting mirror to photograph the ground and the sky. This is how the pictures came home."],
    electronics: ["Warm compartments", "Two insulated boxes kept the batteries and electronics warm during the very cold lunar night."]
  };
  if (scoop) info.scoop = ["Scoop arm", "A small scoop on an arm. It dug trenches in the soil to test how strong the Moon's ground is."];
  const p = [];
  p.push(["frame", "cyl", [.7, .7, .08, 3], [0, .85, 0], null, "#b8bcc6"]);
  p.push(["frame", "rod", [.04, 8], [0, .85, 0], [0, 1.8, 0], "#b8bcc6"]);
  tripod(p, "legs", .7, .85, 1.35, .02, .035, .17);
  p.push(["solar", "box", [.85, .03, .6], [0, 1.84, 0], [8, 0, 0], SOLAR]);
  p.push(["antenna", "box", [.3, .03, .22], [0, 1.92, -.15], [8, 0, 0], LIGHT]);
  p.push(["camera", "cyl", [.07, .07, .32, 14], [0, 1.45, .16], [90, 0, 0], LIGHT]);
  p.push(["camera", "box", [.2, .02, .2], [0, 1.45, .36], [-45, 0, 0], "#9fc4ff"]);
  p.push(["electronics", "box", [.34, .3, .3], [.3, 1.1, .1], null, "#d8b24e"]);
  p.push(["electronics", "box", [.34, .3, .3], [-.32, 1.1, -.12], null, "#d8b24e"]);
  if (scoop) {
    p.push(["scoop", "rod", [.025, 6], [-.38, 1.0, .3], [-.95, .55, 1.05], LEG]);
    p.push(["scoop", "box", [.16, .07, .12], [-.95, .5, 1.08], null, LIGHT]);
  }
  return { info, prims: p };
}

function alsep() {
  const info = {
    station: ["Central station", "The brain of the science station. It received commands from Earth and sent the science data back."],
    rtg: ["Nuclear power unit (RTG)", "Heat from a small piece of plutonium turned into electricity, so the station could keep working through the long, freezing lunar night."],
    antenna: ["Antenna", "An antenna aimed at Earth, so the station could talk to scientists far away."],
    seismometer: ["Seismometer", "It listened for moonquakes and for meteorites hitting the Moon."],
    reflector: ["Laser reflector", "Scientists on Earth shoot laser beams at it and time how long the light takes to come back. That measures the distance to the Moon very precisely."]
  };
  const p = [];
  p.push(["station", "box", [.9, .5, .7], [0, .5, 0], null, FOIL]);
  p.push(["station", "box", [1.05, .03, .85], [0, .8, 0], null, LIGHT]);
  p.push(["antenna", "rod", [.025, 6], [.55, .3, .1], [.55, 1.4, .1], SILVER]);
  p.push(["antenna", "dish", [.32, 50], [.55, 1.4, .1], [-25, 0, 0], LIGHT]);
  p.push(["rtg", "cyl", [.17, .17, .7, 16], [1.7, .38, .2], null, DARKGRAY]);
  for (let i = 0; i < 4; i++) p.push(["rtg", "cyl", [.26, .26, .03, 16], [1.7, .12 + i * .18, .2], null, LEG]);
  p.push(["rtg", "rod", [.02, 6], [.45, .3, 0], [1.55, .2, .2], "#333333"]);
  p.push(["seismometer", "sph", [.28, 1, .75, 1], [-1.6, .2, .4], null, "#bfc3cf"]);
  p.push(["seismometer", "cyl", [.3, .3, .06, 16], [-1.6, .04, .4], null, GRAY]);
  p.push(["reflector", "rod", [.02, 6], [-.3, .02, 1.5], [-.3, .45, 1.5], LEG]);
  p.push(["reflector", "box", [.6, .04, .42], [-.3, .5, 1.5], [-65, 0, 0], "#9ec8ff"]);
  return { info, prims: p };
}

function lrv() {
  const info = {
    wheels: ["Wire-mesh wheels", "The wheels were made of woven metal wire, so they could never go flat and needed no air. Each wheel had its own electric motor."],
    chassis: ["Frame and batteries", "A light aluminum frame that folded flat to fit inside the lander on the way to the Moon. Two batteries powered the electric motors."],
    seats: ["Seats", "Two seats with seat belts, one for each astronaut."],
    control: ["Hand controller", "A T-shaped handle between the seats. Push it forward to go, pull it back to brake, and tilt it left or right to steer."],
    antenna: ["Dish antenna", "An umbrella-shaped dish that could be aimed at Earth to send TV pictures and messages."],
    camera: ["TV camera", "A TV camera that people on Earth could point from far away, to watch the astronauts at work."]
  };
  const p = [];
  p.push(["chassis", "box", [1.2, .12, 2.0], [0, .55, 0], null, "#bdbdbd"]);
  p.push(["chassis", "box", [.8, .22, .4], [0, .7, .85], null, "#d8b24e"]);
  wheels(p, "wheels", [-.78, .78], [-.7, .7], .34, .34, .18, "#9a9a9a");
  [-.25, .25].forEach(x => {
    p.push(["seats", "box", [.34, .08, .3], [x, .78, -.1], null, "#c8b88a"]);
    p.push(["seats", "box", [.34, .36, .06], [x, .98, -.28], null, "#c8b88a"]);
  });
  p.push(["control", "rod", [.02, 6], [0, .62, .28], [0, 1.0, .28], LIGHT]);
  p.push(["control", "rod", [.02, 6], [-.1, 1.0, .28], [.1, 1.0, .28], LIGHT]);
  p.push(["antenna", "rod", [.025, 6], [0, .62, .55], [0, 1.4, .55], SILVER]);
  p.push(["antenna", "dish", [.38, 60], [0, 1.42, .55], [-30, 0, 0], LIGHT]);
  p.push(["camera", "box", [.16, .12, .14], [0, 1.0, .98], null, LIGHT]);
  p.push(["camera", "cyl", [.04, .04, .1, 12], [0, 1.0, 1.08], [90, 0, 0], BLACK]);
  return { info, prims: p };
}

function sojourner() {
  const info = {
    panel: ["Solar panel", "The solar panel on top gave the rover power during the Martian day."],
    body: ["Warm electronics box", "A warm, insulated box kept the computer and batteries from freezing at night."],
    wheels: ["Six wheels", "Six metal wheels with cleats. Each wheel had its own motor."],
    suspension: ["Rocker-bogie suspension", "A clever suspension that let the rover climb over rocks without tipping over."],
    cameras: ["Front cameras", "Two front cameras and lasers helped the rover spot rocks in its way."],
    apxs: ["APXS instrument", "An instrument held against rocks and soil to find out which chemical elements they are made of."],
    antenna: ["Antenna", "A radio antenna. Sojourner talked to the Pathfinder lander, which passed the messages on to Earth."]
  };
  const p = [];
  p.push(["body", "box", [.9, .35, .6], [0, .5, 0], null, "#cfcfcf"]);
  p.push(["panel", "box", [.9, .03, .6], [0, .7, 0], null, SOLAR]);
  wheels(p, "wheels", [-.55, .55], [-.45, 0, .45], .16, .16, .12, GRAY);
  [-1, 1].forEach(s => {
    p.push(["suspension", "rod", [.025, 6], [.45 * s, .45, 0], [.55 * s, .16, .45], LEG]);
    p.push(["suspension", "rod", [.025, 6], [.45 * s, .45, 0], [.55 * s, .16, -.45], LEG]);
    p.push(["suspension", "rod", [.025, 6], [.45 * s, .45, 0], [.55 * s, .16, 0], LEG]);
  });
  p.push(["cameras", "cyl", [.04, .04, .1, 12], [.12, .55, .33], [90, 0, 0], BLACK]);
  p.push(["cameras", "cyl", [.04, .04, .1, 12], [-.12, .55, .33], [90, 0, 0], BLACK]);
  p.push(["apxs", "cyl", [.07, .07, .2, 14], [0, .32, -.4], null, "#e8c84a"]);
  p.push(["antenna", "rod", [.012, 6], [-.35, .7, -.25], [-.35, 1.25, -.25], LIGHT]);
  return { info, prims: p };
}

function mer() {
  const info = {
    deck: ["Solar panels", "Solar panels on top turned sunlight into electricity. Dust on them slowly reduced the power."],
    mast: ["Camera mast", "The rover's head: cameras on a mast that took panoramic pictures and helped pick where to drive."],
    hga: ["High-gain antenna", "A flat antenna for talking directly to Earth."],
    arm: ["Robotic arm", "An arm with four tools: a microscope camera, two instruments that identify chemical elements and minerals, and a grinder that scrapes the dusty surface off rocks."],
    wheels: ["Six wheels", "Six aluminum wheels, each with its own motor."],
    suspension: ["Rocker-bogie suspension", "The suspension lets the wheels move up and down to roll over rocks and bumps."],
    body: ["Warm electronics box", "The rover's body is an insulated box that keeps the computer and batteries warm."]
  };
  const p = [];
  p.push(["body", "box", [1.0, .35, .8], [0, .7, 0], null, "#c8c8c8"]);
  p.push(["deck", "box", [1.1, .04, .9], [0, .9, 0], null, SOLAR]);
  p.push(["mast", "rod", [.03, 8], [-.3, .9, .2], [-.3, 1.7, .2], LEG]);
  p.push(["mast", "box", [.35, .14, .14], [-.3, 1.75, .2], null, "#d9d9d9"]);
  p.push(["mast", "cyl", [.04, .04, .06, 12], [-.4, 1.75, .29], [90, 0, 0], BLACK]);
  p.push(["mast", "cyl", [.04, .04, .06, 12], [-.2, 1.75, .29], [90, 0, 0], BLACK]);
  p.push(["hga", "rod", [.02, 6], [.3, .9, -.25], [.3, 1.04, -.25], LEG]);
  p.push(["hga", "cyl", [.24, .24, .03, 6], [.3, 1.08, -.25], [-20, 0, 0], LIGHT]);
  p.push(["arm", "rod", [.035, 8], [.3, .7, .4], [.55, .55, .9], LEG]);
  p.push(["arm", "rod", [.035, 8], [.55, .55, .9], [.2, .45, 1.2], LEG]);
  p.push(["arm", "box", [.2, .18, .18], [.2, .45, 1.26], null, "#e8c84a"]);
  wheels(p, "wheels", [-.8, .8], [-.7, 0, .7], .22, .22, .2, GRAY);
  [-1, 1].forEach(s => {
    p.push(["suspension", "rod", [.03, 6], [.5 * s, .6, 0], [.8 * s, .22, .7], LEG]);
    p.push(["suspension", "rod", [.03, 6], [.5 * s, .6, 0], [.8 * s, .22, -.7], LEG]);
    p.push(["suspension", "rod", [.03, 6], [.5 * s, .6, 0], [.8 * s, .22, 0], LEG]);
  });
  return { info, prims: p };
}

function viking() {
  const info = {
    body: ["Main body", "The body holds the computer, the batteries and the science experiments, including ones that looked for signs of life in the soil."],
    legs: ["Landing legs", "Three legs with footpads. Viking was a lander, so it could not move after it touched down."],
    rtg: ["Nuclear power units (RTGs)", "Two RTGs turned heat into electricity, so Viking could keep working for years."],
    dish: ["Dish antenna", "A dish antenna that could turn to point straight at Earth."],
    arm: ["Scoop arm", "A long arm with a scoop collected soil samples and dropped them into the experiments."],
    cameras: ["Cameras", "Two cameras took color pictures of the red ground and sky."],
    weather: ["Weather boom", "A boom with sensors measured wind and temperature on Mars."]
  };
  const p = [];
  p.push(["body", "cyl", [.8, .8, .35, 6], [0, .8, 0], null, "#c9c9c9"]);
  tripod(p, "legs", .75, .75, 1.5, .02, .04, .2);
  [-1, 1].forEach(s => p.push(["rtg", "cyl", [.14, .14, .5, 12], [.55 * s, 1.1, -.5], [0, 0, 90], DARKGRAY]));
  p.push(["dish", "rod", [.025, 6], [.25, .98, .25], [.25, 1.35, .25], SILVER]);
  p.push(["dish", "dish", [.4, 50], [.25, 1.4, .25], [-25, 0, 0], LIGHT]);
  p.push(["arm", "rod", [.03, 8], [.7, .9, .2], [1.4, 1.0, 1.2], LEG]);
  p.push(["arm", "box", [.1, .1, .12], [1.42, 1.0, 1.25], null, "#e8c84a"]);
  [-.25, -.05].forEach(x => {
    p.push(["cameras", "rod", [.015, 6], [x, .98, .1], [x, 1.4, .1], SILVER]);
    p.push(["cameras", "cyl", [.06, .06, .18, 12], [x, 1.45, .1], null, BLACK]);
  });
  p.push(["weather", "rod", [.015, 6], [-.6, .9, .3], [-1.3, 1.3, .6], LEG]);
  p.push(["weather", "box", [.06, .06, .06], [-1.3, 1.32, .6], null, "#e8c84a"]);
  return { info, prims: p };
}

function phoenix() {
  const info = {
    deck: ["Deck", "The deck carried the instruments, including small ovens that heated soil samples to see what gases come out."],
    panels: ["Solar panels", "Two round solar panels unfolded like fans after landing and gave power during the Martian summer."],
    legs: ["Landing legs", "Three legs. Phoenix landed softly using rocket thrusters."],
    arm: ["Robotic arm", "A long robotic arm dug trenches and scooped up soil and ice."],
    mast: ["Camera mast", "A stereo camera on a mast, like eyes on a stalk, looked around the landing site."],
    met: ["Weather station", "A weather station with a laser (LIDAR) watched clouds and dust in the Martian sky."]
  };
  const p = [];
  p.push(["deck", "cyl", [.7, .7, .12, 8], [0, .8, 0], null, "#c9c9c9"]);
  [-1, 1].forEach(s => {
    p.push(["panels", "cyl", [.85, .85, .03, 28], [1.5 * s, .9, 0], null, SOLAR]);
    p.push(["panels", "rod", [.025, 6], [.6 * s, .85, 0], [.9 * s, .9, 0], LEG]);
  });
  tripod(p, "legs", .55, .75, 1.2, .02, .035, .16, 60);
  p.push(["arm", "rod", [.035, 8], [-.4, .88, .4], [-.9, 1.25, .9], LEG]);
  p.push(["arm", "rod", [.035, 8], [-.9, 1.25, .9], [-.55, .75, 1.35], LEG]);
  p.push(["arm", "box", [.16, .1, .14], [-.55, .72, 1.38], null, "#e8c84a"]);
  p.push(["mast", "rod", [.025, 6], [.2, .88, .2], [.2, 1.7, .2], SILVER]);
  p.push(["mast", "box", [.3, .1, .1], [.2, 1.75, .2], null, LIGHT]);
  p.push(["mast", "cyl", [.035, .035, .05, 10], [.1, 1.75, .27], [90, 0, 0], BLACK]);
  p.push(["mast", "cyl", [.035, .035, .05, 10], [.3, 1.75, .27], [90, 0, 0], BLACK]);
  p.push(["met", "rod", [.015, 6], [-.2, .88, -.3], [-.2, 1.5, -.3], SILVER]);
  p.push(["met", "cyl", [.07, .07, .14, 12], [-.2, 1.55, -.3], null, "#e8c84a"]);
  return { info, prims: p };
}

function insight() {
  const info = {
    deck: ["Deck", "The deck carried the electronics and held the robotic arm."],
    panels: ["Solar panels", "Two round solar panels powered the lander. When dust covered them, the power slowly ran out."],
    legs: ["Landing legs", "Three legs. InSight was a lander, so it stayed in one place for its whole mission."],
    arm: ["Robotic arm", "The arm picked up the science instruments from the deck and placed them gently on the ground."],
    seis: ["Seismometer (SEIS)", "The instrument that listened to marsquakes. It sits on the ground under a dome-shaped shield that protects it from wind and temperature changes."],
    hp3: ["Heat probe (the mole)", "A burrowing probe meant to hammer itself down and measure heat from inside Mars. It could not dig as deep as hoped because the soil was different than expected."],
    cameras: ["Cameras", "Cameras on the deck and on the arm showed engineers the ground around the lander."]
  };
  const p = [];
  p.push(["deck", "cyl", [.7, .7, .12, 6], [0, .75, 0], null, "#d0d0d0"]);
  [-1, 1].forEach(s => {
    p.push(["panels", "cyl", [.9, .9, .03, 28], [1.55 * s, .95, 0], null, SOLAR]);
    p.push(["panels", "rod", [.025, 6], [.6 * s, .85, 0], [.9 * s, .95, 0], LEG]);
  });
  tripod(p, "legs", .55, .7, 1.2, .02, .035, .16, 60);
  p.push(["arm", "rod", [.035, 8], [0, .82, .45], [0, 1.3, 1.0], LEG]);
  p.push(["arm", "rod", [.035, 8], [0, 1.3, 1.0], [0, .75, 1.7], LEG]);
  p.push(["arm", "box", [.2, .08, .2], [0, .72, 1.75], null, "#e8c84a"]);
  p.push(["seis", "sph", [.45, 1, .7, 1], [-.9, .16, 2.1], null, "#c0c0c0"]);
  p.push(["seis", "cyl", [.5, .5, .04, 20], [-.9, .02, 2.1], null, GRAY]);
  p.push(["hp3", "cyl", [.1, .1, .35, 12], [.8, .18, 2.0], null, "#caa43a"]);
  p.push(["cameras", "cyl", [.05, .05, .1, 10], [.3, .85, .45], [90, 0, 0], BLACK]);
  p.push(["cameras", "cyl", [.05, .05, .1, 10], [0, .78, 1.72], [90, 0, 0], BLACK]);
  return { info, prims: p };
}

function dawn() {
  const info = {
    bus: ["Main body", "The body holds the computers, the fuel and the science instruments."],
    arrays: ["Solar arrays", "Two very long solar panels made the electricity that powered Dawn's ion engines."],
    dish: ["Dish antenna", "A dish antenna for talking to Earth."],
    thrusters: ["Ion engines", "Instead of burning fuel, ion engines push with a stream of charged gas. The push is tiny but lasts for years, which let Dawn visit two different worlds."],
    cameras: ["Cameras and instruments", "A camera and spectrometers took pictures and measured what the surface of Vesta and Ceres is made of."]
  };
  const p = [];
  p.push(["bus", "box", [.7, .7, 1.0], [0, 0, 0], null, "#c8a64a"]);
  [-1, 1].forEach(s => {
    p.push(["arrays", "rod", [.025, 6], [.35 * s, 0, 0], [.7 * s, 0, 0], LEG]);
    p.push(["arrays", "box", [3.2, .03, 1.2], [2.3 * s, 0, 0], null, SOLAR]);
  });
  p.push(["dish", "rod", [.025, 6], [0, .35, 0], [0, .65, 0], SILVER]);
  p.push(["dish", "dish", [.45, 50], [0, .65, 0], null, LIGHT]);
  [[.2, 0], [-.2, 0], [0, .2]].forEach(([x, z]) => p.push(["thrusters", "cone", [.1, .26, 14], [x, -.48, z], [180, 0, 0], "#7fb8ff"]));
  p.push(["cameras", "cyl", [.07, .07, .22, 12], [.15, -.1, .55], [90, 0, 0], BLACK]);
  p.push(["cameras", "cyl", [.06, .06, .18, 12], [-.15, -.1, .55], [90, 0, 0], BLACK]);
  return { info, prims: p };
}

function near() {
  const info = {
    body: ["Main body", "The body holds the computer, the radios, the fuel and the instruments."],
    panels: ["Solar panels", "Four solar panels fixed to the body made the electricity."],
    dish: ["Dish antenna", "The dish is fixed to the body, so the whole spacecraft had to turn to point it at Earth."],
    imager: ["Camera", "A camera took pictures of the asteroid Eros, close up."],
    laser: ["Laser rangefinder", "A laser measured the distance to the asteroid's surface, to map its shape."],
    spectro: ["Spectrometers", "Instruments measured X-rays and gamma rays from the surface to learn which chemical elements it contains."]
  };
  const p = [];
  p.push(["body", "cyl", [.5, .5, .85, 8], [0, -.25, 0], null, "#c9a64a"]);
  [-1, 1].forEach(x => [-1, 1].forEach(z => {
    p.push(["panels", "rod", [.025, 6], [.45 * x, .1, .3 * z], [.8 * x, .15, .5 * z], LEG]);
    p.push(["panels", "box", [1.0, .03, .65], [1.3 * x, .15, .5 * z], null, SOLAR]);
  }));
  p.push(["dish", "rod", [.03, 6], [0, .15, 0], [0, .55, 0], SILVER]);
  p.push(["dish", "dish", [.5, 50], [0, .55, 0], null, LIGHT]);
  p.push(["imager", "cyl", [.1, .1, .35, 14], [.2, -.82, .1], null, BLACK]);
  p.push(["laser", "cyl", [.07, .07, .3, 14], [-.2, -.8, .1], null, "#6b6f7a"]);
  p.push(["spectro", "box", [.3, .2, .25], [0, -.78, -.22], null, "#e8c84a"]);
  return { info, prims: p };
}

function pioneer() {
  const info = {
    dish: ["Dish antenna", "A big dish, about 2.7 meters wide, kept pointing at Earth so its faint radio signal could cross billions of kilometers."],
    feed: ["Antenna feed", "The small antenna held in front of the dish by three struts. It sends and catches the radio waves."],
    bus: ["Main body", "A six-sided box behind the dish. It holds the electronics and the science instruments."],
    rtg: ["Nuclear power units (RTGs)", "Far from the Sun, solar panels would not work. Four RTGs on two booms turned heat into electricity."],
    boom: ["Magnetometer boom", "A long arm that keeps the magnetic sensor far away from the spacecraft's own electronics."],
    plaque: ["The plaque", "A gold-colored plate with a message for anyone who finds the spacecraft. It shows a man and a woman and tells where Earth is."]
  };
  const p = [];
  p.push(["dish", "dish", [1.3, 38], [0, 0, 0], [90, 0, 0], "#c9ccd6"]);
  p.push(["bus", "cyl", [.45, .45, .35, 6], [0, 0, -.35], [90, 0, 0], FOIL]);
  [0, 120, 240].forEach(a => p.push(["feed", "rod", [.015, 6], [1.2 * sd(a), 1.2 * cd(a), .22], [0, 0, 1.0], LEG]));
  p.push(["feed", "cyl", [.08, .08, .16, 12], [0, 0, 1.05], [90, 0, 0], FOIL]);
  [-1, 1].forEach(s => {
    p.push(["rtg", "rod", [.025, 6], [.4 * s, 0, -.4], [1.9 * s, 0, -.85], LEG]);
    p.push(["rtg", "rod", [.12, 12], [1.0 * s, 0, -.62], [1.4 * s, 0, -.72], DARKGRAY]);
    p.push(["rtg", "rod", [.12, 12], [1.45 * s, 0, -.74], [1.85 * s, 0, -.84], DARKGRAY]);
  });
  p.push(["boom", "rod", [.025, 6], [0, .4, -.45], [0, 1.9, -1.0], LEG]);
  p.push(["boom", "cyl", [.06, .06, .18, 10], [0, 1.95, -1.02], [70, 0, 0], FOIL]);
  p.push(["plaque", "box", [.45, .3, .02], [.55, -.62, .5], [0, -25, 0], "#e0bc4e"]);
  return { info, prims: p };
}

function kepler() {
  const info = {
    tube: ["Telescope tube", "The tube holds the mirror and the camera. It is wrapped in gold-colored insulation to keep the temperature steady."],
    shade: ["Sunshade", "A shade at the front that keeps sunlight out of the telescope."],
    mirror: ["Mirror", "A 1.4-meter mirror collected starlight and focused it on the camera."],
    camera: ["Camera (photometer)", "A giant digital camera with 42 sensors. It measured the brightness of about 150,000 stars at the same time."],
    solar: ["Solar panels", "Flat panels around the body made the electricity."],
    antenna: ["Antenna", "A flat antenna on the back sent the results to Earth."]
  };
  const p = [];
  p.push(["tube", "cyl", [.75, .75, 2.0, 24], [0, 0, 0], null, GOLD, { open: true, op: .55 }]);
  p.push(["shade", "cyl", [.8, .8, .55, 24], [0, 1.2, 0], null, "#e8e0c0", { open: true }]);
  p.push(["mirror", "dish", [.72, 38], [0, -.9, 0], null, "#9fb8d8"]);
  p.push(["camera", "cyl", [.3, .3, .12, 6], [0, .1, 0], null, DARKGRAY]);
  [[.35, .3], [-.35, .3], [0, -.4]].forEach(([x, z]) => p.push(["camera", "rod", [.02, 6], [x, .1, z], [x * 1.9, -.2, z * 1.9], LEG]));
  [0, 120, 240].forEach(a => p.push(["solar", "box", [.95, 1.4, .04], [.95 * sd(a), -.25, .95 * cd(a)], [0, a, 0], SOLAR]));
  p.push(["antenna", "cyl", [.3, .3, .03, 6], [0, -1.15, .4], [60, 0, 0], LIGHT]);
  return { info, prims: p };
}

const MAP = {
  "Apollo 11 Eagle": eagle,
  "Surveyor 1": () => surveyor(false),
  "Surveyor 3": () => surveyor(true),
  "Apollo 14 science station (ALSEP)": alsep,
  "Moon Buggy (Apollo 15)": lrv,
  "Moon Buggy (Apollo 16)": lrv,
  "Moon Buggy (Apollo 17)": lrv,
  "Sojourner": sojourner,
  "Spirit": mer,
  "Opportunity": mer,
  "Viking 1": viking,
  "Viking 2": viking,
  "Phoenix": phoenix,
  "InSight": insight,
  "Ingenuity": ingenuity,
  "Dawn": dawn,
  "NEAR Shoemaker": near,
  "Pioneer 10": pioneer,
  "Pioneer 11": pioneer,
  "Kepler": kepler
};
/*DATA_END*/

/* ---------------- بناء الموديل ---------------- */
const V3 = THREE.Vector3, rad = d => d * Math.PI / 180;

function buildModel(def) {
  const group = new THREE.Group(), meshes = [];
  def.prims.forEach(([part, shape, d, pos, rot, color, o]) => {
    o = o || {};
    let geo, rodEnd = null;
    if (shape === "box") geo = new THREE.BoxGeometry(d[0], d[1], d[2]);
    else if (shape === "cyl") geo = new THREE.CylinderGeometry(d[0], d[1], d[2], d[3] || 20, 1, !!o.open);
    else if (shape === "sph") geo = new THREE.SphereGeometry(d[0], 22, 16);
    else if (shape === "cone") geo = new THREE.ConeGeometry(d[0], d[1], d[2] || 20);
    else if (shape === "tor") geo = new THREE.TorusGeometry(d[0], d[1], 10, 28);
    else if (shape === "dish") {
      const r = d[0], ang = rad(d[1] || 50);
      geo = new THREE.SphereGeometry(r, 30, 10, 0, Math.PI * 2, Math.PI - ang, ang);
      geo.translate(0, r, 0);                 // قاع الطبق عند نقطة pos
    } else if (shape === "rod") {
      const a = new V3(pos[0], pos[1], pos[2]), b = new V3(rot[0], rot[1], rot[2]);
      geo = new THREE.CylinderGeometry(d[0], d[0], a.distanceTo(b), d[1] || 8);
      rodEnd = { a, b };
    }
    const mat = new THREE.MeshStandardMaterial({
      color, roughness: .55, metalness: .3, flatShading: true,
      side: (shape === "dish" || o.open) ? THREE.DoubleSide : THREE.FrontSide,
      transparent: o.op != null, opacity: o.op != null ? o.op : 1
    });
    const mesh = new THREE.Mesh(geo, mat);
    if (rodEnd) {
      mesh.position.copy(rodEnd.a).add(rodEnd.b).multiplyScalar(.5);
      mesh.quaternion.setFromUnitVectors(new V3(0, 1, 0), rodEnd.b.clone().sub(rodEnd.a).normalize());
    } else {
      mesh.position.set(pos[0], pos[1], pos[2]);
      if (rot) mesh.rotation.set(rad(rot[0]), rad(rot[1]), rad(rot[2]));
      if (shape === "sph" && d.length > 1) mesh.scale.set(d[1], d[2], d[3]);
    }
    mesh.userData.part = part;
    group.add(mesh);
    meshes.push(mesh);
  });
  return { group, meshes };
}

/* ---------------- الواجهة ---------------- */
const CUBE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>';
const holder = document.createElement("div");
holder.innerHTML = `
  <div id="m3d" hidden>
    <div class="m3dStage">
      <canvas id="m3dCanvas"></canvas>
      <div class="m3dTop">
        <div><small id="m3dTag"></small><h2 id="m3dName"></h2></div>
        <button id="m3dClose">✕ Close</button>
      </div>
      <p class="m3dHint">Drag to rotate · Scroll to zoom · Click a part</p>
    </div>
    <div class="m3dSide">
      <small class="m3dNote">Simplified model, not to scale</small>
      <h3 id="m3dPartName"></h3>
      <p id="m3dPartText"></p>
      <button id="m3dSay" class="m3dSay"></button>
      <div id="m3dParts"></div>
    </div>
  </div>`;
document.body.append(...holder.children);

const $ = id => document.getElementById(id);
const root = $("m3d"), canvas = $("m3dCanvas"), stage = root.querySelector(".m3dStage");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer, scene, camera, pivot, raycaster, stars;
let meshes = [], def = null, hoverPart = null, selPart = null, raf = 0;
let rotX = .25, rotY = 0, dist = 5.2, auto = true, moved = 0, downAt = null, pinch0 = 0;
const pointers = new Map();

function ensureScene() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#05070f");
  camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
  scene.add(new THREE.HemisphereLight("#ffffff", "#445066", .9));
  const sun = new THREE.DirectionalLight("#ffffff", .9);
  sun.position.set(4, 6, 5);
  scene.add(sun);
  const rim = new THREE.DirectionalLight("#ff9a6b", .35);
  rim.position.set(-5, 2, -4);
  scene.add(rim);
  const pts = [];
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), r = 30;
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a));
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: "#ffffff", size: .08 }));
  scene.add(stars);
  raycaster = new THREE.Raycaster();
  new ResizeObserver(resize).observe(stage);
}
function resize() {
  if (!renderer) return;
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function paint() {
  meshes.forEach(m => {
    const part = m.userData.part, mat = m.material;
    if (part === selPart) { mat.emissive.set("#ff7a45"); mat.emissiveIntensity = .6; }
    else if (part === hoverPart) { mat.emissive.set("#ffffff"); mat.emissiveIntensity = .28; }
    else { mat.emissive.set("#000000"); mat.emissiveIntensity = 0; }
  });
}

/* ---------------- القراءة بالصوت ---------------- */
const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
let sayOn = false, sayU = null;

function sayBtn() {
  const b = $("m3dSay");
  b.innerHTML = SPK + (sayOn ? "Stop" : "Listen");
  b.classList.toggle("on", sayOn);
}
function stopSay() {
  sayOn = false; sayU = null;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  sayBtn();
}
function readPart() {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const v = (typeof cur !== "undefined" && cur && VOICES[cur.name]) || DEFAULT_VOICE;
  const u = new SpeechSynthesisUtterance($("m3dPartName").textContent + ". " + $("m3dPartText").textContent);
  u.lang = "en-US"; u.pitch = v.pitch; u.rate = v.rate;
  u.onend = u.onerror = () => { if (u === sayU) { sayOn = false; sayBtn(); } };
  sayU = u;
  sayOn = true;
  sayBtn();
  speechSynthesis.speak(u);
}
$("m3dSay").onclick = () => sayOn ? stopSay() : readPart();
sayBtn();

function select(part) {
  selPart = part;
  const i = def.info[part];
  $("m3dPartName").textContent = i[0];
  $("m3dPartText").textContent = i[1];
  document.querySelectorAll(".m3dChip").forEach(b => b.classList.toggle("on", b.dataset.part === part));
  paint();
  if (sayOn) readPart();
}

function open3D(r) {
  stopSay();
  ensureScene();
  def = MAP[r.name]();
  if (pivot) {
    scene.remove(pivot);
    pivot.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }
  const built = buildModel(def);
  meshes = built.meshes;
  const box = new THREE.Box3().setFromObject(built.group);
  const size = box.getSize(new V3()), c = box.getCenter(new V3());
  const s = 2.6 / Math.max(size.x, size.y, size.z);
  built.group.scale.setScalar(s);
  built.group.position.copy(c).multiplyScalar(-s);
  pivot = new THREE.Group();
  pivot.add(built.group);
  if (r.world !== "space") {
    const R = Math.max(size.x, size.z) * s * .75 + .3;
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, .05, 48),
      new THREE.MeshStandardMaterial({ color: r.world === "moon" ? "#7d7f88" : "#9a5336", roughness: 1, flatShading: true }));
    ground.position.y = box.min.y * s + built.group.position.y - .03;
    pivot.add(ground);
  }
  scene.add(pivot);

  $("m3dName").textContent = r.name;
  $("m3dTag").textContent = r.tag;
  const parts = $("m3dParts");
  parts.innerHTML = "";
  Object.keys(def.info).forEach(k => {
    const b = document.createElement("button");
    b.className = "m3dChip";
    b.dataset.part = k;
    b.textContent = def.info[k][0];
    b.onclick = () => select(k);
    parts.appendChild(b);
  });
  hoverPart = selPart = null;
  $("m3dPartName").textContent = "Tap a part";
  $("m3dPartText").textContent = "Click any part of the machine, or pick one from the list, to see what it does.";
  paint();

  rotX = .25; rotY = .6; dist = 5.2; auto = !reduceMotion;
  root.hidden = false;
  document.body.style.overflow = "hidden";
  resize();
  cancelAnimationFrame(raf);
  loop();
}
function close3D() {
  stopSay();
  root.hidden = true;
  cancelAnimationFrame(raf);
  document.body.style.overflow = "";
}
function loop() {
  raf = requestAnimationFrame(loop);
  if (auto) rotY += .004;
  pivot.rotation.set(rotX, rotY, 0);
  camera.position.set(0, 0, dist);
  camera.lookAt(0, 0, 0);
  stars.rotation.y += .0004;
  renderer.render(scene, camera);
}

/* ---------------- التفاعل ---------------- */
function pick(e) {
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = raycaster.intersectObjects(meshes, false)[0];
  return hit ? hit.object.userData.part : null;
}
canvas.addEventListener("pointerdown", e => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  downAt = { x: e.clientX, y: e.clientY };
  moved = 0; auto = false;
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
  canvas.style.cursor = "grabbing";
});
canvas.addEventListener("pointermove", e => {
  const p = pointers.get(e.pointerId);
  if (!p) {
    if (e.pointerType === "mouse" && meshes.length) {
      const h = pick(e);
      if (h !== hoverPart) { hoverPart = h; paint(); canvas.style.cursor = h ? "pointer" : "grab"; }
    }
    return;
  }
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  if (pointers.size === 1) {
    rotY += dx * .008;
    rotX = Math.max(-.8, Math.min(1.1, rotX + dy * .006));
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    dist = Math.max(2.6, Math.min(9, dist * (pinch0 / (d || pinch0))));
    pinch0 = d;
  }
});
function up(e) {
  const wasOne = pointers.size === 1;
  pointers.delete(e.pointerId);
  canvas.style.cursor = "grab";
  if (wasOne && moved < 6 && downAt) {
    const part = pick(e);
    if (part) select(part);
  }
}
canvas.addEventListener("pointerup", up);
canvas.addEventListener("pointercancel", e => { pointers.delete(e.pointerId); });
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  dist = Math.max(2.6, Math.min(9, dist * (1 + e.deltaY * .001)));
}, { passive: false });
$("m3dClose").onclick = close3D;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !root.hidden) close3D(); });

/* ---------------- زرار في كارت الجهاز ---------------- */
const origRender = render;
render = function () {
  origRender();
  if (!cur || !MAP[cur.name]) return;
  const actions = document.querySelector("#card .actions");
  if (!actions) return;
  const b = document.createElement("button");
  b.className = "act";
  b.innerHTML = CUBE + "View in 3D";
  const r = cur;
  b.onclick = () => open3D(r);
  actions.appendChild(b);
};
if (cur) render();      // لو كارت مفتوح دلوقتي
})();