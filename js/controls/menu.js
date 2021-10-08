import { debounce } from "../helperfunctions.js";
import { useLocation } from "./permissions.js"
import * as THREE from '../lib/three.module.js'

const defaultSettings = {
  motionControl: (typeof window.orientation !== 'undefined') ? true : false,
  magnitudeFilter: 12.0,
  asterisms: true,
  boundaries: true,
  graticule: true,
  planets: true,
  names: false,
  twinkling: true,
  intensity: 1
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
  async function getSettings() {
    return caches.has('skyAtlas-settings').then(exists => {
      if(!exists) {
        return initialValues ? initialValues : defaultSettings
      } else {
        return caches.open('skyAtlas-settings').then(cache => 
          cache.match('skyAtlas-settings').then(settings => settings.json())
        )
      }
    })
    .catch(err => console.log(err))
  }
  const SETTINGS = window.settings = await getSettings()

  //Element Constructors
  const LI = (element) => {
    const li = document.createElement('li')
    li.classList.add('menu-item')
    //li.classList.add('--centered')
    li.appendChild(element)
    return li
  }
  const ToggleSwitch = (id, fn) => {
    const label = document.createElement('label')
    label.htmlFor = id
    label.classList = 'menu-item__label';

    const text = document.createElement('span')
    text.innerText = id.split(/(?=[A-Z])/).join(' ')
    text.style = 'text-transform: capitalize'
    label.appendChild(text)

    const input = document.createElement('input')
    input.hidden = true
    input.classList = 'menu-item__checkbox'
    input.type = 'checkbox'
    input.id = id
    input.checked = SETTINGS[id]
    input.addEventListener('change', fn)
    label.appendChild(input)
    //run function once to apply cached settings
    input.dispatchEvent(new Event('change'))
    return label
  }

  const Button = (id, fn, css) => {
    const button = document.createElement('button')
    button.id = id
    button.classList = css || 'menu-button menu-button__item'
    button.textContent = id.split(/(?=[A-Z])/).join(' ')
    button.addEventListener('click', fn)
    return button
  }

  const Slider = (id, fn, min, max, step) => {
    const slider = document.createElement('label'),
          input = document.createElement('input'),
          output = document.createElement('output')

    slider.innerText = id.split(/(?=[A-Z])/).join(' ')
    slider.classList = 'menu-item__slider'

    slider.appendChild(input)
    input.id = id
    input.type = 'range'
    input.min = min || 0.0
    input.max = max || 12.0
    input.step = step || 0.1
    input.orient = 'vertical'
    input.value = SETTINGS[id]
    input.classList = 'slider-input'

    output.classList = 'slider-output'
    output.htmlFor = id
    output.name= id+'-output'
    output.id = id+'-output'
    output.innerHTML = input.value;

    (async() => {
      //need to wait for dom operation to complete before accessing output
      await slider.appendChild(output)
      input.dispatchEvent(new Event('input'))
    })()

    input.addEventListener('input', fn)

    return slider
  }

  const container = document.getElementById('menu-container')
  const menu = document.getElementById('menu')
  const navList = document.createElement('ul')
  
  function toggleMenu({clientX, clientY}) {
    //menu opens on click/touch location, prevent it from going out of bounds
    const x = clientX.clamp(5 + container.clientWidth / 2, window.innerWidth - 5 - container.clientWidth / 2), 
          y = clientY.clamp(5 + container.clientHeight / 2, window.innerHeight - 5 - container.clientHeight / 2)
    container.style.left = x + 'px'
    container.style.top = y + 'px'

    container.style.transform = `translate(-50%, -50%) scale(${container.classList.contains('menu--open') ? 0 : 1 })`
    container.classList.toggle('menu--open')
  }

  function outsideClick(e) {
    if(e.target.tagName === 'CANVAS') menu.classList.remove('menu--open')
  }

  menu.appendChild(navList)
  menu.appendChild(Button('close', toggleMenu, 'menu-button menu-button__close'))
  document.addEventListener('contextmenu', toggleMenu)
  document.addEventListener('click', outsideClick)

  //HANDLERS
  //visuals
  navList.appendChild(LI(Slider('magnitudeFilter', filterStars)))
  navList.appendChild(LI(Slider('intensity', setIntensity, 0.5, 3, 0.1)))

  navList.appendChild(LI(ToggleSwitch('asterisms', toggleItem)))
  navList.appendChild(LI(ToggleSwitch('boundaries', toggleItem)))
  navList.appendChild(LI(ToggleSwitch('graticule', toggleItem)))
  navList.appendChild(LI(ToggleSwitch('planets', toggleItem)))
  navList.appendChild(LI(ToggleSwitch('names', toggleItem)))
  navList.appendChild(LI(ToggleSwitch('twinkling', toggleAnimation)))
  
  //sensors
  navList.appendChild(LI(ToggleSwitch('motionControl', switchControls)))
  navList.appendChild(LI(Button('geolocation', useLocation)))

  navList.addEventListener('input', updateSettings)

  //functions
  function filterStars(e) {
    window.settings[e.target.id] = e.target.value
    const value = e ? e.target.value : SETTINGS[e.target.id]
    const idx = Math.floor(value)
    const output = document.getElementById(`${e.target.id}-output`)
    output.innerHTML = e.target.value
    const steps = [0,51,175,521,1616,5018,15450,41137,83112,107927,115505,117903,118735,118735] //magnitude ranges - 0.0, 1.0, 2.0 etc
    const interpolate = Math.round(steps[idx] + (steps[idx+1] - steps[idx]) * (value%1))
    window.scene.traverse(child => {
      if(child.type === 'Points') {
        child.geometry.setDrawRange(0, Math.round(interpolate))
      }
    })
  }

  function setIntensity(e) {
    const prev = SETTINGS[e.target.id] !== e.target.value ? SETTINGS[e.target.id] : 1
    const output = document.getElementById(`${e.target.id}-output`)

    window.settings[e.target.id] = e.target.value
    output.innerHTML = e.target.value

    window.scene.traverse(child => {
      if(child.type === 'Points') {
        const newSizes = child.geometry.attributes.size.array.map(val => val / prev * e.target.value)
        child.geometry.setAttribute('size', new THREE.Float32BufferAttribute(newSizes, 1))
      }
    })
  }
  
  function toggleItem(e) {
    window.settings[e.target.id] = e.target.checked
    e.target.checked ? e.target.parentElement.classList.add('checked') : e.target.parentElement.classList.remove('checked')
    
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