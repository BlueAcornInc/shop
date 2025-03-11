import columns from '../columns/columns.js';

export default async function decorate(block) {
  columns(block);

  Array.from(block.children).forEach((row, index) => {
    const rowContentWrapper = document.createElement('div');
    rowContentWrapper.classList.add('content-columns-row-wrapper');
    row.classList.add('content-columns-row');

    if ((index + 1) % 2 !== 0) {
      row.classList.add('odd');
    }

    Array.from(row.children).forEach((column) => {
      column.classList.add('content-columns-column');
      rowContentWrapper.appendChild(column);
    });

    row.appendChild(rowContentWrapper);
  });
}
