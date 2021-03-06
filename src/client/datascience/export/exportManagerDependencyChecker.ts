import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import * as localize from '../../common/utils/localize';
import { IJupyterExecution, IJupyterInterpreterDependencyManager, INotebookModel } from '../types';
import { ExportManager } from './exportManager';
import { ExportFormat, IExportManager } from './types';

@injectable()
export class ExportManagerDependencyChecker implements IExportManager {
    constructor(
        @inject(ExportManager) private readonly manager: IExportManager,
        @inject(IJupyterExecution) private jupyterExecution: IJupyterExecution,
        @inject(IJupyterInterpreterDependencyManager)
        private readonly dependencyManager: IJupyterInterpreterDependencyManager
    ) {}

    public async export(format: ExportFormat, model: INotebookModel): Promise<Uri | undefined> {
        // Before we try the import, see if we don't support it, if we don't give a chance to install dependencies
        if (!(await this.jupyterExecution.isImportSupported())) {
            await this.dependencyManager.installMissingDependencies();
        }

        if (await this.jupyterExecution.isImportSupported()) {
            return this.manager.export(format, model);
        } else {
            throw new Error(localize.DataScience.jupyterNbConvertNotSupported());
        }
    }
}
