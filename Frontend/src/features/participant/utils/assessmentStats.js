/*
 * Derives the "N attempted, X correct, Y wrong" counts straight from the
 * per-question lists the report actually renders (mcq_list / scq_list /
 * bucket_list / match_making_list), instead of trusting the aggregate
 * correct/wrong fields the API sends alongside them.
 *
 * Every rendered question already carries a `question_status` of exactly
 * "Correct" or "Wrong" (that's what drives the green/red badge and the
 * "(Your selection - ...)" labels on each option). Counting straight from
 * that list guarantees correct + wrong always equals the number of
 * questions shown — the summary card can never disagree with the
 * question-by-question breakdown underneath it.
 */

export function getModuleQuestionList(module = {}) {
    return [
        ...(module.mcq_list || []),
        ...(module.scq_list || []),
        ...(module.bucket_list || []),
        ...(module.match_making_list || []),
    ];
}

export function deriveModuleStats(module = {}) {
    const questions = getModuleQuestionList(module);
    const completed = questions.length;
    const correct = questions.filter(
        (q) => q.question_status === "Correct"
    ).length;
    // Every attempted question is either Correct or Wrong — deriving wrong
    // as the complement (rather than counting "Wrong" separately) means the
    // two numbers can never both equal the attempted count.
    const wrong = completed - correct;

    return { completed, correct, wrong };
}

/* Sums per-module derived stats into the overall "N attempted / X correct /
   Y wrong" shown at the top of the report. */
export function deriveOverallStats(modules = []) {
    return modules.reduce(
        (totals, module) => {
            const { completed, correct, wrong } = deriveModuleStats(module);
            return {
                completed: totals.completed + completed,
                correct: totals.correct + correct,
                wrong: totals.wrong + wrong,
            };
        },
        { completed: 0, correct: 0, wrong: 0 }
    );
}
