# Contributing to CommandKit

Firstly, thank you for considering contributing to CommandKit! Whether you're looking to fix bugs, add new features, or just ask questions, your input is valuable to us.

## Consulting with maintainers before contributing

### Why consult first?

We welcome all contributions, big or small, but we also strive to keep the project focused and maintain high-quality standards. To ensure your efforts align with the project's goals and roadmap, we encourage you to consult with the maintainers before starting work on a significant contribution. This consultation can help avoid duplicated efforts, ensure that your contribution fits the project, and save time for both you and the maintainers.

### How to consult with maintainers

You can talk to a maintainer in several ways, depending on the nature of your contribution and your preference:

1. Creating an [Issue](https://github.com/underctrl-io/commandkit/issues): For proposing new features or changes, the best start is to create an issue in this GitHub repository. Please provide a clear and detailed description of what you propose, why it's needed, and how it aligns with the project's objectives. Label your issue with proposal to help us identify it quickly.

2. Starting a [Discussion](https://github.com/underctrl-io/commandkit/discussions): For more open-ended ideas or to seek feedback on a concept before it's fully fleshed out, our GitHub Discussions is the perfect place. It allows for a more informal exchange of ideas and feedback from both maintainers and other community members.

3. Contacting in the [Support Discord](https://ctrl.lol/discord): If you prefer a more direct line of communication, join our support Discord server. We have a dedicated channel for CommandKit. This is a great place to get quick feedback or clarifications before diving deep into your work.

## Setup

### Prerequisites

1. Ensure you have `Node.js` and `pnpm` installed.
   - Node.js: [Download here](https://nodejs.org/)
   - pnpm: Install via `npm install -g pnpm` if you haven't.

### Fork & Clone

1. Fork the repository to your own GitHub account.

2. Clone your fork to your local machine:

```bash
git clone https://github.com/your-username/commandkit.git
```

### Installing Dependencies

Since we use `pnpm` workspaces, it's essential to use `pnpm` for installing dependencies.

```bash
cd commandkit
pnpm install # Make sure to run this from the root directory
```

### Workflow

1. Create a new branch for your work:

```bash
git checkout -b your-feature-or-bugfix
```

2. Make your changes. Please make sure to use the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for consistent formatting and comments wherever necessary.

3. Ensure that your changes don't break any existing functionality. You can test the functionality of your code depending on where you've made changes:

   1. If you've made changes to the CommandKit package, you can use the "tests" folder in the "packages/commandkit" directory to test your own bot. Just make sure to create a new `.env` file with the template from the `.env.example` file provided. You can run the application using `pnpm test`.
   2. If you've made changes to the docs, you can run `pnpm dev` inside "apps/docs" to spin up a local development server.

4. Run `pnpm lint` from the root directory to ensure all lint scripts and formatting is valid.

5. Commit your changes:

```bash
git commit -m "Describe your change here"
```

6. Push your changes to your fork:

```bash
git push origin your-feature-or-bugfix
```

7. Open a pull request in the main project repository (`master` branch). Describe your changes and any relevant information.

## Submitting Issues

When submitting a new issue, please provide a detailed description of the problem, steps to reproduce it, and any relevant screenshots or error messages.

---

Thank you for making CommandKit better! We appreciate your effort and look forward to collaborating with you.
