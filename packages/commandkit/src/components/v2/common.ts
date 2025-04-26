import { ComponentBuilder } from 'discord.js';

export function applyId(props: { id?: number }, component: ComponentBuilder) {
  if (props.id != null) {
    component.setId(props.id);
  }
}
