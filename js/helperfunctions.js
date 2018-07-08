//translate color index to actuall color
var starColor = d3.scale.linear()
                  .domain([-1, 0.5, 0.73, 1.05, 1.25, 1.60, 2])
                  .range(['#68b1ff', '#93e4ff', '#d8f5ff', '#FFFFFF', '#fffad8', '#ffdda8', '#ffb5b5']);
//inverse size scalling with magnitude
var scaleMag = d3.scale.linear()
                  .domain([-2.5, 20])
                  .range([3.5, 0.005]);

// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
function vertex(point) {
  //console.log("point", point);
  var lambda = point[0] * Math.PI / 180,
      phi = point[1] * Math.PI / 180,
      cosPhi = Math.cos(phi);
  return new THREE.Vector3(
      radius * cosPhi * Math.cos(lambda),
      radius * cosPhi * Math.sin(lambda),
      radius * Math.sin(phi)
  );
}
