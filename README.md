# GenAI Playground

An interactive AI playground application that allows users to select from multiple large language models and interact with them through a modern chat interface. Built with Next.js 16, TypeScript, and shadcn/ui components.

## Features

- 🤖 **Multiple AI Models**: Support for GPT-4, GPT-3.5 Turbo, Claude 3 (Opus & Sonnet), and Gemini Pro
- 🎨 **Modern UI**: Beautiful dark theme interface built with shadcn/ui
- ⚙️ **Adjustable Parameters**: Fine-tune Temperature, Maximum Length, and Top P
- 🔄 **Multiple Modes**: Complete, Insert, and Edit modes
- 💾 **Preset Management**: Save and load conversation presets
- 🐳 **Docker Support**: Easy deployment with Docker and docker-compose
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

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
/app
  /layout.tsx              # Root layout with dark theme
  /page.tsx                # Home page
  /playground
    /page.tsx              # Main playground page
/components
  /ui                      # shadcn/ui components
    /button.tsx
    /select.tsx
    /slider.tsx
    /textarea.tsx
    /label.tsx
    /separator.tsx
  /playground              # Custom playground components
    /playground-header.tsx
    /playground-sidebar.tsx
    /playground-textarea.tsx
/lib
  /utils.ts                # Utility functions
/styles
  /globals.css             # Global styles with dark theme
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
Choose from multiple AI models including:
- GPT-4
- GPT-3.5 Turbo
- Claude 3 Opus
- Claude 3 Sonnet
- Gemini Pro
- Gemini 1.5 Pro

### Parameter Controls
Fine-tune model behavior with adjustable parameters:
- **Temperature** (0-1): Controls randomness in responses
- **Maximum Length** (1-4096): Limits response length
- **Top P** (0-1): Controls diversity via nucleus sampling

### Modes
- **Complete**: Generate text completions
- **Insert**: Insert text at a specific position
- **Edit**: Edit and refine existing text

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
