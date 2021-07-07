const modal = document.getElementById('modal')
const dialog = document.getElementById('modal-dialog')

export function setModal(node){
  dialog.appendChild(node)
  modal.classList.toggle('modal-container__hidden')
}

export function clearModal() {
  //modal.clearChildren()
  modal.classList.toggle('modal-container__hidden')
}

export function appendNode(items) {

}