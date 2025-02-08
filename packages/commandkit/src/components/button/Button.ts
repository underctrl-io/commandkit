import { ButtonStyle, ComponentEmojiResolvable } from 'discord.js';
import {
  ButtonKit,
  CommandKitButtonBuilderOnEnd,
  type CommandKitButtonBuilderInteractionCollectorDispatch,
  type CommandKitButtonBuilderInteractionCollectorDispatchContextData,
} from './ButtonKit';
import { CommandKitElement } from '../common/element';
import { MaybeArray } from '../common/types';
import { EventInterceptorErrorHandler } from '../common/EventInterceptor';

export type ButtonChildrenLike = string | number | boolean;

export interface ButtonProps {
  label?: string;
  style?: ButtonStyle;
  emoji?: ComponentEmojiResolvable;
  disabled?: boolean;
  customId?: string;
  url?: string;
  skuId?: string;
  onClick?: CommandKitButtonBuilderInteractionCollectorDispatch;
  onError?: EventInterceptorErrorHandler;
  options?: CommandKitButtonBuilderInteractionCollectorDispatchContextData;
  onEnd?: CommandKitButtonBuilderOnEnd;
  children?: MaybeArray<ButtonChildrenLike>;
}

/**
 * The button component.
 * @param props The button properties.
 * @returns The commandkit element.
 * @example <Button style={ButtonStyle.Primary} customId="click_me">Click Me</Button>
 */
export function Button(props: ButtonProps): CommandKitElement<'button-kit'> {
  const button = new ButtonKit();

  props.style ??= ButtonStyle.Primary;

  // auto-generate customId if not provided (only if onClick is set)
  if (props.onClick) {
    props.customId ??= `buttonkit::${crypto.randomUUID()}`;
  }

  if (props.customId) {
    button.setCustomId(props.customId);
  }

  if (props.onClick) {
    button.onClick(props.onClick, props.options);
  }

  if (props.disabled) {
    button.setDisabled(props.disabled);
  }

  if (props.emoji) {
    button.setEmoji(props.emoji);
  }

  if (props.skuId) {
    button.setSKUId(props.skuId);
  }

  if (props.url) {
    button.setURL(props.url);
  }

  if (props.style) {
    button.setStyle(props.style);
  }

  const label = props.label || props.children;

  if (label) {
    button.setLabel(
      Array.isArray(label)
        ? label.join(' ')
        : typeof label === 'string'
          ? label
          : String(label),
    );
  }

  if (props.onEnd) {
    button.onEnd(props.onEnd);
  }

  if (props.onError) {
    button.onError(props.onError);
  }

  return button;
}
