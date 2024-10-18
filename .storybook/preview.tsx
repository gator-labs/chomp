import type { Preview } from "@storybook/react";
import classNames from "classnames";
import "react-spring-bottom-sheet/dist/style.css";

import { sora } from "../lib/fonts";
import "../styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className={classNames(sora?.variable, sora?.className)}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
