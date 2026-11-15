// status: ok (أخضر) / quiet (أصفر) / lost (أحمر) / rest (أزرق)
// plan + real = مقارنة "المخطط vs اللي حصل"، و big = رقم كبير
const extras = {
  "Apollo 11 Eagle": { status: "rest", statusText: "Resting since 1969",
    big: { num: "21 hours", label: "the astronauts spent on the Moon's surface" } },

  "Surveyor 1": { status: "quiet", statusText: "Last contact: 1967",
    big: { num: "11,000+", label: "photos sent back to Earth" } },

  "Surveyor 3": { status: "quiet", statusText: "Last contact: 1967",
    big: { num: "~2.5 years", label: "later, Apollo 12 astronauts visited me" } },

  "Apollo 14 science station (ALSEP)": { status: "quiet", statusText: "Switched off: 1977",
    big: { num: "6+ years", label: "of science sent to Earth" } },

  "Moon Buggy (Apollo 15)": { status: "rest", statusText: "Parked since 1971",
    big: { num: "28 km", label: "driven on the Moon" } },

  "Moon Buggy (Apollo 16)": { status: "rest", statusText: "Parked since 1972",
    big: { num: "27 km", label: "driven on the Moon" } },

  "Moon Buggy (Apollo 17)": { status: "rest", statusText: "Parked since 1972",
    big: { num: "36 km", label: "driven on the Moon" } },

  "Sojourner": { status: "lost", statusText: "Last contact: Sept 1997",
    plan: { text: "7 days", val: 7 }, real: { text: "83 days", val: 83 } },

  "Spirit": { status: "lost", statusText: "Last contact: March 2010",
    plan: { text: "90 days", val: 90 }, real: { text: "~6 years", val: 2190 } },

  "Opportunity": { status: "lost", statusText: "Last contact: June 2018",
    plan: { text: "90 days", val: 90 }, real: { text: "~15 years", val: 5300 } },

  "Viking 1": { status: "lost", statusText: "Last contact: Nov 1982",
    plan: { text: "90 days", val: 90 }, real: { text: "6+ years", val: 2300 } },

  "Viking 2": { status: "lost", statusText: "Last contact: 1980",
    big: { num: "~3.5 years", label: "working on Mars" } },

  "Phoenix": { status: "quiet", statusText: "Last contact: Nov 2008",
    plan: { text: "90 days", val: 90 }, real: { text: "~5 months", val: 150 } },

  "InSight": { status: "quiet", statusText: "Mission ended: Dec 2022",
    big: { num: "1,300+", label: "marsquakes detected" } },

  "Ingenuity": { status: "quiet", statusText: "Grounded: Jan 2024",
    plan: { text: "5 flights", val: 5 }, real: { text: "72 flights", val: 72 } },

  "Dawn": { status: "quiet", statusText: "Out of fuel: 2018",
    big: { num: "2 worlds", label: "orbited: Vesta and Ceres" } },

  "NEAR Shoemaker": { status: "quiet", statusText: "Last signal: Feb 2001",
    big: { num: "~2 weeks", label: "of signals after landing on an asteroid" } },

  "Pioneer 10": { status: "lost", statusText: "Last signal: Jan 2003",
    big: { num: "31 years", label: "of signals from deep space" } },

  "Pioneer 11": { status: "lost", statusText: "Last contact: 1995",
    big: { num: "22 years", label: "from launch to last contact" } },

  "Kepler": { status: "quiet", statusText: "Out of fuel: 2018",
    plan: { text: "3.5 years", val: 3.5 }, real: { text: "9 years", val: 9 } }
};