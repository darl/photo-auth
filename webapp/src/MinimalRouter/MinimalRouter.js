import React from 'react';
import VideoFrame from '../VideoFrame/VideoFrame';
import Onboarding from '../Onboarding/Onboarding';

const ROUTES = {
    'onboarding': Onboarding,
    'video-frame': VideoFrame,
};

class MinimakRouter extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            currentRoute: 'onboarding',
        };

        this.navigate = this.navigate.bind(this);
    }

    navigate(newRoute) {
        this.setState({ currentRoute: newRoute });
    }

    getComponent() {
        return ROUTES[this.state.currentRoute];
    }

    render() {
        const Component = this.getComponent();

        return (
            <>
                <Component navigate={ this.navigate } />
            </>
        )
    }
}

export default MinimakRouter;