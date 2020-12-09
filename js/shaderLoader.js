const shaderList = ['halo', 'star', 'starField']
const path = '/assets/shaders/'
const shaders = {}

async function fetchShaders(id) {
  shaders[id] = {
    fragment: await fetch(path+id+'.fsh').then(res=>res.text()),
    vertex: await fetch(path+id+'.vsh').then(res=>res.text())
  }
}

async function shaderLoader() {
  shaderList.forEach(shader=>fetchShaders(shader))
  console.log(shaders)
  return shaders
}

export default shaderLoader