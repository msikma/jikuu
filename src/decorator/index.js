class Jikuu {
  constructor() {
    this.settings = {
      rev: null,
      layout: {
        photosetGutterSize: "5px"
      }
    }
  }

  /**
   * Decorates an element. This binds JS to a piece of HTML as soon as it's loaded in the DOM.
   * This is called from an inline <script> tag right after the relevant HTML is sent.
   *
   * @param {String} id ID string for the object to target
   */
  decorate(id) {
    const post = document.querySelector(id)

    // Check which post type this is and decorate accordingly.
    if (post.classList.contains('photoset')) {
      this.stylePhotoset(id)
    }
  }

  /**
   * Adds CSS classes to the photos in a photoset.
   */
  stylePhotoset(id) {
    // Grab the grid object which contains the actual photoset data.
    const grid = document.querySelector(id + ' .media.photoset-grid')

    // Layout is e.g. "23", for a row of 2 images and then a row of 3 images.
    const layout = grid.getAttribute('data-layout')
    const images = document.querySelectorAll(id + ' .media.photoset-grid > .image-container')

    // The gap in between photos.
    const gap = parseInt(this.settings.layout.photosetGutterSize, 10)
    const contentWidth = 500

    let n = 0
    let layoutPos = 0
    let layoutVal = Number(layout.slice(layoutPos, layoutPos + 1))
    let column
    let imgItem
    let calcWidth
    let calcHeight
    let columnHeight

    // Run through all images and add classes to indicate how big they should be.
    // E.g. rows of 2 photos and 3 photos has them get .photoset-image-2, and then .photoset-image-3.
    // Also 'first' and 'last' classes are added for each row.
    images.forEach(img => {
      if (layoutVal === 0) {
        // If the value is 0 (the Number() of the empty string), we're done.
        return
      }
      if (n === 0) {
        column = document.createElement('div')
        column.classList.add('photoset-row-' + String(layoutVal), 'row')
        img.classList.add('first')
        // Add a gap style if this is a 2 photo row.
        if (layoutVal === 2) {
          img.style.marginRight = (gap / 2 << 0) + 'px'
        }
      }

      // Determine the image's height. The column will be sized per the smallest item.
      imgItem = img.querySelector('img')
      calcWidth = (contentWidth - (gap * (layoutVal - 1))) / layoutVal
      calcHeight = calcWidth / (imgItem.getAttribute('width') / imgItem.getAttribute('height'))
      columnHeight = columnHeight == null ? calcHeight : columnHeight < calcHeight ? columnHeight : calcHeight

      img.classList.add('photoset-image-' + String(layoutVal), 'image')
      column.appendChild(img)

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

        column.style.height = columnHeight + 'px'
        column.style.borderBottom = gap + 'px solid white'
        grid.appendChild(column)
        // We've added classes to all photos in this row. Move on to the next.
        n = 0
        layoutPos += 1
        layoutVal = Number(layout.slice(layoutPos, layoutPos + 1))
        columnHeight = null
        return
      }
      n += 1
    })
  }

  // Passes on a configuration object from an inline script in the page's <head>.
  configure(settings) {
    this.settings = settings
  }
}

export default new Jikuu()
