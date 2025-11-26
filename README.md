# GenAI Playground

> [!WARNING]
> **Disclaimer**: 90% of the code is developed by AI agents (GitHub Copilot, Gemini 3 Pro). it shouldn't be used for production without proper review, testing and validation.

An interactive AI playground application that allows users to select from multiple large language models and interact with them through a modern chat interface. Built with Next.js 16, TypeScript, and shadcn/ui components.

## Features

- 🤖 **Multiple AI Models**: Support for OpenAI (GPT-4, GPT-3.5), Anthropic (Claude 3), and Google (Gemini Pro)
- 🔌 **Unified Connectors**: Modular connector architecture for easy integration of new providers
- 🌊 **Standardized Streaming**: Consistent streaming response handling across all AI providers
- 🔄 **Dynamic Model Fetching**: Automatically fetches available models from supported providers
- 🎨 **Modern UI**: Beautiful dark theme interface built with shadcn/ui
- ⚙️ **Adjustable Parameters**: Fine-tune Temperature, Maximum Length, and Top P
- 💾 **Preset Management**: Save and load conversation presets
- 🐳 **Docker Support**: Easy deployment with Docker and docker-compose
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **AI Integration**: Custom Connectors (OpenAI, Anthropic, Google)

## Prerequisites

- Node.js 20+ 
- npm or yarn
- Docker (optional, for containerized deployment)

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/pravanjang/GenAI-playground.git
   cd GenAI-playground
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Docker Deployment

### Using Docker

1. **Build the Docker image**
   ```bash
   docker build -t genai-playground .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env genai-playground
   ```

### Using Docker Compose

1. **Start the application**
   ```bash
   docker-compose up -d
   ```

2. **Stop the application**
   ```bash
   docker-compose down
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app
    /playground
      /page.tsx              # Main playground page
    /globals.css             # Global styles
    /layout.tsx              # Root layout
    /page.tsx                # Home page
    /providers.tsx           # App providers
  /components
    /ui                      # shadcn/ui components
      /button.tsx
      /dialog.tsx
      /input.tsx
      /label.tsx
      /select.tsx
      /separator.tsx
      /slider.tsx
      /switch.tsx
      /tabs.tsx
      /textarea.tsx
      /tooltip.tsx
    /playground              # Custom playground components
      /playground-header.tsx
      /playground-sidebar.tsx
      /playground-textarea.tsx
      /settings              # Settings components
  /lib
    /connectors              # AI Provider connectors
      /base.ts               # Base interface
      /openai.ts             # OpenAI implementation
      /anthropic.ts          # Anthropic implementation
      /google.ts             # Google implementation
    /stores                  # State management
    /types                   # TypeScript definitions
    /utils.ts                # Utility functions
Dockerfile                 # Multi-stage Docker build
.dockerignore              # Docker ignore file
docker-compose.yml         # Docker Compose configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features in Detail

### Model Selection
Choose from multiple AI models. The application dynamically fetches available models from:
- OpenAI
- Anthropic
- Google

### Parameter Controls
Fine-tune model behavior with adjustable parameters:
- **Temperature** (0-1): Controls randomness in responses
- **Maximum Length** (1-4096): Limits response length
- **Top P** (0-1): Controls diversity via nucleus sampling

### Preset Management
- Save frequently used configurations
- Load presets for quick access
- Share configurations with others

## Security

The Docker image follows security best practices:
- Multi-stage build for minimal image size
- Non-root user execution
- Minimal base image (node:20-alpine)
- No secrets in the image

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
