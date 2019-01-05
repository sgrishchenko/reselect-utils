import {ComponentType, createElement, Component, ComponentClass} from "react";
import {connect} from "react-redux";
import {OutputParametricCachedSelector} from "re-reselect";
import {removeMatchingSelectorRecursively} from "./removeMatchingSelectorRecursively";
import {shallowEqual} from 'shallow-equal-object'

export const reselectConnect = <S, P, R>(
    selector: ReturnType<OutputParametricCachedSelector<S, P, R, any>>
) => <C extends ComponentType<P>>(WrappedComponent: C): ComponentClass<JSX.LibraryManagedAttributes<C, P>> => {

    const wrappedComponentName =
        WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const clearCache = removeMatchingSelectorRecursively(selector);
    const state = Symbol('state');

    class Wrapper extends Component<P & { [state]: S }> {
        public static displayName = `ReselectConnect(${wrappedComponentName})`;

        public shouldComponentUpdate(nextProps: P & { [state]: S }) {
            return !shallowEqual(this.props, nextProps)
        }

        public componentDidUpdate(prevProps: P & { [state]: S }) {
            clearCache(prevProps[state], prevProps)
        }

        public componentWillUnmount() {
            clearCache(this.props[state], this.props)
        }

        public render() {
            return createElement(
                WrappedComponent,
                this.props
            )
        }
    }

    return connect(
        reduxState => ({[state]: reduxState}),
        {},
        undefined,
        {getDisplayName: name => `InnerConnect(${name})`}
        // @ts-ignore because something wrong with type Matching in react-redux typing
    )(Wrapper)
};