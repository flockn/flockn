import DOMRenderer from './DOMRenderer';
import CanvasRenderer from './CanvasRenderer';

const renderers = {};

const Renderer = {};

Renderer.register = (name, descriptor) => {
  renderers[name] = descriptor;
};

Renderer.use = (name) => {
  if (Object.hasOwnProperty.call(renderers, name)) {
    if (renderers[name]) {
      renderers[name]();
    }
  }
};

Renderer.register('dom', DOMRenderer);
Renderer.register('canvas', CanvasRenderer);

export default Renderer;
