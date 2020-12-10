function setupUI() {
  // EVENT LISTENERS
  document.getElementById('menu').addEventListener('click', function(e) {
    const [list, icon] = this.children
    list.classList.toggle('menu-list--collapsed')
    icon.classList.toggle('menu-icon--spin')
  })
}

export default setupUI