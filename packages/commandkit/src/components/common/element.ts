import { ActionRowBuilder } from 'discord.js';
import type { ButtonKit } from '../button/ButtonKit';
import { warnUnstable } from '../../utils/warn-unstable';

export const ElementType = {
  ActionRow: 'action-row',
  Button: 'button-kit',
} as const;

export type ElementType = (typeof ElementType)[keyof typeof ElementType];

export interface CommandKitElementData {
  [ElementType.ActionRow]: ActionRowBuilder;
  [ElementType.Button]: ButtonKit;
}

export type CommandKitElement<Type extends ElementType> =
  CommandKitElementData[Type];

export type AnyCommandKitElement = CommandKitElement<ElementType>;

export function isCommandKitElement(
  element: unknown,
): element is CommandKitElement<ElementType> {
  if (typeof element !== 'object' || element === null) return false;
  if (!Reflect.has(element, 'type')) return false;
  if (!Reflect.has(element, 'data')) return false;

  return true;
}

export function getElement<
  T extends ElementType,
  E extends CommandKitElement<T>,
>(element: E): CommandKitElementData[T] {
  return element.data as CommandKitElementData[T];
}

export interface FragmentElementProps {
  children: [];
}

export function Fragment(
  props: FragmentElementProps,
): CommandKitElementData[ElementType][] {
  warnUnstable('CommandKit JSX');
  return Array.isArray(props.children) ? props.children.flat() : props.children;
}

export function createElement(
  type: Function,
  props: Record<string, unknown>,
  ...children: any[]
): CommandKitElement<ElementType> {
  warnUnstable('CommandKit JSX');
  return type({ ...props, children });
}
