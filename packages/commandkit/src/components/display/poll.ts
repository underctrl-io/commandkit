import {
  PollLayoutType,
  type PollAnswerData,
  type PollData,
  type PollQuestionMedia,
} from 'discord.js';

/**
 * The poll properties for the poll component.
 */
export interface PollProps
  extends Partial<Omit<PollData, 'question' | 'answers'>> {
  /**
   * The poll children components (question and answers).
   */
  children: PollChildrenType[];
}

enum PollChildType {
  Answer,
  Question,
}

type PollChild<T, Type extends PollChildType> = T & {
  $$typeof: Type;
};

export type PollChildrenType =
  | PollChild<PollQuestionProps, PollChildType.Question>
  | PollChild<PollAnswerProps, PollChildType.Answer>;

/**
 * The poll component creates a Discord poll with a question and multiple answer options.
 * @param props The poll properties.
 * @returns The poll data object.
 * @example ```tsx
 * import { Poll, PollQuestion, PollAnswer } from 'commandkit';
 *
 * const poll = <Poll duration={24} allowMultiselect={false}>
 *   <PollQuestion>What's your favorite color?</PollQuestion>
 *   <PollAnswer emoji="🟥">Red</PollAnswer>
 *   <PollAnswer emoji="🟦">Blue</PollAnswer>
 *   <PollAnswer emoji="🟩">Green</PollAnswer>
 * </Poll>;
 * ```
 */
export function Poll({ children, ...props }: PollProps): PollData {
  const question = children.find(
    (child): child is PollChild<PollQuestionProps, PollChildType.Question> =>
      child.$$typeof === PollChildType.Question,
  );

  if (!question) {
    throw new Error('Poll question is required');
  }

  const answers = children.filter(
    (child): child is PollChild<PollAnswerProps, PollChildType.Answer> =>
      child.$$typeof === PollChildType.Answer,
  );

  const { children: questionChildren, ...questionProps } = question;
  const { duration, allowMultiselect, layoutType, ...restProps } = props;

  return {
    duration: duration ?? 24,
    allowMultiselect: allowMultiselect ?? false,
    layoutType: layoutType ?? PollLayoutType.Default,
    ...restProps,
    question: { text: questionChildren, ...questionProps },
    answers: answers.map(
      ({ children: answerChildren, $$typeof, ...answerProps }) => ({
        text: answerChildren,
        ...answerProps,
      }),
    ),
  };
}

/**
 * The poll question properties for the poll question component.
 */
export interface PollQuestionProps extends Omit<PollQuestionMedia, 'text'> {
  /**
   * The question text content.
   */
  children: PollQuestionMedia['text'];
}

/**
 * The poll question component defines the question text for a Discord poll.
 * @param props The poll question properties.
 * @returns The poll question media object.
 * @example ```tsx
 * import { PollQuestion } from 'commandkit';
 *
 * const question = <PollQuestion>What's your favorite programming language?</PollQuestion>;
 * ```
 */
export function PollQuestion({
  children,
  ...props
}: PollQuestionProps): PollChild<PollQuestionMedia, PollChildType.Question> {
  return { ...props, text: children, $$typeof: PollChildType.Question };
}

/**
 * The poll answer properties for the poll answer component.
 */
export interface PollAnswerProps extends Omit<PollAnswerData, 'text'> {
  /**
   * The answer text content.
   */
  children: PollAnswerData['text'];
}

/**
 * The poll answer component defines an answer option for a Discord poll.
 * @param props The poll answer properties.
 * @returns The poll answer data object.
 * @example ```tsx
 * import { PollAnswer } from 'commandkit';
 *
 * const answer = <PollAnswer emoji="🟦">TypeScript</PollAnswer>;
 * ```
 */
export function PollAnswer({
  children,
  ...props
}: PollAnswerProps): PollChild<PollAnswerData, PollChildType.Answer> {
  return { ...props, text: children, $$typeof: PollChildType.Answer };
}
