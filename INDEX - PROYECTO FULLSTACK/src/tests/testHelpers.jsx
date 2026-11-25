import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../components/StoreContext.jsx';

let root;
let host;

export function mount(element, { router = false, store = false, route = '/' } = {}) {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  let result = element;
  if (store) result = <StoreProvider>{result}</StoreProvider>;
  if (router) result = <MemoryRouter initialEntries={[route]}>{result}</MemoryRouter>;
  act(() => root.render(result));
  return host;
}

export function unmount() {
  if (root) act(() => root.unmount());
  host?.remove();
  root = null;
  host = null;
}

export function changeInput(input, value) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

export function click(element) {
  act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

export function submit(form) {
  act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}