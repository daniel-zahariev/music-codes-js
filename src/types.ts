export interface IterableCode<T> {
  first(): T;
  last(): T;
  previous(): T;
  next(): T;
  iterate(): IterableIterator<T>;
}
