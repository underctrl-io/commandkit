import type { CommandData, ChatInputCommand } from 'commandkit';
import type { AiCommand } from 'commandkit/ai';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { z } from 'zod';
import weather from 'weather-js';

const findWeather = (
  location: string,
  unit: 'C' | 'F',
): Promise<weather.Weather> => {
  return new Promise((resolve, reject) => {
    weather.find({ search: location, degreeType: unit }, (err, result) => {
      if (err) return reject(err);
      if (!result || result.length === 0 || !result[0]) {
        return reject(new Error('Location not found'));
      }
      resolve(result[0]);
    });
  });
};

export const command: CommandData = {
  name: 'weather',
  description: 'Get the current weather for a location',
  options: [
    {
      name: 'location',
      description: 'The location to get weather for',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'unit',
      description: 'The temperature unit (C/F)',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: 'Celsius', value: 'C' },
        { name: 'Fahrenheit', value: 'F' },
      ],
    },
  ],
};

export const aiConfig = {
  inputSchema: z.object({
    location: z.string().describe('The location to get weather for'),
    unit: z
      .enum(['C', 'F'])
      .optional()
      .default('C')
      .describe('The temperature unit (C/F)'),
  }),
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const location = ctx.options.getString('location', true);
  const unit = (ctx.options.getString('unit') as 'C' | 'F') || 'C';

  await ctx.interaction.deferReply();

  try {
    const weatherData = await findWeather(location, unit);

    const embed = new EmbedBuilder()
      .setTitle(`Weather in ${weatherData.location.name}`)
      .setColor('#0099ff')
      .setThumbnail(weatherData.current.imageUrl)
      .addFields(
        {
          name: 'Temperature',
          value: `${weatherData.current.temperature}°${unit}`,
          inline: true,
        },
        {
          name: 'Feels Like',
          value: `${weatherData.current.feelslike}°${unit}`,
          inline: true,
        },
        { name: 'Sky', value: weatherData.current.skytext, inline: true },
        { name: 'Humidity', value: weatherData.current.humidity, inline: true },
        {
          name: 'Wind Speed',
          value: weatherData.current.windspeed,
          inline: true,
        },
      );

    // Add forecast information
    const forecast = weatherData.forecast
      .slice(0, 3)
      .map(
        (day) =>
          `${day.shortday}: ${day.skytextday} (${day.low}°${unit} - ${day.high}°${unit})`,
      )
      .join('\n');

    embed.addFields({ name: '3-Day Forecast', value: forecast });

    if (weatherData.location.alert) {
      embed.addFields({
        name: '⚠️ Weather Alert',
        value: weatherData.location.alert,
      });
    }

    embed.setTimestamp();

    await ctx.interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await ctx.interaction.editReply(
      'Could not find weather information for that location.',
    );
  }
};

export const ai: AiCommand<typeof aiConfig> = async (ctx) => {
  const { location, unit } = ctx.ai.params;

  try {
    const weatherData = await findWeather(location, unit);

    const embed = new EmbedBuilder()
      .setTitle(`Weather in ${weatherData.location.name}`)
      .setColor('#0099ff')
      .setThumbnail(weatherData.current.imageUrl)
      .addFields(
        {
          name: 'Temperature',
          value: `${weatherData.current.temperature}°${unit}`,
          inline: true,
        },
        {
          name: 'Feels Like',
          value: `${weatherData.current.feelslike}°${unit}`,
          inline: true,
        },
        { name: 'Sky', value: weatherData.current.skytext, inline: true },
        { name: 'Humidity', value: weatherData.current.humidity, inline: true },
        {
          name: 'Wind Speed',
          value: weatherData.current.windspeed,
          inline: true,
        },
      );

    // Add forecast information
    const forecast = weatherData.forecast
      .slice(0, 3)
      .map(
        (day) =>
          `${day.shortday}: ${day.skytextday} (${day.low}°${unit} - ${day.high}°${unit})`,
      )
      .join('\n');

    embed.addFields({ name: '3-Day Forecast', value: forecast });

    if (weatherData.location.alert) {
      embed.addFields({
        name: '⚠️ Weather Alert',
        value: weatherData.location.alert,
      });
    }

    embed.setTimestamp();

    await ctx.message.reply({ embeds: [embed] });

    return {
      success: true,
      message: 'Weather information sent in the channel successfully.',
    };
  } catch (error) {
    return {
      error: 'Could not find weather information for that location.',
    };
  }
};
