import React from 'react';
import './Onboarding.css';
import TouchCarousel from 'react-touch-carousel';
import tutorial1 from './img/tutorial-1.png';
import cross from './img/cross.png'

class Onboarding extends React.PureComponent {

    render() {
        return (
            <div>
                <div className="Onboarding">
                    <div className="Cross">
                        <img src={cross} width={40}/>
                    </div>
                    <img className="Illustration"
                        src={tutorial1}
                        width={234}
                    />

                </div>
                <div className="Emptyspace">
                </div>
                <div className="BlackText">
                    <p>Теперь автокредит можно оформить онлайн!<br/><br/>Достаточно камеры смартфона</p>
                </div>
            </div>
        );
    }
}

export default Onboarding;
