import { loadCSS } from '../../scripts/aem.js';

export default function decorate(block) {
  loadCSS('../blocks/stars/stars.css');
  const rating = parseFloat(block.dataset.rating) || 0;
  const max = parseInt(block.dataset.max, 10) || 5;
  const color = block.dataset.color || '#FFD700';
  const spacing = parseInt(block.dataset.spacing, 10) || 4;
  const size = 24;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'star-rating');
  svg.setAttribute('width', max * (size + spacing));
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${max * (size + spacing)} ${size}`);

  for (let i = 0; i < max; i += 1) {
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('transform', `translate(${i * (size + spacing)}, 0)`);

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z');

    if (rating >= i + 1) {
      path.setAttribute('fill', color);
    } else if (rating > i && rating < i + 1) {
      // Create gradient for partial fill
      const defs = document.createElementNS(svgNS, 'defs');
      const gradient = document.createElementNS(svgNS, 'linearGradient');
      const gradId = `grad${i}`;
      gradient.setAttribute('id', gradId);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '0%');

      const stop1 = document.createElementNS(svgNS, 'stop');
      stop1.setAttribute('offset', `${(rating - i) * 100}%`);
      stop1.setAttribute('style', `stop-color:${color}; stop-opacity:1`);

      const stop2 = document.createElementNS(svgNS, 'stop');
      stop2.setAttribute('offset', `${(rating - i) * 100}%`);
      stop2.setAttribute('style', 'stop-color:white; stop-opacity:1');

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
      svg.appendChild(defs);

      path.setAttribute('fill', `url(#${gradId})`);
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1');
    } else {
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1');
    }

    group.appendChild(path);
    svg.appendChild(group);
  }

  block.innerHTML = '';
  block.appendChild(svg);
}
