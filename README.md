# README.md content

# Telegram Meme Bot

This project is a Telegram bot that analyzes user images (memes) and responds with a scathing review. It integrates with the OpenAI API for generating reviews and includes features for group chat integration and user rate limiting.

## Features

- Image analysis for memes
- Integration with OpenAI API for generating reviews
- Group chat support
- User rate limiting (4 posts per hour)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/telegram-meme-bot.git
   ```

2. Navigate to the project directory:
   ```
   cd telegram-meme-bot
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file based on the `.env.example` file and add your OpenAI API token and other necessary environment variables.

5. Run the bot:
   ```
   npm start
   ```

## Usage

- Send an image to the bot in a chat.
- The bot will analyze the image and respond with a review.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.