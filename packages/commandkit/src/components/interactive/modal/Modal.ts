import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { MaybeArray } from '../../common/types';
import { CommandKitElement } from '../../common/element';
import {
  CommandKitModalBuilderInteractionCollectorDispatchContextData,
  ModalKit,
  OnModalKitEnd,
  OnModalKitSubmit,
} from './ModalKit';
import { EventInterceptorErrorHandler } from '../../common/EventInterceptor';
import { warnDeprecated } from '../../../utils/warning';

/**
 * The properties for the modal component.
 */
export interface ModalProps {
  customId?: string;
  title: string;
  children?: MaybeArray<ModalKit['components'][number]>;
  onSubmit?: OnModalKitSubmit;
  onEnd?: OnModalKitEnd;
  onError?: EventInterceptorErrorHandler;
  options?: CommandKitModalBuilderInteractionCollectorDispatchContextData;
}

/**
 * The modal component.
 * @param props The modal properties.
 * @returns The commandkit element.
 * @example <Modal title="My Modal" onSubmit={onSubmit}>...</Modal>
 */
export function Modal(props: ModalProps): CommandKitElement<'modal'> {
  const modal = new ModalKit();

  if (props.title) {
    modal.setTitle(props.title);
  }

  if (props.onSubmit) {
    props.customId ??= `modalkit::${crypto.randomUUID()}`;
  }

  if (props.customId) {
    modal.setCustomId(props.customId);
  }

  if (props.onSubmit) {
    modal.onSubmit(props.onSubmit, props.options);
  }

  if (props.children) {
    const childs = Array.isArray(props.children)
      ? props.children
      : [props.children];

    modal.components.push(...childs);
  }

  if (props.onEnd) {
    modal.onEnd(props.onEnd);
  }

  if (props.onError) {
    modal.onError(props.onError);
  }

  return modal;
}

export interface TextInputProps {
  customId: string;
  /**
   * @deprecated use the `<Label />` component instead.
   */
  label?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  value?: string;
  required?: boolean;
}

/**
 * The text input component.
 * @param props The text input properties.
 * @returns The commandkit element.
 * @example <TextInput customId="input" style={TextInputStyle.Short} />
 */
export function TextInput(
  props: TextInputProps & { style: TextInputStyle },
): CommandKitElement<'text-input'> {
  const input = new TextInputBuilder().setStyle(props.style);

  if (props.customId) {
    input.setCustomId(props.customId);
  }

  if (props.label) {
    warnDeprecated({
      what: 'Property `label`',
      where: '<TextInput />',
      message: 'Use the <Label /> component instead.',
    });

    input.setLabel(props.label);
  }

  if (props.placeholder) {
    input.setPlaceholder(props.placeholder);
  }

  if (props.maxLength) {
    input.setMaxLength(props.maxLength);
  }

  if (props.minLength) {
    input.setMinLength(props.minLength);
  }

  if (props.value) {
    input.setValue(props.value);
  }

  if (props.required) {
    input.setRequired(props.required);
  }

  return input;
}

/**
 * The short text input component.
 * @param props The text input properties.
 * @returns The commandkit element.
 * @example <ShortInput customId="input" label="Input" />
 */
export function ShortInput(
  props: TextInputProps,
): CommandKitElement<'text-input'> {
  return TextInput({ ...props, style: TextInputStyle.Short });
}

/**
 * The paragraph text input component.
 * @param props The text input properties.
 * @returns The commandkit element.
 * @example <ParagraphInput customId="input" label="Input" />
 */
export function ParagraphInput(
  props: TextInputProps,
): CommandKitElement<'text-input'> {
  return TextInput({ ...props, style: TextInputStyle.Paragraph });
}
