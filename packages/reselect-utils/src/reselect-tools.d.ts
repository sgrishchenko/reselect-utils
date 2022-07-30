declare module 'reselect-tools' {
  import { Selector, ParametricSelector } from 'reselect';

  type Node = {
    name: string;
    isNamed: boolean;
    recomputations?: number;
  };

  type Nodes = Record<string, Node>;

  export type Edge = {
    from: string;
    to: string;
  };

  type Edges = Edge[];

  type AnySelector = Selector<any, any, never> | ParametricSelector<any, any, any>;

  type CheckResult = {
    isNamed: boolean;
    selectorName?: string;
    dependencies?: AnySelector[];
    recomputations?: number;
    // extra
    inputs?: any[];
    output?: any;
    error?: any;
  };

  function registerSelectors(selectors: Record<string, AnySelector>): void;

  function reset(): void;

  function checkSelector(selectorName: string): CheckResult;

  function checkSelector(selector: AnySelector): CheckResult;

  function getStateWith(stateGetter: () => any): void;

  function selectorGraph(
    selectorKey?: (selector: AnySelector) => string,
  ): { nodes: Nodes; edges: Edges };
}
