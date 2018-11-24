// Jikuu - Tumblr Theme <https://github.com/msikma/jikuu>
// © 2008-2018, Michiel Sikma. MIT license.

import { Luminous, LuminousGallery } from 'luminous-lightbox'

// Our option modifications.
const jikuuLumOpts = {
  // Attach to #root so we can style it based on the user's settings.
  appendToSelector: '#root'
}

// Slight modification of the LuminousGallery to allow captions on a per-image basis.
export default class LuminousGalleryCaptions extends LuminousGallery {
  _constructLuminousInstances() {
    this.luminousInstances = []
    for (let i = 0; i < this.triggers.length; i++) {
      const caption = el => el.getAttribute('data-caption')
      const lum = new Luminous(this.triggers[i], { ...this.luminousOpts, caption, ...jikuuLumOpts })
      this.luminousInstances.push(lum)
    }
  }
}
