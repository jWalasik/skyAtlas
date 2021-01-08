export default function deviceInfo() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const webGL = (() => {
    if (!!window.WebGLRenderingContext) {
      var canvas = document.createElement("canvas"),
          names = ["webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
          context = false;

      for(var i=0;i< names.length;i++) {
        try {
          context = canvas.getContext(names[i]);
          if (context && typeof context.getParameter == "function") {
            // WebGL is enabled
            if (return_context) {
              // return WebGL object if the function's argument is present
              return {name:names[i], gl:context};
            }
            // else, return just true
            return true;
          }
        } catch(e) {}
      }
      // WebGL is supported, but disabled
      return false;
    }
    // WebGL not supported
    return false;
  })
  //apple devices handle orientation differently it was not tested

  //absolute orientation is experimental feature and mechanics are incompatible between browsers
  

  return {
    mobile: isMobile,
    webGL: webGL,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}