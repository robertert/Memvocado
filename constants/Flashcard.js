import SuperMemo2 from "./SuperMemo2";

class Flashcard {
  constructor(
    question,
    answer,
    lastReviewDate = new Date(),
    difficulty = 2.5,
    nextReviewInterval = 1,
    grade = -1,
    nextReviewDate = new Date()
  ) {
    this.question = question;
    this.answer = answer;
    this.lastReviewDate = lastReviewDate;
    this.difficulty = difficulty; // Initial difficulty
    this.nextReviewInterval = nextReviewInterval; // Initial review interval
    this.grade = grade;
    this.nextReviewDate = nextReviewDate;
  }

  reviewSuperMemo(userPerformance) {
    switch (userPerformance) {
      case 1:
        userPerformance = 2;
        break;
      case 2:
        userPerformance = 4;
        break;
      case 3:
        userPerformance = 5;
        break;
      default:
        userPerformance = 0;
    }
    const superMemo = new SuperMemo2();
    const { interval, difficulty } = superMemo.calculate(
      userPerformance,
      this.difficulty,
      this.nextReviewInterval
    );

    // Update flashcard data
    this.lastReviewDate = new Date();
    this.difficulty = difficulty;
    this.nextReviewInterval = interval;
    this.grade = userPerformance;
    // Schedule next review based on interval
    // ...
  }
}

export default Flashcard;
