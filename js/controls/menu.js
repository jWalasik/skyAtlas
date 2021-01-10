const defaultSettings = {
  motionControl: (typeof window.orientation !== 'undefined') ? 1 : 0
}

const Menu = (scene) => {
  //load styles
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link')
  link.href = 'css/menu.css'
  link.rel = 'stylesheet'
  link.type = 'text/css'
  head.appendChild(link)

  let settings
  caches.has('skyAtlas_settings').then(exists => {
    if(!exists) {
      settings = defaultSettings
    } else {
      return caches.open('skyAtlas_settings').then(cachedSettings => {
        settings = cachedSettings
      })
    }
  }).catch(err => console.log(err))

  //HELPER FUNCTIONS
  const ToggleSwitch = (id, fn) => {
    const label = document.createElement('label')
    label.textContent = id

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.id = id
    input.checked = true
    input.addEventListener('change', fn)
    
    label.appendChild(input)
    return label
  }

  //MENU CONTAINER
  const menu = document.getElementById('menu')
  const navList = document.createElement('ul')

  // DISPLAY CONTROL
  //magnitude filter
  const slider = document.createElement('div'),
        inputMag = document.createElement('input')

  inputMag.type = 'range'
  inputMag.value = 13.0
  inputMag.min = 0.0
  inputMag.max = 13.0
  inputMag.step = 0.1
  inputMag.orient = 'vertical'

  inputMag.className = 'slider'
  inputMag.addEventListener('input', filterStars)
  slider.appendChild(inputMag)

  navList.appendChild(slider)

  //asterisms  
  navList.appendChild(ToggleSwitch('asterisms', toggleItem))
  navList.appendChild(ToggleSwitch('boundaries', toggleItem))
  navList.appendChild(ToggleSwitch('graticule', toggleItem))
  navList.appendChild(ToggleSwitch('planets', toggleItem))
  navList.appendChild(ToggleSwitch('names', toggleItem))
  navList.appendChild(ToggleSwitch('motion camera', switchControls))

  menu.appendChild(navList)

  function filterStars(e) {
    const value = e.target.value * 4800 // 4800 - step of 1.0 = stars qty/max input
    const steps = [0,51,175,521,1616,5018,15450,41137,83112,107927,115505,117903,118735,118735] //magnitude ranges - 0.0, 1.0, 2.0 etc
    const interpolate = e.target.value % 1
    scene.traverse(child => {
      if(child.type === 'Points') {
        child.geometry.setDrawRange(0, value)
      }
    })
  }

  function toggleItem(e) {
    scene.traverse(child => {
      console.log(child.name)
      if(child.name === e.target.id) {
        child.visible = !child.visible
      }
    })
  }

  function toggleMenu({clientX, clientY}) {
    menu.style.left = clientX + 'px'
    menu.style.top = clientY + 'px'
    menu.style.transform = 'translate(-50%, -50%)'
    
    menu.classList.toggle('menu--hidden')
  }

  function toggleGeolocation() {

  }

  function switchControls() {
    //device orientation controls does not support z axis ('zoom') movement and has to be set to default before
    if(window.controls[1].constructor.name === 'DeviceOrientationControls') {
      window.camera.position.set(0,0,1) //z has to be greater than zero due to prevent gimbal glitch
    }
    
    window.controls.reverse()
    window.controls[0].enabled=true
    window.controls[1].enabled=false
  }

  document.addEventListener('contextmenu', toggleMenu)
}

export default Menu