export class DependenciesError extends Error {
  constructor(public list: string[]) {
    super();
  }
}
