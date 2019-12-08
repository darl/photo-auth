import React from 'react';
import documentsCheck from './img/documents-check.png';
import './WaitDecision.css';


class AwaitDecision extends React.PureComponent {

    onClick() {
        window.open("https://online.rosbank.ru/ibank/home?0")
    }

    render() {
        return (
            <div className="WhiteBgDecision">
                <div className="RedBlockDecision">
                    <img className="IllustrationDecision" src={documentsCheck} width={113}/>
                    <p className="WhiteTextDecision">Уже почти готово!</p>
                </div>
                <div className="WhiteBlockDecision">

                </div>
                <div className="BlackTextBlockDecision">
                    <p>Что дальше?</p>
                </div>
                <div className="WhiteTextBlockDecision">
                    <p>Наши специалисты обрабатывают вашу заявку.<br/><br/>В течение часа вы получите результат
                        верификации. После этого вы сможете получить авто у дилера.</p>
                </div>
                <div className="RedButtonDecision" onClick={this.onClick}>
                    <p>Личный кабинет</p>
                </div>
            </div>
        )
    }
}

export default AwaitDecision;
