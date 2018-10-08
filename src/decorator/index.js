// Jikuu - Tumblr Theme <https://github.com/msikma/jikuu>
// © 2009-2018, Michiel Sikma. MIT license.

import LuminousGalleryCaptions from './gallery'
import { highlightSyntax } from './syntax'

class Jikuu {
  constructor() {
    // Default settings, to be overridden by what's in the HTML.
    this.settings = {
      rev: null,
      layout: {
        layoutType: 'regular',
        photosetGutterSize: '5px'
      }
    }
    this.resizeEvent = false
    this.resizeCallbacks = []
    this.mainContentStyle = null
  }

  /**
   * Decorates an element. This binds JS to a piece of HTML as soon as it's loaded in the DOM.
   * This is called from an inline <script> tag right after the relevant HTML is sent.
   *
   * @param {String} id ID string for the object to target
   */
  decorate(id) {
    const el = document.querySelector(id)
    if (!el) return

    this._setWindowResize()

    if (el.classList.contains('type-text')) {
      this.decorateText(id)
    }

    // Check which post type this is and decorate accordingly.
    if (el.classList.contains('photoset')) {
      // Decorating a photoset or photo will also add the lightbox.
      this.stylePhotoset(id)
    }
  }

  /**
   * Adds syntax highlighting to any code that might be in a post.
   */
  decorateText(id) {
    const code = document.querySelectorAll(`${id} .html-content pre code`)
    if (!code.length) return

    // Preprocess the code blocks: if they don't have a language set,
    // don't try to guess the language inside. Just don't highlight it.
    code.forEach(cb => {
      if (!cb.classList.length) cb.classList.add('nohighlight')
    })
    // Add syntax highlighting.
    highlightSyntax(code)
  }

  /**
   * Adds a click handler to open the lightbox for every photoset or photo.
   */
  _addLightbox(id) {
    const images = document.querySelectorAll(id + ' .media.photoset-grid .image-container a:not(.lightbox-decorated)')
    new LuminousGalleryCaptions(images)
    images.forEach(img => img.classList.add('lightbox-decorated'))
  }

  /**
   * Creates a live style object from the main content object.
   * This allows us to see what layout we're currently seeing.
   */
  _getMainContentStyle() {
    if (this.mainContentStyle != null) return
    this.mainContentStyle = window.getComputedStyle(document.querySelector('#content_main'))
  }

  /**
   * Set up the window resize event.
   */
  _setWindowResize() {
    if (this.resizeEvent) return
    this.resizeEvent = true
    window.onresize = () => {
      this.resizeCallbacks.forEach(cb => cb())
    }
  }

  /**
   * Adds CSS classes to the photos in a photoset.
   */
  stylePhotoset(id) {
    // Ensure the main content styles are available.
    this._getMainContentStyle()

    // Grab the grid object which contains the actual photoset data.
    const grid = document.querySelector(id + ' .media.photoset-grid')

    // Layout is e.g. "23", for a row of 2 images and then a row of 3 images.
    const layout = grid.getAttribute('data-layout')
    const images = document.querySelectorAll(id + ' .media.photoset-grid > .image-container:not(.decorated)')

    // The gap in between photos.
    const gap = parseInt(this.settings.layout.photosetGutterSize, 10)
    const contentWidth = this.settings.layout.layoutType === 'regular' ? 500 : 770;

    let n = 0
    let layoutPos = 0
    let layoutVal = Number(layout.slice(layoutPos, layoutPos + 1))
    let row

    // Run through all images and add classes to indicate how big they should be.
    // E.g. rows of 2 photos and 3 photos has them get .photoset-image-2, and then .photoset-image-3.
    // Also 'first' and 'last' classes are added for each row.
    images.forEach(img => {
      if (layoutVal === 0) {
        // If the value is 0 (the Number() of the empty string), we're done.
        return
      }
      if (n === 0) {
        row = document.createElement('div')
        row.setAttribute('data-photoset-row', String(layoutVal))
        row.classList.add('photoset-row-' + String(layoutVal), 'row')
        img.classList.add('first')
        // Add a gap style if this is a 2 photo row.
        if (layoutVal === 2) {
          img.style.marginRight = (gap / 2 << 0) + 'px'
        }
      }

      // Also add 'decorated' to indicate that we've already processed this item.
      img.classList.add('photoset-image-' + String(layoutVal), 'image', 'decorated')
      row.appendChild(img)

      // Add a gap style on both sides if this is the middle picture of a 3 photo row.
      if (n === 1 && layoutVal === 3) {
        img.style.marginLeft = gap + 'px'
        img.style.marginRight = gap + 'px'
      }

      if (n === layoutVal - 1) {
        img.classList.add('last')

        // Add a gap style if this is the second picture in a 2 photo row.
        if (layoutVal === 2) {
          img.style.marginLeft = (gap / 2 << 0) + 'px'
        }

        row.style.borderBottom = gap + 'px solid white'
        grid.appendChild(row)
        // We've added classes to all photos in this row. Move on to the next.
        n = 0
        layoutPos += 1
        layoutVal = Number(layout.slice(layoutPos, layoutPos + 1))
        return
      }
      n += 1
    })

    // Now crop the images to the right size.
    const resizeRow = (contentWidth) => {
      const rows = document.querySelectorAll(id + ' .media.photoset-grid > .row')
      let calcHeight
      let calcWidth
      let imgItem
      let layoutVal
      let rowHeight
      rows.forEach(row2 => {
        const images = row2.querySelectorAll('.image-container')
        layoutVal = Number(row2.getAttribute('data-photoset-row'))
        rowHeight = null
        images.forEach(img => {
          imgItem = img.querySelector('img')
          calcWidth = (contentWidth - (gap * (layoutVal - 1))) / layoutVal
          calcHeight = calcWidth / (imgItem.getAttribute('width') / imgItem.getAttribute('height'))
          rowHeight = rowHeight == null ? calcHeight : rowHeight < calcHeight ? rowHeight : calcHeight
        })
        row2.style.height = rowHeight + 'px'
      })
    }

    let prevWidth
    const resizePost = () => {
      const currWidth = parseInt(this.mainContentStyle.width, 10)
      if (currWidth === prevWidth) return

      prevWidth = currWidth
      this.settings.layout.layoutType = currWidth === 500 ? 'regular' : 'wide'
      resizeRow(this.settings.layout.layoutType === 'regular' ? 500 : 770)
    }
    this.resizeCallbacks.push(resizePost)
    resizePost()

    // Finally, add the lightbox to the item.
    this._addLightbox(id)
  }

  // Passes on a configuration object from an inline script in the page's <head>.
  configure(settings) {
    this.settings = settings
  }
}

export default new Jikuu()
