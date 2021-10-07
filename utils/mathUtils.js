import Decimal from 'decimal.js';
import BLACKBODY from '../catalogs/blackbody.json';

// L₀, or zero point luminosity.
const BASE_LUMINOSITY = Decimal('3.0128e28');
// That crazy fucking fireball hovering nearby.
const SUN_LUMINOSITY = Decimal('3.828e26');

// Linear interpolation.
function lerp(a, b, t) {
  return (1 - t) * a + t * b;
}

// Formula that converts brightness and distance into absolute magnitude.
function calculateAbsoluteMagnitude(apparentBrightness, distance) {
  return apparentBrightness - 5 * Math.log10(distance / 10);
}

// Formula that converts absolute magnitude and distance into brightness.
function calculateVisualMagnitude(absoluteMagnitude, distance) {
  return absoluteMagnitude + (5 * Math.log10(distance / 10));
}

/**
 * Converts absolute magnitude to luminosity. When dealing with numbers larger
 * than 9e14, it's recommended you use string or Decimal to avoid loss of
 * accuracy. The numbers generated by this are huge and are thus returned as a
 * string.
 * @param {string|Decimal|number} absoluteMagnitude - Absolute magnitude of
 *   the star. Note that these are reverse logarithmic.
 * @param {string|Decimal|number} [baseLuminosity] - If not specified, will
 *   default to 3.0128e28.
 * @returns {string} - Power in watts.
 */
function calculateLuminosityWatts(absoluteMagnitude, baseLuminosity=BASE_LUMINOSITY) {
  // All you ever need to know about luminosity:
  // https://www.youtube.com/watch?v=HVJ7yMgsj3s
  absoluteMagnitude = Decimal(absoluteMagnitude).mul(-1); // Formula states -M
  baseLuminosity = Decimal(baseLuminosity);
  // let lum = baseLuminosity.div(SUN_LUMINOSITY);
  let lum = baseLuminosity;
  const ten = Decimal(10);

  const luminosity = lum.mul(
    ten.pow(absoluteMagnitude.div(2.512)),
  );

  return luminosity.toString();
}

/**
 * Converts absolute magnitude to luminosity relative to the sun (a.k.a L sub
 * naught). When dealing with numbers larger than 9e14, it's recommended you
 * use string or Decimal to avoid loss of accuracy. The numbers generated by
 * this are huge and are thus returned as a string.
 */
function calculateLuminosityLSub0(absoluteMagnitude, baseLuminosity=BASE_LUMINOSITY, sunLuminosity=SUN_LUMINOSITY) {
  const luminosity = Decimal(calculateLuminosityWatts(absoluteMagnitude, baseLuminosity));

  // Even the largest known luminosities are below 7 million, which in IEEE 754
  // terms are tiny and hold accuracy well enough.
  return luminosity.div(sunLuminosity).toNumber();
}

// Converts degrees to radians.
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Converts degrees to decimal.
function degToDecimal(degrees, minute, second) {
  let sign = 1;
  if (degrees < 0) {
    sign = -1;
  }

  const decimal = Math.abs(degrees) + (Math.abs(minute) / 60) + (Math.abs(second) / 3600);
  return decimal * sign;
}

// Converts right ascension to degrees.
function raToDecimal(hour, minute, second) {
  return (hour + (minute / 60) + (second / 3600)) * 15;
}

// Converts right ascension to radians.
function raToRadians(hour, minute, second) {
  return (raToDecimal(hour, minute, second) * Math.PI) / 180;
}

// Converts declination to radians.
function decToRadians(degrees, minute, second) {
  return (degToDecimal(degrees, minute, second) * Math.PI) / 180;
}

function convertCoordsToRadians({ rightAscension, declination }) {
  //
}

/**
 * Returns an approximate RGB vec3 (normalised) for the specified kelvin
 * temperature. Note that the specified value is rounded before looked up.
 * Allowed range is 50k to 100000k, anything outside that range will be clamped
 * to that range. Note that, due to the values being normalised, intensity is
 * discarded.
 * @param {number} kelvin
 */
function kelvinToRGB(kelvin) {
  // Thanks to these amazing links, we can approximate blackbody colours from
  // temperature:
  // http://www.fourmilab.ch/documents/specrend/
  // https://www.fourmilab.ch/documents/specrend/specrend.c
  if (kelvin < 50) {
    kelvin = 50;
  }
  if (kelvin > 100000) {
    kelvin = 100000;
  }
  const blackbody = BLACKBODY[Math.round(kelvin)];
  delete blackbody.x;
  delete blackbody.y;
  delete blackbody.z;
  return blackbody;
}


// I would really like to get the following working in future. I know it's
// *nearly* correct, but something in is wrong and produces bad results.
// So. Many. Coordinate. Systems.
// function raDecToAzAlt(ra, decl) {
//   const hourAngle = ((lst - ra) + 360) % 360;
//
//   const x = Math.cos(hourAngle * (Math.PI / 180)) * Math.cos(decl * (Math.PI / 180));
//   const y = Math.sin(hourAngle * (Math.PI / 180)) * Math.cos(decl * (Math.PI / 180));
//   const z = Math.sin(decl * (Math.PI / 180));
//
//   const xHor = x * Math.cos((90 - lat) * (Math.PI / 180)) - z * Math.sin((90 - lat) * (Math.PI / 180));
//   const yHor = y;
//   const zHor = x * Math.sin((90 - lat) * (Math.PI / 180)) + z * Math.cos((90 - lat) * (Math.PI / 180));
//
//   console.log('debug horizon:',{xHor,yHor,zHor});
//
//   const az = Math.atan2(yHor, xHor) * (180 / Math.PI) + 180;
//   const alt = Math.asin((zHor) * (180 / Math.PI));
//
//   return { az, alt };
// }

export {
  lerp,
  calculateAbsoluteMagnitude,
  calculateVisualMagnitude,
  calculateLuminosityWatts,
  calculateLuminosityLSub0,
  convertCoordsToRadians,
  raToDecimal,
  degToDecimal,
  raToRadians,
  decToRadians,
  kelvinToRGB,
}
