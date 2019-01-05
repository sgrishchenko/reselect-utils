export type Node = {
    name: string,
    isNamed: boolean,
    recomputations: number,
}

export type Nodes = {
    [name: string]: Node
}

export type Edge = {
    from: string,
    to: string,
}

export type Edges = Edge[]
