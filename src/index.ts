import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';

import './form';

function registerFormExt(app: JupyterLab) {
  app.docRegistry.addFileType({
    name:'FORM',
    extensions:['frm'],
    mimeTypes:['text/x-forms']
  })
}

/**
 * Initialization data for the jupyterlab_form extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_form',
  autoStart: true,
  activate: (app: JupyterLab) => {
    registerFormExt(app);
    console.log('JupyterLab extension jupyterlab_form is activated!');
  }
};

export default extension;
