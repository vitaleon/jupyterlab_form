import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the jupyterlab_form extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_form',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension jupyterlab_form is activated!');
  }
};

export default extension;
