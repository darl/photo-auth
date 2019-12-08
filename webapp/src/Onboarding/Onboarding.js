import React from 'react';
import './Onboarding.css';
import tutorial1 from './img/tutorial-1.png';
import tutorial2 from './img/tutorial-2.png';
import tutorial3 from './img/tutorial-3.png';
import tutorial4 from './img/tutorial-4.png';
import cross from './img/cross.png'
import Carousel from 'nuka-carousel';
import ReactDOM from "react-dom";
import VideoFrame from "../VideoFrame/VideoFrame";

class Onboarding extends React.PureComponent {
    constructor() {
        super();
        this.btnClick = this.btnClick.bind(this);
    }

    btnClick() {
        this.props.navigate('video-frame');
    }

    render() {
        return (
            <div className="OnboardingContainer">
                <Carousel heightMode={"first"} renderCenterLeftControls={false} renderCenterRightControls={false}>
                    <div className="Onboarding">
                        <div className="Onboarding__firstRow">
                            <img className="Onboarding__img"
                                 src={tutorial1}
                            />
                        </div>
                        <div className="Onboarding__secondRow">
                            <p>Теперь автокредит можно оформить онлайн!<br/><br/>Достаточно камеры смартфона</p>
                        </div>
                    </div>
                    <div className="Onboarding">
                        <div className="Onboarding__firstRow">
                            <img className="Onboarding__img"
                                 src={tutorial2}
                            />
                        </div>
                        <div className="Onboarding__secondRow">
                            <p>Сначала поднесите паспорт к камере<br/><br/>
                                После этого перенесите паспорт слева направо перед лицом</p>
                        </div>
                    </div>
                    <div className="Onboarding">
                        <div className="Onboarding__firstRow">
                            <img className="Onboarding__img"
                                 src={tutorial3}
                            />
                        </div>
                        <div className="Onboarding__secondRow">
                            <p>Поставьте руки в позицию, отмеченную на экране<br/><br/>
                                Достаточно всего пару раз, чтобы мы убедились что Вы - это Вы</p>
                        </div>
                    </div>
                    <div  className="Onboarding">
                        <div className="Onboarding__firstRow">
                            <img className="Onboarding__img"
                                 src={tutorial4}
                            />
                        </div>
                        <div className="Onboarding__secondRow">
                            <p>После всех шагов осталось дождаться подтверждения - и можно получать машину</p>
                            <div className="RedButton" onClick={ this.btnClick }>
                                <p>Поехали!</p>
                            </div>
                        </div>
                    </div>
                </Carousel>
                <div className="Cross">
                    <img src={cross} width={40}/>
                </div>
            </div>

        );
    }
}

export default Onboarding;
