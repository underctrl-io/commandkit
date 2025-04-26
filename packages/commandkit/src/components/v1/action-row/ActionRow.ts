import { ActionRowBuilder } from 'discord.js';
import { AnyCommandKitElement, CommandKitElement } from '../../common/element';

export interface ActionRowProps {
  children?: AnyCommandKitElement[] | AnyCommandKitElement;
}

/**
 * The action row component.
 * @param props The action row properties.
 * @returns The commandkit element.
 * @example <ActionRow><Button label="Click me" style={ButtonStyle.Primary} customId="click_me" /></ActionRow>
 */
export function ActionRow(
  props: ActionRowProps,
): CommandKitElement<'action-row'> {
  const row = new ActionRowBuilder();

  if (Array.isArray(props.children)) {
    // @ts-ignore
    row.setComponents(...props.children);
  } else if (props.children) {
    // @ts-ignore
    row.setComponents(props.children);
  }

  return row;
}
