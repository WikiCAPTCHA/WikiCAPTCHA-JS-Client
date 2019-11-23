import {Component, State} from '@stencil/core';
import {AnswerDto, UserAnswerDto, WikiApiDto} from './wiki-api.dto';

@Component({
  tag: 'wikidata-captcha-js',
  styleUrl: './wiki-captcha-js.css',
  shadow: true
})
export class WikiCaptchaJs {

  private readonly WIKI_DATA_URL = 'http://192.168.1.142:8080';
  private readonly WIKI_DATA_ICON = 'https://upload.wikimedia.org/wikipedia/commons/6/66/Wikidata-logo-en.svg';
  private readonly IMAGES_PER_CAPTCHA = 9;

  @State() private questionList: WikiApiDto;
  @State() private loading = false;

  componentDidLoad() {
    this.fetchQuestions();
  }

  render() {
    let question = null;
    let questionText = null;
    let images = null;
    let htmlContent = null;

    if (this.questionList && this.questionList.questionList.length > 0) {
      question = this.questionList.questionList[0];
      questionText = question.questionText;

      const maxImageSize = question.answersAvailable.length < this.IMAGES_PER_CAPTCHA ? question.answersAvailable.length : this.IMAGES_PER_CAPTCHA;
      images = (question.answersAvailable.slice(0, maxImageSize).map(a =>
        (<img src={a.imgUrl} class="wiki-captcha-img" alt="possible captcha answer" onClick={this.onImageClick.bind(this, a)}/>
        ))
      );
    }

    if (this.loading) {
      htmlContent = <wiki-data-spinner></wiki-data-spinner>;
    } else {
      htmlContent = [
      <p>{questionText}</p>,
      <div class="wiki-captcha-img-container">
        {images}
      </div>,
      <div class="wiki-captcha-footer">
        <div class="wiki-captcha-submit">
          <button type="button" onClick={this.onSubmitCaptchaAnswers.bind(this)}>SUBMIT</button>
        </div>
        <div class="wiki-captcha-powered-by">
          <p>Powered By</p>
          <img src={this.WIKI_DATA_ICON} alt="Wikidata icon" class="wiki-captcha-powered-by-icon"/>
        </div>
      </div>]
    }

    return (<div class="wiki-captcha-box">
      {htmlContent}
    </div>);
  }

  onImageClick(answer: AnswerDto, event: Event) {
    if (!answer.userAnswer) {
      answer.userAnswer = new UserAnswerDto();
      answer.userAnswer.selected = false;
    }
    answer.userAnswer.selected = !answer.userAnswer.selected;

    const imgElem = event.target as HTMLImageElement;
    if (answer.userAnswer.selected) {
      imgElem.classList.add('wiki-captcha-img-selected');
    } else {
      imgElem.classList.remove('wiki-captcha-img-selected');
    }
    console.log('event', imgElem);
  }

  onSubmitCaptchaAnswers() {
    fetch(
      this.WIKI_DATA_URL + '/answers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(this.questionList)
      }
    )
      .then(() => {
        this.loading = false;
        this.fetchQuestions();
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
      });
  }

  fetchQuestions() {
    this.loading = true;
    const requestBody = {
      'language': 'en'
    };
    fetch(
      this.WIKI_DATA_URL + '/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    )
      .then(res => res.json())
      .then(parsedRes => {
        this.questionList = parsedRes as WikiApiDto;
        this.loading = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
      });
  }
}
