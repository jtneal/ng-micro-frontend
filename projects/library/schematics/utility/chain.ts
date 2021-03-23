import { chain, noop, Rule } from '@angular-devkit/schematics';

export function chainIf(condition: boolean, rules: Rule[]): Rule {
  return condition ? chain(rules) : noop();
}
