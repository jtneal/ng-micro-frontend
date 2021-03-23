export interface Schema {
  project: string;
  port: string;
  type: 'micro' | 'shell';
  minimal: boolean;
}
