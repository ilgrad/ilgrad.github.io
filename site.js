// Deterministic and dependency-free. The k-means sheep are synthetic; this is not a BETULA demo.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seededRandom = start => {
    let seed = start;
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return (seed + 1) / 4294967297;
    };
  };

  const pointsGroup = document.getElementById('plot-points');
  const centresGroup = document.getElementById('plot-centres');
  const button = document.getElementById('cluster-toggle');
  const guides = document.getElementById('cluster-guides');
  const state = document.getElementById('sketch-state');
  const caption = document.getElementById('sketch-caption');
  const description = document.getElementById('plot-description');
  const legend = document.getElementById('flock-legend');
  const note = document.getElementById('sketch-note');
  const ns = 'http://www.w3.org/2000/svg';
  const svgElement = (name, attributes) => {
    const element = document.createElementNS(ns, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const wool = '#ffffff';
  const flockColours = ['#e8590c', '#1565c0', '#c2185b'];
  const flockNames = ['A', 'B', 'C'];
  const random = seededRandom(47);
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
  const flocks = points.map(nearest);
  pointsGroup.replaceChildren();
  const fleeces = points.map(point => {
    const sheep = svgElement('g', { transform: 'translate(' + point.x.toFixed(2) + ' ' + point.y.toFixed(2) + ')' });
    const fleece = svgElement('circle', { class: 'wool', r: (3.6 + random() * 1.4).toFixed(2), fill: wool, stroke: '#14261a', 'stroke-width': '1.1' });
    sheep.append(fleece, svgElement('circle', { cx: '3.6', cy: '-1.6', r: '1.9', fill: '#14261a', stroke: 'none' }));
    pointsGroup.append(sheep);
    return fleece;
  });
  centres.forEach((centre, index) => {
    centresGroup.append(svgElement('path', { d: 'M' + (centre.x - 7) + ' ' + centre.y + 'h14M' + centre.x + ' ' + (centre.y - 7) + 'v14', stroke: '#14261a', 'stroke-width': '3' }));
    const label = svgElement('text', { x: centre.x + 11, y: centre.y - 8 });
    label.textContent = flockNames[index];
    centresGroup.append(label);
    const entry = document.createElement('li');
    const swatch = document.createElement('i');
    swatch.style.background = flockColours[index];
    const word = document.createElement('span');
    word.className = 'flock-word';
    word.textContent = 'Flock ';
    entry.append(swatch, word, flockNames[index] + ': ' + flocks.filter(flock => flock === index).length);
    legend.append(entry);
  });
  centresGroup.style.opacity = '0';
  caption.textContent = '180 sheep. A little hidden order.';
  button.hidden = false;
  button.addEventListener('click', () => {
    const clustered = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(clustered));
    button.firstChild.textContent = clustered ? 'Hide flocks ' : 'Reveal flocks ';
    fleeces.forEach((fleece, index) => fleece.setAttribute('fill', clustered ? flockColours[flocks[index]] : wool));
    centresGroup.style.opacity = clustered ? '1' : '0';
    guides.style.opacity = clustered ? '.45' : '1';
    legend.hidden = !clustered;
    note.hidden = clustered;
    state.textContent = clustered ? 'Synthetic · k = 3' : 'Unlabelled sheep';
    caption.textContent = clustered ? '3 flocks. A clearer picture.' : '180 sheep. A little hidden order.';
    description.textContent = clustered
      ? '180 synthetic sheep coloured by three k-means clusters. Crosses and letters mark the computed cluster centres.'
      : '180 synthetic sheep without cluster labels. Use Reveal flocks to see their k-means groups.';
  });

  // Barnsley's fern: four affine maps chosen with these probabilities. Drawn base to tip, so it grows.
  const fernMaps = [
    [.01, 0, 0, 0, .16, 0, 0],
    [.85, .85, .04, -.04, .85, 0, 1.6],
    [.07, .2, -.26, .23, .22, 0, 1.6],
    [.07, -.15, .28, .26, .24, 0, .44]
  ];
  const fernCanvas = document.getElementById('fern');
  const { width: fernWidth, height: fernHeight } = fernCanvas.getBoundingClientRect();
  if (fernWidth > 0) {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    fernCanvas.width = Math.round(fernWidth * scale);
    fernCanvas.height = Math.round(fernHeight * scale);
    const context = fernCanvas.getContext('2d');
    const fernRandom = seededRandom(1993);
    const fern = [];
    for (let i = 0, x = 0, y = 0; i < 70000; i++) {
      let pick = fernRandom();
      const map = fernMaps.find(([probability]) => (pick -= probability) <= 0) || fernMaps[1];
      [x, y] = [map[1] * x + map[2] * y + map[5], map[3] * x + map[4] * y + map[6]];
      fern.push({ x, y });
    }
    fern.sort((a, b) => a.y - b.y);
    const paint = (from, to) => {
      for (let i = from; i < to; i++) {
        const { x, y } = fern[i];
        context.fillStyle = y < 2.4 ? '#0b6b2e' : y < 6 ? '#1f8f22' : '#2fae1f';
        context.fillRect((x + 2.7) / 5.4 * fernCanvas.width, fernCanvas.height * (1 - y / 10.05), scale, scale);
      }
    };
    if (reducedMotion) {
      paint(0, fern.length);
    } else {
      let started;
      let painted = 0;
      const grow = now => {
        started ??= now;
        const target = Math.min(fern.length, Math.round(fern.length * (now - started) / 2400));
        paint(painted, target);
        painted = target;
        if (painted < fern.length) requestAnimationFrame(grow);
      };
      requestAnimationFrame(grow);
    }
  }

  const platypus = document.getElementById('platypus');
  const says = document.getElementById('platypus-says');
  const facts = [
    'Lays eggs. Makes milk. Has a bill. Try clustering that.',
    'Hunts with its eyes shut, by sensing electric fields. Computer vision, minus the vision.',
    'No stomach at all. Zero dependencies.',
    'Glows under UV light. Nobody asked it to.',
    'The original outlier.'
  ];
  let fact = 0;
  platypus.disabled = false;
  says.hidden = false;
  platypus.addEventListener('click', () => {
    says.textContent = facts[fact];
    fact = (fact + 1) % facts.length;
    says.classList.remove('fresh');
    platypus.classList.remove('boop');
    void platypus.offsetWidth;
    says.classList.add('fresh');
    platypus.classList.add('boop');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
