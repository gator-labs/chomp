### Storybook

When creating UI components developer should take care to run the command:
`yarn run storybook`

which will open storybook page to preview all the UI components in the project.
Storybook is used to mock UI components, represent different variants and states of the UI components and show usage. When creating a new UI components (ex. question slider) the developer should also create a corresponding story inside of the stories folder, suffixed with .stories.tsx. There are currently plenty of samples in the stories folder to show how different scenarios are handled. Official storybook docs are located here: https://storybook.js.org/docs/get-started.
