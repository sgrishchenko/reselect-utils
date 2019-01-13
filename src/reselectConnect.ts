import {ComponentType, createElement, Component, ComponentClass} from "react";
import {connect} from "react-redux";
import {OutputParametricCachedSelector} from "re-reselect";
import CounterObjectCache from "./CounterObjectCache";

export const reselectConnect = <S, P, R>(
    selector: ReturnType<OutputParametricCachedSelector<S, P, R, any>>
) => <C extends ComponentType<P>>(WrappedComponent: C): ComponentClass<JSX.LibraryManagedAttributes<C, P>> => {

    const wrappedComponentName =
        WrappedComponent.displayName
        || /* istanbul ignore next */ WrappedComponent.name
        || /* istanbul ignore next */ 'Component';

    const addRef = CounterObjectCache.addRefRecursively(selector);
    const removeRef = CounterObjectCache.removeRefRecursively(selector);
    const state = Symbol('state');

    class Wrapper extends Component<P & { [state]: S }> {
        public static displayName = `ReselectConnect(${wrappedComponentName})`;

        public componentDidMount() {
            addRef(this.props[state], this.props)
        }

        public componentDidUpdate(prevProps: P & { [state]: S }) {
            removeRef(prevProps[state], prevProps);
            addRef(this.props[state], this.props);
        }

        public componentWillUnmount() {
            removeRef(this.props[state], this.props)
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