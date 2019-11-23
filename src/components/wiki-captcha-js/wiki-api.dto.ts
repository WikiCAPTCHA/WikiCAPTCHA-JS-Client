export class WikiApiDto {
  public sessionId: string;
  public questionList: QuestionDto[];
}

export class QuestionDto {
  public questionText: string;
  public questionId: string;
  public questionType: QUESTION_TYPES;
  public answersAvailable: AnswerDto[];
}

export class AnswerDto {
  public imgUrl: string;
  public text: string;
  public userAnswer: UserAnswerDto;
}

export class UserAnswerDto {
  public userInput: string;
  public selected: boolean;
}

enum QUESTION_TYPES {
  IMAGE = 'IMG',
  FREE_TEXT = 'INPUT',
  OPTIONS = 'OPTIONS'
}
