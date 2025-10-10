import {
  APIComponentInLabel,
  LabelBuilder,
  type LabelBuilderData,
} from 'discord.js';
import { applyId } from './common';

/**
 * The label properties for the label component.
 */
export interface LabelProps
  extends Omit<LabelBuilderData, 'component' | 'type'> {
  /**
   * The component that will be wrapped by the label component.
   */
  children: LabelBuilderData['component'] & {};
}

/**
 * The label component wraps modal components with text as a label and optional description.
 * @param props The label properties.
 * @returns The label builder instance.
 * @example ```tsx
 * import { Label } from 'commandkit';
 *
 * const label = <Label label="Name" description="Enter your name">
 *   <ShortInput customId="name" label="Name" placeholder="John" required />
 * </Label>;
 * ```
 */
export function Label(props: LabelProps) {
  const { children, id, ...rest } = props;

  const label = new LabelBuilder({
    ...rest,
    // channel select menu builder is missing?
    component: children as unknown as APIComponentInLabel,
  });

  applyId(props, label);

  return label;
}
