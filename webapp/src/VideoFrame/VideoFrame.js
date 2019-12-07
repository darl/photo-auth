import React from 'react';
import './VideoFrame.css';
import cn from 'classnames';

import passport from './img/passport.png';
import passportOk from './img/passport-ok.png';
import passportMove from './img/passport-move.png';
import passportMoveOk from './img/passport-move-ok.png';
import hand from './img/hand.png';
import handOk from './img/hand-ok.png';

let pc;
let dc;

class App extends React.PureComponent {
    constructor() {
        super();

        this.setVideoElement = elem => {
            this.videoElement = elem;
        }

        this.state = {
            currentStage: 'show_passport',
            step: 1,
        };
    }

    onMessage(evt) {
        this.setState({ currentStage: evt.data })
    }

    async componentDidMount() {

        // Create Peer Connection
        var config = {
            sdpSemantics: 'unified-plan'
        };
        pc = new RTCPeerConnection(config);
        // register some listeners to help debugging
        pc.addEventListener('icegatheringstatechange', console.log, false);
        pc.addEventListener('iceconnectionstatechange', console.log, false);
        pc.addEventListener('signalingstatechange', console.log, false);

        // DATA chanel
        dc = pc.createDataChannel('chat', {"ordered": true});
        dc.addEventListener('message', this.onMessage);

        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('muted', '');
        this.videoElement.setAttribute('playsinline', '');

        const stream = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
        stream.getTracks().forEach(function(track) {
            pc.addTrack(track, stream);
        });
        this.videoElement.srcObject = stream;

        pc.addEventListener('track', (evt) => {
            if (evt.track.kind == 'video') {
                this.videoElement.srcObject = evt.streams[0];
            }
        });

        pc
            .createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    const checkState = () => {
                        console.log('STATE CHANGE');
                        if (pc.iceGatheringState === 'complete') {
                            pc.removeEventListener('icegatheringstatechange', checkState);
                            resolve();
                        }
                    }

                    pc.addEventListener('icegatheringstatechange', checkState)
                }
            }))
            .then(() => {
                const offer = pc.localDescription;

                return fetch('/offer', {
                    body: JSON.stringify({
                        sdp: offer.sdp,
                        type: offer.type,
                        video_transform: 'none',
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                })
            })
            .then((response) => response.json())
            .then((json) => pc.setRemoteDescription(json));
    }

    render() {
        return (
            <div className="VideoFrame">
                <video ref={ this.setVideoElement } className="VideoFrame__video" />
                <div className="VideoFrame__overlay">
                    { this.renderOverlay() }
                </div>
                <div className="VideoFrame__bottom">
                    <div className="VideoFrame__bottom-title">
                        { this.renderBottomTitle() }
                    </div>
                    { this.renderSteps() }
                </div>
            </div>
        );
    }

    renderOverlay() {
        const { currentStage } = this.state;
        switch(currentStage) {
            case 'show_passport': {
                return <img src={passport} className="VideoFrame__passport" />;
            }
            default: {
                return null;
            }
        }
    }

    renderSteps() {
        return (
            <div className="VideoFrame__steps">
                {
                    [1, 2, 3].map((step) => {
                        const className = cn({
                            'VideoFrame__step': true,
                            ['VideoFrame__step-' + step ]: true,
                            ['VideoFrame__step-active']: step <= this.state.step,
                        });

                        const classNameSep = cn({
                            'VideoFrame__step-sep': true,
                            'VideoFrame__step-sep-active': step < this.state.step,
                        });

                        return (
                            <>
                                <div className={ className }>{ step }</div>
                                { step < 3 && <div className={ classNameSep } />}
                            </>
                        );
                        return step;
                    })
                }
            </div>
        );
    }

    renderBottomTitle() {
        return 'Покажи пасспорт';
    }
}

export default App;
