class CameraControls {
  constructor(props) {
    this.cameras = []
    this.currentCamera = undefined
    this.positions = []

  }

  moveTo() {
    console.log('move camera to:')
  }

  switchCamera() {

  }

  addNewCamera() {

  }

  switchPosition(vector) {
    this.positions.push(this.currentCamera.position)
  }

  getCurrent() {
    return this.currentCamera
  }
}

export default CameraControls