import {AnswerDto, QUESTION_TYPES, QuestionDto, WikiApiDto} from '../components/wiki-captcha-js/wiki-api.dto';

export class WikiDataFactory {

  public getQuestions(): WikiApiDto {
    const questions = new WikiApiDto();
    questions.sessionId = 'abcd';
    questions.questionList = [];
    questions.questionList.push(this.getSingleQuestionImg());
    questions.questionList.push(this.getSingleQuestionInput());
    return questions;
  }

  private getSingleQuestionInput(): QuestionDto {
    const question = new QuestionDto();
    question.questionId = '1';
    question.questionText = 'How many moons does Earth have?';
    question.questionType = QUESTION_TYPES.FREE_TEXT;
    question.answersAvailable = [];
    question.answersAvailable.push(this.getAnswer('', '1'));
    return question;
  }

  private getSingleQuestionImg(): QuestionDto {
    const question = new QuestionDto();
    question.questionId = '1';
    question.questionText = 'Select ALL images with men';
    question.questionType = QUESTION_TYPES.IMAGE;
    question.answersAvailable = [];
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/f/ff/Human-man.png'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/1/12/Billie_Holiday_0001_original.jpg'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/b/bf/Angela_Merkel._Tallinn_Digital_Summit.jpg'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/f/ff/Human-man.png'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/f/ff/Human-man.png'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/f/ff/Human-man.png'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/f/ff/Human-man.png'));
    question.answersAvailable.push(this.getAnswer('https://upload.wikimedia.org/wikipedia/commons/f/ff/Human-man.png'));
    return question;
  }

  private getAnswer(img: string, text?: string): AnswerDto {
    const answer = new AnswerDto();
    answer.imgUrl = img;
    answer.text = text;
    return answer;
  }
}
