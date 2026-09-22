// Educational copy and original classroom examples. These activities are not
// standardized assessments; references describe the concepts, not this app's validity.

const memorySource = 'https://openstax.org/books/psychology-2e/pages/8-1-how-memory-functions';
const biasSource = 'https://openstax.org/books/introduction-philosophy/pages/2-2-overcoming-cognitive-biases-and-engaging-in-critical-reflection';
const confirmationSource = 'https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings';

export const lessons = [
  {
    id: 'stroop',
    title: 'Color, meet conflict',
    concept: 'Selective attention · Stroop interference',
    explanation: 'Try naming the ink color while a familiar word pulls you toward another answer. For fluent readers, reading is highly practiced and can happen even when the task asks us to ignore the word. When word and ink disagree, that competing information can make choosing the ink color slower or less accurate. Your round mixes six matching and six mismatching trials in shuffled order. Compare the two conditions with curiosity: a single short round may show a difference, no difference, or a reversal. None of those outcomes defines your ability to pay attention.',
    takeaway: 'When information competes for attention, make the relevant cue clear and reduce distractions.',
    limitation: 'A 12-trial, uncontrolled browser demo cannot diagnose attention or compare you with other people. Reading fluency, color perception, practice, device timing, and response method affect results.',
    sourceLabel: 'J. R. Stroop (1935) · original study, York University archive',
    sourceUrl: 'https://www.yorku.ca/pclassic/Stroop/',
  },
  {
    id: 'memory',
    title: 'A little déjà vu',
    concept: 'Encoding · recognition and recall',
    explanation: 'First meet six words, then look for them among twelve options. Seeing a studied word again supplies a cue: this is recognition. Recall would ask you to produce the words without showing the options. Both involve retrieving information, but they make different demands. The way you first process a word is called encoding; connecting it with a meaningful image or idea can support remembering. Here, notice which words seem familiar and which you can link to the study list. Familiarity is useful evidence, but a new word can also feel familiar.',
    takeaway: 'After reviewing a topic, try explaining it with the page closed; recognizing an answer and producing it are different tasks.',
    limitation: 'This short recognition activity does not measure IQ or working-memory capacity. Guessing, attention, word familiarity, and repeated exposure can change the result.',
    sourceLabel: 'OpenStax · Psychology 2e, 8.1 How Memory Functions',
    sourceUrl: memorySource,
  },
  {
    id: 'bias',
    title: 'Pause the shortcut',
    concept: 'Everyday judgment · cognitive biases',
    explanation: 'Everyday decisions often use shortcuts. They can save effort, yet steer us away from useful evidence. Confirmation bias favors information that supports an existing belief. The availability heuristic estimates likelihood using examples that come easily to mind. Sunk-cost reasoning lets an unrecoverable past investment drive a new decision. In these three fictional situations, choose a next step that addresses the specific problem. The aim is to practice asking better questions, not to label yourself as rational or biased. Real choices can involve several influences at once, including values and information missing from a short scenario.',
    takeaway: 'Ask what could change your mind, check how common something really is, and separate past spending from future benefits.',
    limitation: 'Three teaching questions check understanding of these examples. They do not establish a personality type, predict behavior, or show that someone is free from bias.',
    sourceLabel: 'OpenStax · Introduction to Philosophy, 2.2 Cognitive Biases',
    sourceUrl: biasSource,
  },
];

export const biasQuestions = [
  {
    id: 'confirmation',
    scenario: 'Alex believes a study app improves learning and saves only glowing reviews, skipping reports that it did not help. Which next step would best test the belief?',
    choices: [
      'Collect more glowing reviews from the same discussion.',
      'Compare supporting and conflicting evidence using the same quality criteria.',
      'Count how many people recognize the app’s logo.',
    ],
    answer: 1,
    explanation: 'Confirmation bias can shape which evidence we seek and accept. Checking credible counterevidence makes the belief easier to test; it does not require treating every review as equally reliable.',
    concept: 'Confirmation bias',
  },
  {
    id: 'availability',
    scenario: 'After seeing two vivid videos of stolen bikes, Sam concludes that most bikes on campus are stolen each year. What evidence would best check that estimate?',
    choices: [
      'The recorded theft rate, with a relevant time period and number of bikes at risk.',
      'How upsetting the two videos feel.',
      'How quickly another theft story comes to mind.',
    ],
    answer: 0,
    explanation: 'The availability heuristic uses ease of remembering as a clue to likelihood. Vivid examples need not reflect frequency. A relevant rate is more informative, while its data quality still matters.',
    concept: 'Availability heuristic',
  },
  {
    id: 'sunk-cost',
    scenario: 'Mina bought a nonrefundable puzzle book. The remaining puzzles are no longer enjoyable, but Mina keeps doing them only because the book cost money. What question would help decide how to spend the next hour?',
    choices: [
      'How can I prove the purchase was a good idea?',
      'Would a more expensive book deserve more of my time?',
      'Which available activity offers the most value to me from now on?',
    ],
    answer: 2,
    explanation: 'The payment cannot be recovered by spending more time. Sunk-cost reasoning gives that past cost extra influence. Compare future enjoyment, effort, and alternatives; continuing can still make sense if its future benefits justify it.',
    concept: 'Sunk-cost fallacy',
  },
];

export const psychTerms = [
  {
    term: 'Selective attention',
    definition: 'Prioritizing some information while other information receives less attention.',
    example: 'Focusing on a word’s ink color while trying to ignore what it says.',
    sourceLabel: 'APA Dictionary · selective attention',
    sourceUrl: 'https://dictionary.apa.org/selective-attention',
  },
  {
    term: 'Automaticity',
    definition: 'A process happening quickly, with little deliberate effort or intention.',
    example: 'A fluent reader notices a familiar word’s meaning before deciding to read it.',
    sourceLabel: 'APA Dictionary · automaticity',
    sourceUrl: 'https://dictionary.apa.org/automaticity',
  },
  {
    term: 'Encoding',
    definition: 'Processing incoming information so it can be represented in memory.',
    example: 'Connecting the word “lantern” to an image while studying a list.',
    sourceLabel: 'OpenStax · Psychology 2e, 8.1',
    sourceUrl: memorySource,
  },
  {
    term: 'Recognition',
    definition: 'Identifying information as previously encountered when it appears again.',
    example: 'Picking a studied word out of a list containing new words.',
    sourceLabel: 'OpenStax · Psychology 2e, 8.1',
    sourceUrl: memorySource,
  },
  {
    term: 'Recall',
    definition: 'Retrieving information without the answer itself being presented.',
    example: 'Writing the studied words on a blank page without answer options.',
    sourceLabel: 'OpenStax · Psychology 2e, 8.1',
    sourceUrl: memorySource,
  },
  {
    term: 'Confirmation bias',
    definition: 'Favoring evidence that supports a belief while overlooking evidence that challenges it.',
    example: 'Saving only reviews that agree with your opinion about an app.',
    sourceLabel: 'OpenStax · Psychology 2e, 2.3',
    sourceUrl: confirmationSource,
  },
  {
    term: 'Availability heuristic',
    definition: 'Judging likelihood partly by how readily examples come to mind.',
    example: 'Treating a memorable campus story as evidence that the event is common.',
    sourceLabel: 'APA Dictionary · availability heuristic',
    sourceUrl: 'https://dictionary.apa.org/availability-heuristic',
  },
  {
    term: 'Sunk-cost fallacy',
    definition: 'Letting an unrecoverable past investment drive a decision about further investment.',
    example: 'Continuing an unwanted activity solely because you already paid for it.',
    sourceLabel: 'OpenStax · Introduction to Philosophy, 2.2',
    sourceUrl: biasSource,
  },
];
