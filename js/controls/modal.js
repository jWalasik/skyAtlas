import { changeLevel } from "./selector.js"

const modal = document.getElementById('modal')
const dialog = document.getElementById('modal-dialog')

export function setModal(node){
  dialog.appendChild(node)

  //using two separate classes instead of toggle for smooth animations
  modal.classList.add('modal-container__shown')
  modal.classList.remove('modal-container__hidden')
}

export function clearModal() {
  modal.classList.add('modal-container__hidden')
  modal.classList.remove('modal-container__shown')
}

export const setupControlsOverlay = () => {
  const container = document.createElement('div')
  container.classList = 'controls-overlay controls-overlay__hidden'
  container.id = 'controls-overlay'

  const name = document.createElement('div')
  name.classList = 'controls-name'
  name.id = 'controls-name'
  name.innerText = ''
  container.appendChild(name)

  const description = document.createElement('div')
  description.id = 'controls-description'
  description.classList = 'controls-description'
  description.innerText = ``
  container.appendChild(description)

  const returnButton = document.createElement('button')
  returnButton.id = 'return-button'
  returnButton.value = 'galaxy'
  returnButton.classList = 'controls-button controls-button__return'
  const returnIcon = document.createElement('img')
  returnIcon.setAttribute('src', 'assets/icons/return-icon.png')
  returnIcon.setAttribute('alt', 'return arrow')
  returnButton.appendChild(returnIcon)

  const handleReturn = () => {
    const btn = document.getElementById('return-button')
    changeLevel(btn.value)
  }
  returnButton.addEventListener('click', handleReturn)

  container.appendChild(returnButton)

  const expandButton = document.createElement('button')
  expandButton.classList = 'controls-button controls-button__expand'
  const expandIcon = document.createElement('img')
  expandIcon.setAttribute('src', 'assets/icons/scroll-icon.png')
  expandIcon.setAttribute('alt', 'expand arrow')
  expandButton.appendChild(expandIcon)
  container.appendChild(expandButton)

  const handleExpansion = () => {
    expandButton.classList.toggle('controls-button__flipped')
    description.classList.toggle('controls-description__expanded')
  }
  expandButton.addEventListener('click', handleExpansion)

  document.body.appendChild(container)
}