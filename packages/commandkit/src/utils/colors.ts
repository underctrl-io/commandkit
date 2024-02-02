const resetColor = '\x1b[0m';

export default {
  reset: (text: string) => `${text}${resetColor}`,
  bright: (text: string) => `\x1b[1m${text}${resetColor}`,
  dim: (text: string) => `\x1b[2m${text}${resetColor}`,
  underscore: (text: string) => `\x1b[4m${text}${resetColor}`,
  blink: (text: string) => `\x1b[5m${text}${resetColor}`,
  reverse: (text: string) => `\x1b[7m${text}${resetColor}`,
  hidden: (text: string) => `\x1b[8m${text}${resetColor}`,

  black: (text: string) => `\x1b[30m${text}${resetColor}`,
  red: (text: string) => `\x1b[31m${text}${resetColor}`,
  green: (text: string) => `\x1b[32m${text}${resetColor}`,
  yellow: (text: string) => `\x1b[33m${text}${resetColor}`,
  blue: (text: string) => `\x1b[34m${text}${resetColor}`,
  magenta: (text: string) => `\x1b[35m${text}${resetColor}`,
  cyan: (text: string) => `\x1b[36m${text}${resetColor}`,
  white: (text: string) => `\x1b[37m${text}${resetColor}`,

  bgBlack: (text: string) => `\x1b[40m${text}${resetColor}`,
  bgRed: (text: string) => `\x1b[41m${text}${resetColor}`,
  bgGreen: (text: string) => `\x1b[42m${text}${resetColor}`,
  bgYellow: (text: string) => `\x1b[43m${text}${resetColor}`,
  bgBlue: (text: string) => `\x1b[44m${text}${resetColor}`,
  bgMagenta: (text: string) => `\x1b[45m${text}${resetColor}`,
  bgCyan: (text: string) => `\x1b[46m${text}${resetColor}`,
  bgWhite: (text: string) => `\x1b[47m${text}${resetColor}`,
};
