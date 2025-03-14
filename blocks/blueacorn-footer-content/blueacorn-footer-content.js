import { getFooterLinks } from '../../scripts/footer-links.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerLinks = await getFooterLinks();
  const footerLinksColumns = {};
  const footerLogoBlock = document.createElement('div');
  const footerLinksBlock = document.createElement('div');
  const footerSocialBlock = document.createElement('div');

  footerLogoBlock.className = 'footer-logo';
  footerLinksBlock.className = 'footer-links';
  footerSocialBlock.className = 'footer-social';

    footerLogoBlock.innerHTML = `
    <a href="/" class="logo" aria-label="Go to the homepage"><img src="/images/blueacorn.png" class="footer-logo" /></a>
  `;

  footerLinks.forEach((footerLink) => {
    const footerLinksListItem = document.createElement('li');

    footerLinksListItem.innerHTML = `<a href="${footerLink.url}">${footerLink.label}</a>`;

    if (!footerLinksColumns[footerLink.column]) {
      footerLinksColumns[footerLink.column] = [];
    }

    footerLinksColumns[footerLink.column].push(footerLinksListItem);
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, linksList] of Object.entries(footerLinksColumns)) {
    const footerLinksColimn = document.createElement('ul');

    footerLinksColimn.className = `footer-links-column column-${key}`;

    linksList.forEach((footerLink) => {
      footerLinksColimn.append(footerLink);
    });

    footerLinksBlock.append(footerLinksColimn);
  }

  footerSocialBlock.innerHTML = `
    <ul class="social-links">
      <li>
        <a href="https://www.facebook.com/BlueAcorniCi/" class="facebook">
          <span>facebook</span>
        </a>
      </li>
      <li>
        <a href="https://www.instagram.com/blueacornici/" class="instagram">
          <span>instagram</span>
        </a>
      </li>
      <li>
        <a href="https://www.linkedin.com/company/blue-acorn-ici" class="linkedin">
          <span>linkedin</span>
        </a>
      </li>
      <li>
        <a href="https://x.com/blueacornici" class="x">
          <span>x</span>
        </a>
      </li>
      <li>
        <a href="https://www.youtube.com/@blueacornici" class="youtube">
          <span>youtube</span>
        </a>
      </li>
    </ul>
  `;

  block.innerHTML = '';
  block.append(footerLogoBlock);
  block.append(footerLinksBlock);
  block.append(footerSocialBlock);
}
