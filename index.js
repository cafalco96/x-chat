const fs = require('fs');
const path = require('path');
const { CronJob } = require('cron');
const express = require('express');

require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const repliedFile = path.join(__dirname, 'repliedTweets.json');

function loadRepliedTweets() {
  if (!fs.existsSync(repliedFile)) return new Set();
  try {
    const data = fs.readFileSync(repliedFile, 'utf-8');
    const arr = JSON.parse(data);
    return new Set(arr);
  } catch (e) {
    console.error('Error leyendo repliedTweets.json:', e);
    return new Set();
  }
}

function saveRepliedTweets(set) {
  try {
    fs.writeFileSync(repliedFile, JSON.stringify([...set]), 'utf-8');
  } catch (e) {
    console.error('Error guardando repliedTweets.json:', e);
  }
}

const keywordGroups = {
  tech: ['javascript', 'vue js', 'frontend', 'backend', 'full stack'],
  ai: ['inteligencia artificial', 'IA', 'machine learning', 'deep learning', 'chatbot'],
  sports: ['Real Madrid', 'Liga de Quito', 'Champions League', 'Copa Libertadores'],
};

function getTodayKeywords() {
  const day = new Date().getDay();
  if ([1, 4].includes(day)) return keywordGroups.tech;
  if ([2, 5].includes(day)) return keywordGroups.ai;
  if ([3, 6].includes(day)) return keywordGroups.sports;
  return [...keywordGroups.tech, ...keywordGroups.sports];
}

function generateReply(text) {
  if (/real madrid/i.test(text)) return "¡Hala Madrid! ⚽️ Siempre apoyando al mejor. #RealMadrid";
  if (/liga de quito/i.test(text)) return "¡Vamos Liga! 🏆 Orgullo ecuatoriano. #LigaDeQuito";
  if (/javascript|vue|css|scss|frontend|backend/i.test(text)) return "¡Gran aporte sobre desarrollo web! 💻 #JavaScript #VueJS";
  if (/inteligencia artificial|ia|machine learning|deep learning|chatbot/i.test(text)) {
    return "La IA está transformando el mundo 🤖 ¡Muy interesante! #AI #MachineLearning";
  }
  return "¡Muy buen tweet! Gracias por compartir ✨";
}

async function getRelevantTweets(limit = 10) {
  const keywords = getTodayKeywords();
  const query = keywords.map(k => `"${k}"`).join(' OR ');
  const roClient = client.readOnly;

  const searchResponse = await roClient.v2.search(query, {
    max_results: limit,
    'tweet.fields': ['author_id', 'created_at', 'text'],
  });

  const tweets = [];
  for await (const tweet of searchResponse) {
    tweets.push(tweet);
  }

  return tweets;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function replyToTweets(tweets, repliedSet) {
  for (const tweet of tweets) {
    if (repliedSet.has(tweet.id)) {
      console.log(`🔄 Ya respondido tweet ${tweet.id}, saltando.`);
      continue;
    }

    const replyText = generateReply(tweet.text);
    try {
      await client.v2.reply(replyText, tweet.id);
      console.log(`✅ Respondido al tweet ${tweet.id}`);
      repliedSet.add(tweet.id);
      saveRepliedTweets(repliedSet);
      await delay(5000); // Avoid spam by waiting 5 seconds
    } catch (error) {
      console.error(`❌ Error al responder ${tweet.id}:`, error?.data || error);
    }
  }
}

async function runBot() {
  try {
    const rwClient = client.readWrite;
    const me = await rwClient.v2.me();
    const myUserId = me.data.id;

    const tweets = await getRelevantTweets(15);
    const repliedSet = loadRepliedTweets();

    const filtered = tweets.filter(
      tweet =>
        tweet.author_id !== myUserId &&
        !tweet.text.startsWith('RT') &&
        !tweet.text.includes('@' + me.data.username) &&
        !repliedSet.has(tweet.id)
    );

    await replyToTweets(filtered.slice(0, 5), repliedSet);
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Cron jobs 
const jobMorning = new CronJob('0 9 * * *', () => {
  console.log('🚀 Ejecutando bot - turno mañana (9:00 AM)');
  runBot();
});

const jobEvening = new CronJob('0 19 * * *', () => {
  console.log('🚀 Ejecutando bot - turno noche (7:00 PM)');
  runBot();
});

jobMorning.start();
jobEvening.start();

console.log('🕐 Cron jobs iniciados: 9:00 AM y 7:00 PM');

// ===== Render server =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const repliedSet = loadRepliedTweets();
  res.json({ 
    status: '🤖 Bot activo y funcionando',
    lastCheck: new Date().toISOString(),
    totalReplies: repliedSet.size,
    todayKeywords: getTodayKeywords(),
    nextRuns: ['9:00 AM', '7:00 PM']
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP corriendo en puerto ${PORT}`);
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
});