import {
  APISelectMenuOption,
  BaseSelectMenuComponentData,
  ChannelSelectMenuComponentData,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuComponentData,
  MentionableSelectMenuInteraction,
  RoleSelectMenuComponentData,
  RoleSelectMenuInteraction,
  SelectMenuComponentOptionData,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  UserSelectMenuComponentData,
  UserSelectMenuInteraction,
} from 'discord.js';
import { ChannelSelectMenuKit } from './ChannelSelectMenuKit';
import { MentionableSelectMenuKit } from './MentionableSelectMenuKit';
import { RoleSelectMenuKit } from './RoleSelectMenuKit';
import { StringSelectMenuKit } from './StringSelectMenuKit';
import { UserSelectMenuKit } from './UserSelectMenuKit';
import { MaybeArray } from '../../common/types';
import {
  CommandKitSelectMenuBuilderInteractionCollectorDispatch,
  CommandKitSelectMenuBuilderInteractionCollectorDispatchContextData,
  CommandKitSelectMenuBuilderOnEnd,
} from './common';

export interface CommonSelectMenuProps<T, C> {
  onSelect?: CommandKitSelectMenuBuilderInteractionCollectorDispatch<T, C>;
  onEnd?: CommandKitSelectMenuBuilderOnEnd;
  onError?: (error: Error) => any;
  options?: CommandKitSelectMenuBuilderInteractionCollectorDispatchContextData;
}

export interface SelectMenuProps<T, C>
  extends Partial<Omit<BaseSelectMenuComponentData, 'type'>>,
    CommonSelectMenuProps<T, C> {}

export interface StringSelectMenuProps
  extends SelectMenuProps<StringSelectMenuInteraction, StringSelectMenuKit> {
  children?: MaybeArray<StringSelectMenuOptionBuilder>;
}

export type CommonBuilderKit =
  | StringSelectMenuKit
  | UserSelectMenuKit
  | RoleSelectMenuKit
  | ChannelSelectMenuKit
  | MentionableSelectMenuKit;

export type ResolveBuilderInteraction<T> = T extends StringSelectMenuKit
  ? StringSelectMenuInteraction
  : T extends UserSelectMenuKit
    ? UserSelectMenuInteraction
    : T extends RoleSelectMenuKit
      ? RoleSelectMenuInteraction
      : T extends ChannelSelectMenuKit
        ? ChannelSelectMenuInteraction
        : T extends MentionableSelectMenuKit
          ? MentionableSelectMenuInteraction
          : never;

function applyPropsToBuilder<B extends CommonBuilderKit>(
  builder: B,
  props: Partial<Omit<BaseSelectMenuComponentData, 'type'>> &
    CommonSelectMenuProps<ResolveBuilderInteraction<B>, B>,
) {
  builder.setCustomId(props.customId ?? `select-menu::${crypto.randomUUID()}`);

  if (props.maxValues != null) {
    builder.setMaxValues(props.maxValues);
  }

  if (props.minValues != null) {
    builder.setMinValues(props.minValues);
  }

  if (props.placeholder) {
    builder.setPlaceholder(props.placeholder);
  }

  if (props.disabled) {
    builder.setDisabled(props.disabled);
  }

  if (props.onEnd) {
    builder.onEnd(props.onEnd);
  }

  if (props.onError) {
    builder.onError(props.onError);
  }

  if (props.onSelect) {
    // @ts-ignore
    builder.onSelect(props.onSelect, props.options);
  }
}

export function StringSelectMenu(props: StringSelectMenuProps) {
  const builder = new StringSelectMenuKit();

  applyPropsToBuilder(builder, props);

  if (props.children) {
    builder.setOptions(
      Array.isArray(props.children) ? props.children : [props.children],
    );
  }

  if (props.children) {
    builder.setOptions(
      Array.isArray(props.children) ? props.children : [props.children],
    );
  }

  return builder;
}

export type StringSelectMenuOptionProps =
  | SelectMenuComponentOptionData
  | APISelectMenuOption;

export function StringSelectMenuOption(props: StringSelectMenuOptionProps) {
  return new StringSelectMenuOptionBuilder(props);
}

export interface UserSelectMenuProps
  extends Partial<Omit<UserSelectMenuComponentData, 'type'>>,
    CommonSelectMenuProps<UserSelectMenuInteraction, UserSelectMenuKit> {}

export function UserSelectMenu(props: UserSelectMenuProps) {
  const builder = new UserSelectMenuKit();

  applyPropsToBuilder(builder, props);

  if (props.defaultValues) {
    builder.setDefaultUsers(
      Array.isArray(props.defaultValues)
        ? props.defaultValues
        : [props.defaultValues],
    );
  }

  return builder;
}

export interface RoleSelectMenuProps
  extends Partial<Omit<RoleSelectMenuComponentData, 'type'>>,
    CommonSelectMenuProps<RoleSelectMenuInteraction, RoleSelectMenuKit> {}

export function RoleSelectMenu(props: RoleSelectMenuProps) {
  const builder = new RoleSelectMenuKit();

  applyPropsToBuilder(builder, props);

  if (props.defaultValues) {
    builder.setDefaultRoles(
      Array.isArray(props.defaultValues)
        ? props.defaultValues
        : [props.defaultValues],
    );
  }

  return builder;
}

export interface MentionableSelectMenuProps
  extends Partial<Omit<MentionableSelectMenuComponentData, 'type'>>,
    CommonSelectMenuProps<
      MentionableSelectMenuInteraction,
      MentionableSelectMenuKit
    > {}

export function MentionableSelectMenu(props: MentionableSelectMenuProps) {
  const builder = new MentionableSelectMenuKit();

  applyPropsToBuilder(builder, props);

  if (props.defaultValues) {
    builder.setDefaultValues(
      Array.isArray(props.defaultValues)
        ? props.defaultValues
        : [props.defaultValues],
    );
  }

  return builder;
}

export interface ChannelSelectMenuProps
  extends Partial<Omit<ChannelSelectMenuComponentData, 'type'>>,
    CommonSelectMenuProps<ChannelSelectMenuInteraction, ChannelSelectMenuKit> {}

export function ChannelSelectMenu(props: ChannelSelectMenuProps) {
  const builder = new ChannelSelectMenuKit();

  applyPropsToBuilder(builder, props);

  if (props.defaultValues) {
    builder.setDefaultChannels(
      Array.isArray(props.defaultValues)
        ? props.defaultValues
        : [props.defaultValues],
    );
  }

  if (props.channelTypes) {
    builder.setChannelTypes(
      Array.isArray(props.channelTypes)
        ? props.channelTypes
        : [props.channelTypes],
    );
  }

  return builder;
}
