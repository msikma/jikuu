class Jikuu {
  constructor() {
    this.settings = {}
  }

  /**
   * Decorates an element. This binds JS to a piece of HTML as soon as it's loaded in the DOM.
   * This is called from an inline <script> tag right after the relevant HTML is sent.
   * 
   * @param {String} id ID string for the object to target
   */
  decorate(id) {
    console.log(id);
  }

  // Passes on a configuration object from an inline script in the page's <head>.
  configure(settings) {
    this.settings = settings
  }
}

export default new Jikuu()