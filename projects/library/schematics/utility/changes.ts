import { Tree } from '@angular-devkit/schematics';
import { applyToUpdateRecorder, Change } from '@schematics/angular/utility/change';

export function handleChanges(host: Tree, path: string, changes: Change[]): Tree {
  const recorder = host.beginUpdate(path);

  applyToUpdateRecorder(recorder, changes);
  host.commitUpdate(recorder);

  return host;
}
