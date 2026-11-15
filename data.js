const rovers = [

 { name: "Apollo 11 Eagle", world: "moon", lat: 0.67, lng: 23.47, icon: "🚀", tag: "Lunar module • 1969",
    photos: ["Apollo 11"],
    parts: [
      "Hi! I am the Eagle, the lunar module that carried two astronauts to the Moon.",
      "I had two halves. The top half flew the astronauts back up to their spaceship. The bottom half, my descent stage, was the launch pad.",
      "My descent stage is still sitting in the Sea of Tranquility today."
    ],
    fact: "I have been sitting here since July 1969.",
    link: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C" },
  { name: "Surveyor 1", world: "moon", lat: -2.45, lng: -43.34, icon: "📷", tag: "Robotic lander • 1966",
    photos: ["surveyor 1"],
    parts: [
      "Before astronauts came, someone had to check if the Moon's ground was safe. That was my job!",
      "In June 1966 I made the first soft landing on the Moon by a US spacecraft.",
      "I sent back photos that showed the surface could hold a spacecraft."
    ],
    fact: "I sent back more than 11,000 photos.",
    link: "https://nssdc.gsfc.nasa.gov/" },

  { name: "Surveyor 3", world: "moon", lat: -3.01, lng: -23.42, icon: "🦾", tag: "Robotic lander • 1967",
    photos: ["Surveyor 3"],
    parts: [
      "I landed on the Moon in 1967 and dug in the soil with a little scoop arm.",
      "Two years later, Apollo 12 astronauts landed close to me and walked over for a visit.",
      "They took my camera back to Earth, so scientists could study how it survived on the Moon."
    ],
    fact: "Part of me came home to Earth!",
    link: "https://science.nasa.gov/mission/surveyor-3/" },

  { name: "Apollo 14 science station (ALSEP)", world: "moon", lat: -3.65, lng: -17.47, icon: "📡", tag: "Science station • 1971",
    photos: ["Apollo 14"],
    parts: [
      "I am a set of science instruments left on the Moon by Apollo astronauts.",
      "I have sensors like seismometers, which listen for moonquakes.",
      "I kept sending science to Earth for years after the astronauts went home."
    ],
    fact: "Scientists still bounce lasers off the mirrors left on the Moon by Apollo 11, 14 and 15.",
    link: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C" },

  { name: "Moon Buggy (Apollo 15)", world: "moon", lat: 26.13, lng: 3.63, icon: "🚙", tag: "Rover • 1971",
    photos: ["apollo15", "Apollo 15"],
    parts: [
      "I am the first Moon buggy ever driven, built to carry two astronauts and their tools.",
      "I explored a deep canyon called Hadley Rille.",
      "When the mission ended, I was parked on the Moon for good."
    ],
    fact: "The astronauts drove about 28 km (17 miles) in me.",
    link: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C" },

  { name: "Moon Buggy (Apollo 16)", world: "moon", lat: -8.97, lng: 15.50, icon: "🚙", tag: "Rover • 1972",
    photos: ["apollo16", "Apollo 16"],
    parts: [
      "I helped astronauts explore the Descartes Highlands, an area of old mountains.",
      "We collected rocks that are among the oldest ever brought back from the Moon.",
      "Now I wait here, quietly, on the Moon."
    ],
    fact: "I traveled about 27 km (17 miles).",
    link: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C" },

  { name: "Moon Buggy (Apollo 17)", world: "moon", lat: 20.19, lng: 30.77, icon: "🚙", tag: "Rover • 1972",
    photos: ["apollo 17", "Apollo 17"],
    parts: [
      "I carried the last astronauts who walked on the Moon, in December 1972.",
      "We drove through the Taurus-Littrow valley and collected rocks.",
      "After they left, I stayed behind."
    ],
    fact: "The astronauts drove me about 36 km (22 miles) and I reached about 18 km/h!",
    link: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C" },

  // ---------- MARS ----------
  { name: "Sojourner", world: "mars", lat: 19.13, lng: -33.22, icon: "🤖", tag: "Rover • 1997",
    photos: ["Sojourner Rover"],
    parts: [
      "I was the first rover to ever drive on Mars, and I was about as big as a microwave oven.",
      "I rolled around the Pathfinder lander, my base, and studied rocks and soil.",
      "I proved that little rovers could explore Mars. Bigger ones came after me."
    ],
    fact: "I traveled only about 100 meters in total!",
    link: "https://science.nasa.gov/mission/mars-pathfinder/" },

  { name: "Spirit", world: "mars", lat: -14.57, lng: 175.47, icon: "🤖", tag: "Rover • 2004",
    photos: ["Spirit Rover"],
    parts: [
      "I landed in Gusev Crater in 2004, with a twin named Opportunity on the other side of Mars.",
      "I was only supposed to work for 90 days. I worked for six years!",
      "In 2009 I got stuck in soft sand, and I last phoned home in 2010."
    ],
    fact: "I found signs that Mars once had hot water.",
    link: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/" },

  { name: "Opportunity", world: "mars", lat: -1.95, lng: -5.53, icon: "🤖", tag: "Rover • 2004",
    photos: ["Rover Opportunity"],
    parts: [
      "I am Spirit's twin. I was also built to work for just 90 days.",
      "I kept going for almost 15 years, exploring a flat plain called Meridiani Planum.",
      "In 2018 a giant dust storm blocked the sunlight for my solar panels, and I went quiet."
    ],
    fact: "I drove more than 45 km, farther than a marathon!",
    link: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/" },

  { name: "Viking 1", world: "mars", lat: 22.27, lng: -47.95, icon: "🔬", tag: "Lander • 1976",
    photos: ["Viking Lander"],
    parts: [
      "In 1976 I became the first US lander to work on Mars.",
      "I took color photos of the red ground and sky.",
      "I also ran experiments on the soil, looking for signs of life."
    ],
    fact: "I kept working for more than six years.",
    link: "https://science.nasa.gov/mission/viking-1/" },

  { name: "Viking 2", world: "mars", lat: 47.67, lng: 134.26, icon: "❄️", tag: "Lander • 1976",
    photos: ["Viking 2 Lander"],
    parts: [
      "I landed on the cold northern plains of Mars, Viking 1's sister lander.",
      "Landers can't move, so I stayed exactly where I touched down.",
      "I sent photos and weather reports back to Earth."
    ],
    fact: "I photographed frost on the Martian ground.",
    link: "https://science.nasa.gov/mission/viking-1/" },

  { name: "Phoenix", world: "mars", lat: 68.22, lng: -125.7, icon: "⛏️", tag: "Lander • 2008",
    photos: ["Phoenix Lander"],
    parts: [
      "I landed near the north pole of Mars in 2008.",
      "I dug into the ground with my robotic arm.",
      "I found water ice just under the soil. Then winter came, and my solar panels ran out of sunlight."
    ],
    fact: "I confirmed water ice on Mars by digging it up myself.",
    link: "https://nssdc.gsfc.nasa.gov/" },

  { name: "InSight", world: "mars", lat: 4.50, lng: 135.62, icon: "🎧", tag: "Lander • 2018",
    photos: ["InSight Lander"],
    parts: [
      "My job was to listen to the inside of Mars.",
      "My seismometer felt the planet shake, which are called marsquakes.",
      "In 2022 dust covered my solar panels and I lost power."
    ],
    fact: "I detected more than 1,300 marsquakes.",
    link: "https://science.nasa.gov/mission/insight/" },

  { name: "Ingenuity", world: "mars", lat: 18.44, lng: 77.45, icon: "🚁", tag: "Helicopter • 2021",
    photos: ["Ingenuity Helicopter"],
    parts: [
      "I am the first aircraft to fly on another planet!",
      "I was only supposed to make 5 flights. I made 72.",
      "In 2024 my rotor blades got damaged, so I stay on the ground now."
    ],
    fact: "I carried a tiny piece of the Wright brothers' 1903 airplane.",
    link: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/" },

  // ---------- DEEP SPACE ----------
  { name: "Dawn", world: "space", icon: "🛰️", tag: "Orbiter • 2007",
    photos: ["Dawn Spacecraft Processing"],
    parts: [
      "I visited two worlds in the asteroid belt: Vesta first, then Ceres.",
      "I was the first spacecraft to orbit two different worlds beyond Earth's Moon.",
      "In 2018 I ran out of fuel, but I'm still circling Ceres."
    ],
    fact: "I will keep circling Ceres, with no power, for decades.",
    link: "https://science.nasa.gov/mission/dawn/" },

  { name: "NEAR Shoemaker", world: "space", icon: "☄️", tag: "Probe • 2001",
    photos: ["NEAR Shoemaker"],
    parts: [
      "I was the first spacecraft to orbit an asteroid, a rock called Eros.",
      "In 2001 my team tried something new: landing on it!",
      "I was not built to land, but I kept sending signals from the surface."
    ],
    fact: "I kept talking to Earth for about two weeks after landing.",
    link: "https://science.nasa.gov/mission/near-shoemaker/" },

  { name: "Pioneer 10", world: "space", icon: "🛰️", tag: "Probe • 1972",
    photos: ["Pioneer 10"],
    parts: [
      "I launched in 1972 and was the first to fly past Jupiter.",
      "Now I drift silently out of the solar system.",
      "I carry a plaque that shows where humans live, just in case someone finds me."
    ],
    fact: "My plaque is a message to aliens!",
    link: "https://science.nasa.gov/mission/pioneer-10/" },

  { name: "Pioneer 11", world: "space", icon: "🪐", tag: "Probe • 1973",
    photos: ["Pioneer 11"],
    parts: [
      "I followed Pioneer 10 to Jupiter.",
      "Then I became the first spacecraft to fly past Saturn, in 1979.",
      "I'm now drifting out of the solar system."
    ],
    fact: "My last contact with Earth was in 1995.",
    link: "https://science.nasa.gov/mission/pioneer-10/" },

  { name: "Kepler", world: "space", icon: "🔭", tag: "Space telescope • 2009",
    photos: ["Kepler Space Telescope"],
    parts: [
      "I stared at one patch of sky, watching for stars that dim a tiny bit.",
      "That dimming happens when a planet passes in front of its star.",
      "In 2018 I ran out of fuel. I now drift in space, trailing behind Earth."
    ],
    fact: "I helped find more than 2,600 planets around other stars.",
    link: "https://science.nasa.gov/mission/kepler/" }
];