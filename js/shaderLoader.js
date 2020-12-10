const shaderList = ['halo', 'star', 'starField']
const path = '/assets/shaders/'
const shaders = {}

export async function fetchShaders(id) {
  const fragment = await fetch(path+id+'.fsh').then(res=>res.text()),
        vertex = await fetch(path+id+'.vsh').then(res=>res.text())
  return {
    fragment: fragment,
    vertex: vertex
  }
}

async function shaderLoader() {
  shaderList.forEach(shader=>fetchShaders(shader)).then(res => {
    console.log(res)
    return res
  })
  return shaders
}

export default shaderLoader
