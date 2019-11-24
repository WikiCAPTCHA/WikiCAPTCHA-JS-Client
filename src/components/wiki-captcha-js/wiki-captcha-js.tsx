import {Component, Event, EventEmitter, Prop, State} from '@stencil/core';
import {
  AnswerDto,
  QUESTION_TYPES,
  QuestionDto,
  UserAnswerDto,
  UserAnswersResponseDto,
  WikiApiDto
} from './wiki-api.dto';
// import {WikiDataFactory} from "../../test/factory";

@Component({
  tag: 'wikidata-captcha-js',
  styleUrl: './wiki-captcha-js.css',
  shadow: true
})
export class WikiCaptchaJs {

  private readonly QUESTION_INDEX = 0;
  private readonly WIKI_DATA_URL = 'http://192.168.1.142:8080';
  private readonly WIKI_DATA_ICON = 'https://upload.wikimedia.org/wikipedia/commons/6/66/Wikidata-logo-en.svg';
  private readonly IMAGES_PER_CAPTCHA = 9;
  private captchaInput: HTMLInputElement;
  private currentQuestion: QuestionDto;

  @Prop({ mutable: true, reflectToAttr: true }) language: string = 'en';

  @State() private questionList: WikiApiDto;
  @State() private loading = false;
  @State() private error = false;

  @Event({bubbles: true, composed: true}) wikiIsHuman: EventEmitter<boolean>;

  componentWillLoad() {
    this.language = 'en';
  }

  componentDidLoad() {
    this.fetchQuestions();
  }

  render() {
    let questionText = null;
    let images = null;
    let htmlContent = null;
    this.currentQuestion = null;
    this.captchaInput = null;

    if (this.questionList && this.questionList.questionList.length > 0) {
      this.currentQuestion = this.questionList.questionList[this.QUESTION_INDEX];
      questionText = this.currentQuestion.questionText;

      switch (this.currentQuestion.questionType) {
        case QUESTION_TYPES.IMAGE:
          images = this.renderImageQuestionContent(this.currentQuestion);
          break;
        case QUESTION_TYPES.FREE_TEXT:
          images = (<input id="wiki-data-captcha-input" type="text" ref={el => (this.captchaInput = el)}/>);
          break;
        case QUESTION_TYPES.OPTIONS:
        default:
          this.error = true;
      }
    }

    if (this.error) {
      htmlContent = [<p class="wiki-captcha-error">Oops, something went wrong!</p>,
        this.renderFooter()];
    }
    else if (this.loading) {
      htmlContent = <wiki-data-spinner></wiki-data-spinner>;
    } else {
      htmlContent = [
      <p>{questionText}</p>,
      <div class="wiki-captcha-img-container">
        {images}
      </div>,
      this.renderFooter()]
    }

    return (<div class="wiki-captcha-box">
      {htmlContent}
    </div>);
  }

  renderFooter() {
    let submitHtml = null;
    if (!this.error) {
      submitHtml = (<div class="wiki-captcha-submit">
        <button type="button" onClick={this.onSubmitCaptchaAnswers.bind(this)}>SUBMIT</button>
      </div>);
    }
    return (
      <div class="wiki-captcha-footer">
        {submitHtml}
        <div class="wiki-captcha-powered-by">
          <p>Powered By</p>
          <img src={this.WIKI_DATA_ICON} alt="Wikidata icon" class="wiki-captcha-powered-by-icon"/>
        </div>
      </div>);
  }

  renderImageQuestionContent(question: QuestionDto) {
    const maxImageSize = question.answersAvailable.length < this.IMAGES_PER_CAPTCHA ? question.answersAvailable.length : this.IMAGES_PER_CAPTCHA;
    return question.answersAvailable.slice(0, maxImageSize).map(a =>
        (<div class="wiki-captcha-img-overlay wiki-captcha-img-overlay-off" onClick={this.onImageClick.bind(this, a)}>
          <img src={a.imgUrl} class="wiki-captcha-img" alt="possible captcha answer"/>
        </div>));
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
    this.loading = true;
    this.error = false;
    switch (this.currentQuestion.questionType) {
      case QUESTION_TYPES.FREE_TEXT:
        this.currentQuestion.answersAvailable[0].userAnswer = new UserAnswerDto();
        this.currentQuestion.answersAvailable[0].userAnswer.userInput = this.captchaInput.value;
        break;
    }
    console.log('BODY', this.questionList);
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
        this.error = false;
        const response = respParsed as UserAnswersResponseDto;
        this.wikiIsHuman.emit(response.human);
        this.fetchQuestions();
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
        this.error = true;
      });
  }

  fetchQuestions() {
    this.loading = true;
    this.error = false;
    const requestBody = {
      'language': this.language,
      'appid': 1
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
        // this.questionList = new WikiDataFactory().getQuestions();
        this.loading = false;
        this.error = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
        this.error = true;
      });
  }
}
