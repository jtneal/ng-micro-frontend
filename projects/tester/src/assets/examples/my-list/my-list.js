class MyList extends HTMLElement {
  constructor() {
    super();

    const styles = `
.wrapper {
  background-color: #fff;
  border-radius: 8px;
}

h1 {
  background-color: #008473;
  border-radius: 8px 8px 0 0;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  padding: 8px;
}

ul {
  margin: 0;
  padding: 16px;
}

li {
  margin-left: 24px;
}
`;

    const style = document.createElement('style');
    style.textContent = styles;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');
    const title = wrapper.appendChild(document.createElement('h1'));
    title.textContent = this.getAttribute('title');
    const list = wrapper.appendChild(document.createElement('ul'));
    const item1 = list.appendChild(document.createElement('li'));
    item1.textContent = 'My Item 1';
    const item2 = list.appendChild(document.createElement('li'));
    item2.textContent = 'My Item 2';
    const item3 = list.appendChild(document.createElement('li'));
    item3.textContent = 'My Item 3';

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(style, wrapper);
  }
}

customElements.define('my-list', MyList);
