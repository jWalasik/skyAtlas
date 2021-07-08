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