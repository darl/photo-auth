import React from 'react';
import './VideoFrame.css';
import cn from 'classnames';

import passport from './img/passport.png';
import passportOk from './img/passport-ok.png';
import passportMove from './img/passport-move.png';
import passportMoveOk from './img/passport-move-ok.png';
import hand from './img/hand.png';
import handOk from './img/hand-ok.png';

const STEPS = {
    connecting: {
        step: 0,
        text: 'Установка соединения',
    },
    show_passport: {
        step: 1,
        text: 'Покажите паспорт',
        success: 'show_passport_ok',
    },
    show_passport_ok: {
        step: 1,
        text: 'Отлично, переходим к следующему шагу',
    },
    show_passport_2: {
        step: 2,
        text: 'Перенесите паспорт слева направо',
    },
    show_passport_3: {
        step: 2,
        text: 'Перенесите паспорт слева направо',
        success: 'show_passport_3_ok',
    },
    show_passport_3_ok: {
        step: 2,
        text: 'Перенесите паспорт слева направо',
    },
    'hand_top_left': {
        success: 'hand_top_left_ok',
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_top_left_ok': {
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_top_right': {
        success: 'hand_top_right_ok',
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_top_right_ok': {
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_bottom_left': {
        success: 'hand_bottom_left_ok',
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_bottom_left_ok': {
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_bottom_right': {
        success: 'hand_bottom_right_ok',
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'hand_bottom_right_ok': {
        step: 3,
        text: 'Поместите руку в указанную позицию',
    },
    'abort': {
        step: 1,
        text: 'Ой, всё пошло не так'
    },
    'success': {
        step: 3,
        text: 'Всё хорошо',
    }
}

class App extends React.PureComponent {
    constructor() {
        super();

        this.setVideoElement = elem => {
            this.videoElement = elem;
        }

        this.state = {
            currentStage: 'connecting',
            step: 0,
        };

        this.onMessage = this.onMessage.bind(this);
    }

    onMessage(evt) {
        const currentStage = STEPS[this.state.currentStage];
        const newStage = evt.data;

        if (newStage === this.state.currentStage) {
            return;
        }

        if (newStage.startsWith("confidence ")) {
            const conf = parseFloat(newStage.substring("confidence ".length))
            this.setState({
                confidence: conf
            });
        }

        if (newStage === 'success') {
            setTimeout(() => {
                this.props.navigate('success');
            }, 1500)
        }

        if (!currentStage || !STEPS[newStage]) {
            return;
        }

        if (currentStage.success && STEPS[currentStage.success]) {
            this.setState({
                currentStage: currentStage.success,
                step: STEPS[currentStage.success].step,
            });

            setTimeout(() => {
                this.setState({
                    currentStage: newStage,
                    step: STEPS[newStage].step,
                });
            }, 1500);

        } else {
            this.setState({
                currentStage: newStage,
                step: STEPS[newStage].step,
            });
        }
    }

    async componentDidMount() {
        let pc;
        let dc;

        // Create Peer Connection
        let config = {
            sdpSemantics: 'unified-plan',
            iceServers: [{urls: ['stun:stun.l.google.com:19302']}]

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

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {facingMode: "user", width: {ideal: 320}, height: {ideal: 180}}
        });
        stream.getTracks().forEach(function (track) {
            pc.addTrack(track, stream);
        });
        this.videoElement.srcObject = stream;

        pc.addEventListener('track', (evt) => {
            if (evt.track.kind === 'video') {
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
                <video ref={this.setVideoElement} className="VideoFrame__video"/>
                <div className="VideoFrame__overlay">
                    {JSON.stringify(this.state, null, 2)}
                    {this.renderOverlay()}
                </div>
                <div className="VideoFrame__bottom">
                    <div className="VideoFrame__bottom-title">
                        {this.renderBottomTitle()}
                    </div>
                    {this.renderSteps()}
                </div>
            </div>
        );
    }

    renderOverlay() {
        const {currentStage} = this.state;
        switch (currentStage) {
            case 'show_passport': {
                return <img src={ passport } className="VideoFrame__passport"/>;
            }
            case 'show_passport_ok': {
                return <img src={ passportOk } className="VideoFrame__passport"/>;
            }
            case 'show_passport_2': {
                return <img src={ passportMove } className="VideoFrame__passport"/>;
            }
            case 'show_passport_3': {
                return <img src={ passportMove } className="VideoFrame__passport"/>;
            }
            case 'show_passport_3_ok': {
                return <img src={ passportMoveOk } className="VideoFrame__passport"/>;
            }
            case 'show_passport_3_ok': {
                return <img src={ passportMoveOk } className="VideoFrame__passport"/>;
            }

            case 'hand_top_left': {
                return <img src={ hand } className="VideoFrame__hand_top_left"/>;
            }
            case 'hand_top_left_ok': {
                return <img src={ handOk } className="VideoFrame__hand_top_left_ok"/>;
            }

            case 'hand_top_right': {
                return <img src={ hand } className="VideoFrame__hand_top_right"/>;
            }
            case 'hand_top_right_ok': {
                return <img src={ handOk } className="VideoFrame__hand_top_right_ok"/>;
            }

            case 'hand_bottom_left': {
                return <img src={ hand } className="VideoFrame__hand_bottom_left"/>;
            }
            case 'hand_bottom_left_ok': {
                return <img src={ handOk } className="VideoFrame__hand_bottom_left_ok"/>;
            }

            case 'hand_bottom_right': {
                return <img src={ hand } className="VideoFrame__hand_bottom_right"/>;
            }
            case 'hand_bottom_right_ok': {
                return <img src={ handOk } className="VideoFrame__hand_bottom_right_ok"/>;
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
                            ['VideoFrame__step-' + step]: true,
                            ['VideoFrame__step-active']: step <= this.state.step,
                        });

                        const classNameSep = cn({
                            'VideoFrame__step-sep': true,
                            'VideoFrame__step-sep-active': step < this.state.step,
                        });

                        return (
                            <>
                                <div className={className}>{step}</div>
                                {step < 3 && <div className={classNameSep}/>}
                            </>
                        );
                        return step;
                    })
                }
            </div>
        );
    }

    renderBottomTitle() {
        return STEPS[this.state.currentStage].text;
    }
}

export default App;
