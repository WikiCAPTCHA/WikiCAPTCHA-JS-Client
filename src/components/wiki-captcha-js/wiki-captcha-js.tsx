import {Component, State} from '@stencil/core';
import {AnswerDto, UserAnswerDto, UserAnswersResponseDto, WikiApiDto} from './wiki-api.dto';

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
        (<div class="wiki-captcha-img-overlay wiki-captcha-img-overlay-off" onClick={this.onImageClick.bind(this, a)}>
          <img src={a.imgUrl} class="wiki-captcha-img" alt="possible captcha answer"/>
        </div>))
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

    const divElement = event.target as HTMLDivElement;
    if (answer.userAnswer.selected) {
      divElement.classList.remove('wiki-captcha-img-overlay-off');
      divElement.classList.add('wiki-captcha-img-overlay-on');
    } else {
      divElement.classList.remove('wiki-captcha-img-overlay-on');
      divElement.classList.add('wiki-captcha-img-overlay-off');
    }
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
      .then(res => res.json())
      .then((respParsed) => {
        this.loading = false;
        const response = respParsed as UserAnswersResponseDto;
        if (response.human) {
          alert('You are a human!');
        } else {
          alert('You are NOT a human!');
        }
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
