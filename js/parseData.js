const parseData = () => {
  const urls = [
    'https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv',
    'https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json',
    'https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json'
  ]
  let stars
  let lines
  let bounds

  Promise.all(
    d3.csv(urls[0]).then((val=> stars = val)),
    d3.json(urls[1]).then((val=> bounds = val)),
    d3.json(urls[2]).then((val=> lines = val))
  ).catch(err=>console.log(err))
}