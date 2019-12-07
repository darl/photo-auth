import React from 'react';
import './Onboarding.css';
import tutorial1 from './img/tutorial-1.png';
import tutorial2 from './img/tutorial-2.png';
import tutorial3 from './img/tutorial-3.png';
import tutorial4 from './img/tutorial-4.png';
import cross from './img/cross.png'
import Carousel from 'nuka-carousel';

class Onboarding extends React.PureComponent {

    render() {
        return (
            <div>
                <Carousel heightMode={"first"} renderCenterLeftControls={false} renderCenterRightControls={false}>
                    <div>
                        <div className="Onboarding">
                            <img className="Illustration"
                                 src={tutorial1}
                                 width={234}
                                 height={256}
                            />
                        </div>
                        <div className="Emptyspace">
                        </div>
                        <div className="BlackText">
                            <p>Теперь автокредит можно оформить онлайн!<br/><br/>Достаточно камеры смартфона</p>
                        </div>
                    </div>
                    <div>
                        <div className="Onboarding">
                            <img className="Illustration"
                                 src={tutorial2}
                                 width={232}
                                 height={281}
                            />
                        </div>
                        <div className="Emptyspace">
                        </div>
                        <div className="BlackText">
                            <p>Сначала поднесите паспорт к камере<br/><br/>
                                После этого перенесите паспорт слева направо перед лицом</p>
                        </div>
                    </div>
                    <div>
                        <div className="Onboarding">
                            <img className="Illustration"
                                 src={tutorial3}
                                 width={250}
                                 height={242}
                            />
                        </div>
                        <div className="Emptyspace">
                        </div>
                        <div className="BlackText">
                            <p>Поставьте руки в позицию, отмеченную на экране<br/><br/>
                                Достаточно всего пару раз, чтобы мы убедились что Вы - это Вы</p>
                        </div>
                    </div>
                    <div>
                        <div className="Onboarding">
                            <img className="Illustration"
                                 src={tutorial4}
                                 width={225}
                                 height={248}
                            />
                        </div>
                        <div className="Emptyspace">
                        </div>
                        <div className="BlackText">
                            <p>После всех шагов осталось дождаться подтверждения - и можно получать машину</p>
                            <div className="RedButton">
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
