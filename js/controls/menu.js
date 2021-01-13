import { debounce } from "../helperfunctions.js";
import { useLocation } from "./permissions.js"

const defaultSettings = {
  motionControl: (typeof window.orientation !== 'undefined') ? true : false,
  magnitudeFilter: 12.0,
  asterisms: true,
  boundaries: true,
  graticule: true,
  planets: true,
  names: false,
  twinkling: true
}

const Menu = async (initialValues) => {
  //load styles
  function loadStyles() {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link')
    link.href = 'css/menu.css'
    link.rel = 'stylesheet'
    link.type = 'text/css'
    head.appendChild(link)
  }
  loadStyles()

  //handle settings
  function updateSettings() {
    debounce(
      caches.open('skyAtlas-settings').then(cache => {
        const jsonRes = new Response(JSON.stringify(SETTINGS), {
          headers: {
            'conent-type': 'application/json'
          }
        })
        cache.put('skyAtlas-settings', jsonRes)
      }),
      500,
      true
    )    
  }
  function getSettings() {
    return caches.has('skyAtlas-settings').then(exists => {
      if(!exists) {
        return initialValues ? initialValues : defaultSettings
      } else {
        return caches.open('skyAtlas-settings').then(cache => 
          cache.match('skyAtlas-settings').then(settings => settings.json())
        )
      }
    }).then(settings => {
      console.log(settings)
      return settings
    })
    .catch(err => console.log(err))
  }
  const SETTINGS = window.settings = await getSettings()

  //Element Constructors
  const ToggleSwitch = (id, fn) => {
    const label = document.createElement('label')
    label.textContent = id

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.id = id
    input.checked = SETTINGS[id]
    input.addEventListener('change', fn)
    label.appendChild(input)
    //run function once to apply cached settings
    input.dispatchEvent(new Event('change'))
    return label
  }

  const Button = (id, fn) => {
    const button = document.createElement('button')
    button.textContent = id
    button.addEventListener('click', fn)
    return button
  }

  const Slider = (id, fn) => {
    const slider = document.createElement('div'),
          input = document.createElement('input')

    input.id = id
    input.type = 'range'
    input.value = SETTINGS.magnitudeFilter
    input.min = 0.0
    input.max = 12.0
    input.step = 0.1
    input.orient = 'vertical'

    input.className = 'slider'
    input.addEventListener('input', fn)
    input.dispatchEvent(new Event('input'))
    slider.appendChild(input)
    return slider
  }

  //MENU CONTAINER
  const menu = document.getElementById('menu')
  const navList = document.createElement('ul')

  function toggleMenu({clientX, clientY}) {
    menu.style.left = clientX + 'px'
    menu.style.top = clientY + 'px'
    menu.style.transform = 'translate(-50%, -50%)'
    
    menu.classList.toggle('menu--hidden')
  }
  menu.appendChild(navList)
  document.addEventListener('contextmenu', toggleMenu)

  //HANDLERS
  //visuals
  navList.appendChild(Slider('magnitudeFilter', filterStars))
  navList.appendChild(ToggleSwitch('asterisms', toggleItem))
  navList.appendChild(ToggleSwitch('boundaries', toggleItem))
  navList.appendChild(ToggleSwitch('graticule', toggleItem))
  navList.appendChild(ToggleSwitch('planets', toggleItem))
  navList.appendChild(ToggleSwitch('names', toggleItem))
  navList.appendChild(ToggleSwitch('twinkling', toggleAnimation))
  
  //sensors
  navList.appendChild(ToggleSwitch('motionControl', switchControls))
  navList.appendChild(Button('geolocation', useLocation))

  navList.addEventListener('input', updateSettings)

  //functions
  function filterStars(e) {
    window.settings[e.target.id] = e.target.value
    const value = e ? e.target.value : SETTINGS[e.target.id]
    const idx = Math.floor(value)
    const steps = [0,51,175,521,1616,5018,15450,41137,83112,107927,115505,117903,118735,118735] //magnitude ranges - 0.0, 1.0, 2.0 etc
    const interpolate = Math.round(steps[idx] + (steps[idx+1] - steps[idx]) * (value%1))
    window.scene.traverse(child => {
      if(child.type === 'Points') {
        child.geometry.setDrawRange(0, Math.round(interpolate))
      }
    })
  }
  
  function toggleItem(e) {
    window.settings[e.target.id] = e.target.checked
    window.scene.traverse(child => {
      if(child.name === e.target.id) {
        child.visible = e.target.checked
      }
    })
  }
  function toggleAnimation(e) {
    window.settings.twinkling = e.target.checked
  }
  
  function switchControls(e) {
    window.settings.twinkling = e.target.checked
    //device orientation controls does not support z axis ('zoom') movement and has to be set to default before
    if(window.controls.active.constructor.name !== 'DeviceOrientationControls') {
      window.camera.position.set(0,0,1)
    }
    window.controls.active.enabled = false
    window.controls.active = window.controls.options[(+e.target.checked)] //bool - int conversion
    window.controls.active.enabled = true
  }
}

export default Menu

