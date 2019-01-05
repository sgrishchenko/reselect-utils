import * as React from "react";
import {FunctionComponent} from "react";
import {mount, shallow} from "enzyme";
import {compose, createStore} from "redux";
import {connect, Provider} from "react-redux";
import createCachedSelector from "re-reselect";
import CounterObjectCache from "../CounterObjectCache";
import {reselectConnect} from "../reselectConnect";

describe('reselectConnect', () => {
    type State = {
        value: string
    }

    type Props = {
        prop: string
    }

    test('should proxy all props and renders wrapped component', () => {
        const selector = createCachedSelector(
            (state: State) => state.value,
            (state: State, props: Props) => props.prop,
            jest.fn(() => ({})),
        )((state, props) => props.prop, {
            cacheObject: new CounterObjectCache()
        });

        const TestComponent: FunctionComponent<Props> = jest.fn(() => 'TestComponent Content');
        TestComponent.displayName = 'TestComponent';
        /*const ConnectedTestComponent = compose(
            connect(selector),
            reselectConnect(selector),
        )(TestComponent);*/
        const ConnectedTestComponent =
            connect(selector, {})(
                reselectConnect(selector)(
                    TestComponent
                )
            );


        const store = createStore(() => ({}), {});

        const wrapper = mount(
            <Provider store={store}>
                <ConnectedTestComponent prop="prop1"/>
            </Provider>
        ).children();

        /*wrapper.setProps({
            children: <ConnectedTestComponent prop="prop1"/>
        });

        wrapper.setProps({
            children: <ConnectedTestComponent prop="prop2"/>
        });

        wrapper.setProps({
            children: <ConnectedTestComponent prop="prop1"/>
        });*/

        expect(wrapper).toMatchSnapshot()
    });

    test('should clear cache after component unmount', () => {

    })
});
