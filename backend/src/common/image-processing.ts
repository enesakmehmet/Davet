// Load the native library only when an image is uploaded. Uploaded images are
// normally unique, so retaining a libvips operation cache provides little value.
let configuredSharp: typeof import('sharp') | undefined;

export function getImageProcessor(): typeof import('sharp') {
  if (!configuredSharp) {
    const sharp: typeof import('sharp') = require('sharp');
    sharp.cache(false);
    sharp.concurrency(1);
    configuredSharp = sharp;
  }
  return configuredSharp;
}
