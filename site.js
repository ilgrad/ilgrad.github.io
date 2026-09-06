// Deterministic, dependency-free k-means sketch. This is not a BETULA demo.
(() => {
  const pointsGroup = document.getElementById('plot-points');
  const centresGroup = document.getElementById('plot-centres');
  const button = document.getElementById('cluster-toggle');
  const guides = document.getElementById('cluster-guides');
  const state = document.getElementById('sketch-state');
  const caption = document.getElementById('sketch-caption');
  const description = document.getElementById('plot-description');
  const ns = 'http://www.w3.org/2000/svg';
  const colours = ['#c2e898', '#8fbfaf', '#dcc69b'];
  let seed = 47;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed + 1) / 4294967297;
  };
  const normal = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  const sources = [[130, 113, 34, 23, -.45], [311, 138, 26, 34, .42], [204, 259, 35, 17, .14]];
  const points = sources.flatMap(([x, y, sx, sy, angle]) => Array.from({ length: 60 }, () => {
    const dx = normal() * sx;
    const dy = normal() * sy;
    return {
      x: Math.max(31, Math.min(409, x + dx * Math.cos(angle) - dy * Math.sin(angle))),
      y: Math.max(23, Math.min(321, y + dx * Math.sin(angle) + dy * Math.cos(angle)))
    };
  }));
  const centres = [{ x: 110, y: 85 }, { x: 335, y: 150 }, { x: 205, y: 280 }];
  const nearest = point => centres.reduce((best, centre, index) => {
    const distance = (point.x - centre.x) ** 2 + (point.y - centre.y) ** 2;
    return distance < best.distance ? { distance, index } : best;
  }, { distance: Infinity, index: 0 }).index;
  for (let iteration = 0; iteration < 25; iteration++) {
    const sums = centres.map(() => ({ x: 0, y: 0, n: 0 }));
    points.forEach(point => {
      const sum = sums[nearest(point)];
      sum.x += point.x;
      sum.y += point.y;
      sum.n++;
    });
    sums.forEach((sum, index) => {
      if (sum.n) centres[index] = { x: sum.x / sum.n, y: sum.y / sum.n };
    });
  }
  pointsGroup.replaceChildren();
  const circles = points.map(point => {
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', point.x.toFixed(2));
    circle.setAttribute('cy', point.y.toFixed(2));
    circle.setAttribute('r', (1.4 + random() * 1.6).toFixed(2));
    circle.setAttribute('fill', colours[0]);
    circle.setAttribute('opacity', (.35 + random() * .5).toFixed(2));
    pointsGroup.append(circle);
    return circle;
  });
  centres.forEach((centre, index) => {
    const mark = document.createElementNS(ns, 'path');
    mark.setAttribute('d', 'M' + (centre.x - 6) + ' ' + centre.y + 'h12M' + centre.x + ' ' + (centre.y - 6) + 'v12');
    mark.setAttribute('stroke', colours[index]);
    mark.setAttribute('stroke-width', '1.6');
    centresGroup.append(mark);
  });
  centresGroup.style.opacity = '0';
  caption.textContent = '180 points. A little hidden order.';
  button.hidden = false;
  button.addEventListener('click', () => {
    const clustered = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(clustered));
    button.firstChild.textContent = clustered ? 'Hide clusters ' : 'Reveal clusters ';
    circles.forEach((circle, index) => circle.setAttribute('fill', clustered ? colours[nearest(points[index])] : colours[0]));
    centresGroup.style.opacity = clustered ? '1' : '0';
    guides.style.opacity = clustered ? '.3' : '1';
    state.textContent = clustered ? 'k-means / k = 3' : 'Unlabelled observations';
    caption.textContent = clustered ? '3 clusters. A clearer picture.' : '180 points. A little hidden order.';
    description.textContent = clustered
      ? '180 synthetic points coloured by three k-means clusters. Crosses mark the computed cluster centres.'
      : '180 synthetic points without cluster labels. Use Reveal clusters to see their k-means groups.';
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
