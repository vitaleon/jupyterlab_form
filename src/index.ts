import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import '../style/index.css';

import './form';

function registerFormExt(app: JupyterFrontEnd) {
  app.docRegistry.addFileType({
    name:'FORM',
    extensions:['frm'],
    mimeTypes:['text/x-forms']
  })
}

/**
 * Initialization data for the jupyterlab_form extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_form',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    registerFormExt(app);
    console.log('JupyterLab extension jupyterlab_form is activated!');
  }
};

export default extension;
