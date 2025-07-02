# 🤖 Automated Twitter Bot

An intelligent bot that automatically replies to relevant tweets based on specific keywords for each day of the week.

## ⚡ Features

- **Automatic replies** to tweets containing specific keywords  
- **Smart scheduling**: different keywords per day of the week  
- **Spam prevention**: avoids replying to duplicate tweets  
- **Rate limiting**: waits between replies  
- **Web dashboard**: bot status monitoring  

## 🗓️ Schedule

- **Monday and Thursday**: Technology (JavaScript, Vue.js, Frontend, Backend)  
- **Tuesday and Friday**: AI (Machine Learning, ChatBot, etc.)  
- **Wednesday and Saturday**: Sports (Real Madrid, Liga de Quito)  
- **Sunday**: Mix of Technology and Sports  

## 🌐 Environment Variables on Render

Add the following variables in the **Environment** section of your Render service:

```ini
TWITTER_API_KEY=your_real_key
TWITTER_API_SECRET=your_real_secret
TWITTER_ACCESS_TOKEN=your_real_token
TWITTER_ACCESS_SECRET=your_real_access_secret
```

## 📊 Monitoring

Once deployed, you can monitor the bot at:

- [`https://your-app.render.com/`](https://your-app.render.com/) – **Main dashboard**
- [`https://your-app.render.com/health`](https://your-app.render.com/health) – **Health check endpoint**

## ⏰ Execution Schedule

- **9:00 AM** – Morning run  
- **7:00 PM** – Evening run

## 📝 Important Notes

- The bot avoids replying to its own tweets  
- It does not reply to retweets  
- Keeps track of tweets already replied to  
- Respects Twitter API rate limits

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables
4. Deploy to Render or run locally: `npm start`

## 📋 Requirements

- Node.js 16+ 
- Twitter Developer Account
- Render account (for deployment)

## 🛠️ Tech Stack

- Node.js
- Twitter API v2
- Express.js (for web dashboard)
- Render (deployment platform)