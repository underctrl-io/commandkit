import colors from '../../utils/colors';

export const Logger = {
  Fatal: (...message: unknown[]) => {
    console.log(colors.red('[FATAL ERROR]'), ...message);
    process.exit(1);
  },
  Warning: (...message: unknown[]) => {
    console.log(colors.yellow('[WARNING]'), ...message);
  },
  Info: (...message: unknown[]) => {
    console.log(colors.green('[INFO]'), ...message);
  },
  Debug: (...message: unknown[]) => {
    console.log(colors.blue('[DEBUG]'), ...message);
  },
  Log: (...message: unknown[]) => {
    console.log(...message);
  },
};
