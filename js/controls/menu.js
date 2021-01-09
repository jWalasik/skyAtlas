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

  const settings = caches.has('skyAtlas_settings').then(exists => {
    if(!exists) {
      return defaultSettings
    } else {
      return caches.open('skyAtlas_settings').then(settings => {
        console.log(settings)
        return settings
      })
    }
  }).catch(err => console.log(err))

  //HELPER FUNCTIONS
  const ToggleSwitch = (id) => {
    const label = document.createElement('label')
    label.textContent = id

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.id = id
    input.checked = true
    input.addEventListener('change', toggleItem)
    
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
  navList.appendChild(ToggleSwitch('asterisms'))
  navList.appendChild(ToggleSwitch('boundaries'))
  navList.appendChild(ToggleSwitch('graticule'))
  navList.appendChild(ToggleSwitch('planets'))
  navList.appendChild(ToggleSwitch('names'))
  navList.appendChild(ToggleSwitch('motion camera'))

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


  function switchCamera() {

  }
  document.addEventListener('contextmenu', toggleMenu)
  
  return null
}

export default Menu