const modal = document.getElementById('modal')

export function setModal(node){
  modal.appendChild(node)
  modal.classList.toggle('modal--open')
  console.log(modal)
}

export function clearModal() {
  modal.clearChildren()
  modal.classList.toggle('modal--open')
}

export function appendNode(items) {

}