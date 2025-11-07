import { defineConfig } from 'commandkit/config';
import { workflowRollupPlugin } from 'workflow/rollup';

export default defineConfig({
  rolldownPlugins: [workflowRollupPlugin()],
});
