import React from "react";
import classNames from "classnames";
import "../styles/globals.css";
import type { Preview } from "@storybook/react";

import { sora } from "../lib/fonts";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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
