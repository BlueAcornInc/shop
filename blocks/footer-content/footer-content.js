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
  const socials = ['facebook', 'instagram', 'linkedin', 'x', 'youtube'];

  footerLogoBlock.className = 'footer-logo';
  footerLinksBlock.className = 'footer-links';
  footerSocialBlock.className = 'footer-social';

  fetch('images/logo.svg')
    .then((response) => response.text())
    .then((text) => {
      footerLogoBlock.innerHTML = `
        <a href="/" class="logo" aria-label="Go to the homepage">${text}</a>
      `;
    })
    .catch(console.error.bind(console));

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
    <form class="form subscribe" action="/newsletter/subscriber/new/" method="post" id="newsletter-validate-detail">
      <div class="field newsletter">
        <label for="newsletter">
          <span class="label">
            Sign up for our newsletter
          </span>
        </label>
        <div class="control">
          <input name="email" type="email" id="newsletter" placeholder="Email Address">
          <button class="action button subscribe primary" title="Sign Up" type="submit" aria-label="Sign Up">
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </form>
    <ul class="social-links">
      <li>
        <a href="https://www.facebook.com/StripeHQ/" class="facebook">
          <span>facebook</span>
        </a>
      </li>
      <li>
        <a href="https://www.instagram.com/stripehq" class="instagram">
          <span>instagram</span>
        </a>
      </li>
      <li>
        <a href="https://www.linkedin.com/company/stripe/" class="linkedin">
          <span>linkedin</span>
        </a>
      </li>
      <li>
        <a href="https://x.com/stripe" class="x">
          <span>x</span>
        </a>
      </li>
      <li>
        <a href="https://www.youtube.com/c/stripe" class="youtube">
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
