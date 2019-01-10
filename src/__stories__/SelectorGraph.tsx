import * as React from 'react';
import { Core as CytoscapeCore} from 'cytoscape';
// @ts-ignore
import {checkSelector} from 'reselect-tools';
import {Edges, Nodes, Node} from "./types";
import {drawCytoscapeGraph, updateCytoscapeGraph} from "./cytoscapeUtils";
import {CSSProperties} from "react";

export type SelectorGraphProps = {
    nodes: Nodes,
    edges: Edges,
    onNodeClick: (name: string, node: Node) => void,
    style: CSSProperties
}

export default class SelectorGraph extends React.Component<SelectorGraphProps> {
    static defaultProps = {
        onNodeClick: () => undefined,
        style: {},
    };

    private cy!: CytoscapeCore;
    private cyElement!: HTMLElement | null;

    componentDidMount() {
        const {nodes, edges, onNodeClick} = this.props;

        this.cy = drawCytoscapeGraph(this.cyElement, nodes, edges, name => {
            onNodeClick(name, checkSelector(name))
        });
    }

    componentDidUpdate(prevProps: SelectorGraphProps) {
        const {nodes, edges} = this.props;

        if (prevProps.nodes === nodes
            && prevProps.edges === edges) {
            return;
        }

        updateCytoscapeGraph(this.cy, nodes, edges);
    }

    componentWillUnmount() {
        if (this.cy) {
            this.cy.destroy();
        }
    }

    render() {

        return (
            <div
                style={{height: '100%', ...this.props.style}}
                ref={(element) => this.cyElement = element}
            />
        );
    }
}