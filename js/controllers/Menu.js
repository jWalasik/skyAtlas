const Menu = (scene) => {
  //load styles
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link')
  link.href = './css/menu.css'
  link.rel = 'stylesheet'
  link.type = 'text/css'
  head.appendChild(link)

  const menu = document.getElementById('menu')

  const navList = document.createElement('ul')

  //magnitude filter
  const slider = document.createElement('div'),
        input = document.createElement('input')

  input.type = 'range'
  input.value = 13.0
  input.min = 0.0
  input.max = 13.0
  input.step = 0.1
  input.orient = 'vertical'

  input.className = 'slider'
  // input.addEventListener('change', ()=>{
  //   scene.traverse(child => {
  //     console.log(child)
  //   })
  // })
  input.addEventListener('input', filterStars)


  slider.appendChild(input)

  navList.appendChild(slider)
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

  function toggleMenu({clientX, clientY}) {
    menu.style.left = clientX + 'px'
    menu.style.top = clientY + 'px'
    menu.style.transform = 'translate(-50%, -50%)'
    
    menu.classList.toggle('menu--hidden')
  }

  document.addEventListener('contextmenu', toggleMenu)
  
  return null
}



export default Menu