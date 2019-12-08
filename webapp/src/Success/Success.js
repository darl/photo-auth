import React from 'react';
import success from './img/success.png';
import '../AwaitDecision/WaitDecision.css';


class Success extends React.PureComponent {

    onClick() {
        window.open("https://online.rosbank.ru/ibank/home?0")
    }

    render() {
        return (
            <div className="WhiteBgDecision">
                <div className="RedBlockDecision">
                    <img className="IllustrationDecision" src={success} width={113}/>
                    <p className="WhiteTextDecision">Верификация пройдена</p>
                </div>
                <div className="WhiteBlockDecision">

                </div>
                <div className="BlackTextBlockDecision">
                    <p>Что дальше?</p>
                </div>
                <div className="WhiteTextBlockDecision">
                    <p>Все готово!<br/>Теперь все, что нужно - подписать документы в личном кабинете</p>
                </div>
                <div className="RedButtonDecisionLower" onClick={this.onClick}>
                    <p>Перейти к подписи</p>
                </div>
            </div>
        )
    }
}

export default Success;
