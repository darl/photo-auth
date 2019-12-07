import React from 'react';
import './VideoFrame.css';

let pc;
let dc;


class App extends React.PureComponent {
    constructor() {
        super();

        this.setVideoElement = elem => {
            this.videoElement = elem;
        }
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
        dc.addEventListener('message', console.log);

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

                return fetch('//localhost:8080/offer', {
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
                    test
                </div>
            </div>
        );
    }
}

export default App;
