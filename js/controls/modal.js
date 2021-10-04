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

export function appendNode(items) {

}

export function setName(name) {
  let container = document.getElementById('name-container')
  if(!container) {
    container = document.createElement('name-container')
    container.classList = 'name-container'
  }
  container.innerText = name
}

export function descriptionModal(content) {
  const container = document.createElement('div')
  container.classList = 'description-container'
  container.id = 'description-container'

  const description = document.createElement('div')
  description.classList = 'description-text'
  description.id = 'description'
  description.innerHTML = content
  container.appendChild(description)
  
  const expandButton = document.createElement('button')
  const expandIcon = document.createElement('img')
  expandIcon.setAttribute('src', 'assets/icons/scroll-icon.png')
  expandIcon.setAttribute('alt', 'expand arrow')
  expandButton.classList ='button button-expand'

  expandButton.appendChild(expandIcon)
  expandButton.addEventListener('click', () => handleExpansion(container, expandButton))

  container.appendChild(expandButton)

  const display = document.getElementById('display')
  display.appendChild(container)
}

const handleExpansion = (container, button) => {
  container.classList.toggle('description-expanded')
  button.classList.toggle('button-flipped')
}