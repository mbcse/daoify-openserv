import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'

// Configuration
const CONFIG = {
  OPENSERV_API_KEY: process.env.TWITTER_OPENSERV_API_KEY || '',
  WORKSPACE_ID: parseInt(process.env.WORKSPACE_ID || '0'),
  TWITTER_INTEGRATION_ID: process.env.TWITTER_INTEGRATION_ID || 'twitter-v2',
  PORT: 7378
}

// Validate configuration
if (!CONFIG.OPENSERV_API_KEY) {
  console.error('❌ Please set your OPENSERV_API_KEY environment variable')
  process.exit(1)
}

if (!CONFIG.WORKSPACE_ID || CONFIG.WORKSPACE_ID === 0) {
  console.error('❌ Please set your WORKSPACE_ID environment variable')
  process.exit(1)
}

// Create the Twitter agent
const twitterAgent = new Agent({
  systemPrompt: 'You are a Twitter agent that can send tweets',
  apiKey: CONFIG.OPENSERV_API_KEY,
  port: CONFIG.PORT
})

// Add capability to send tweets
twitterAgent.addCapability({
  name: 'sendTweet',
  description: 'Send a tweet to Twitter based on the content provided, Should match the content',
  schema: z.object({
    tweetContent: z.string().describe('The content of the tweet'),
    in_reply_to_tweet_id: z.string().optional()
  }),
  async run({ args }) {
    try {
      const response = await twitterAgent.callIntegration({
        workspaceId: CONFIG.WORKSPACE_ID,
        integrationId: CONFIG.TWITTER_INTEGRATION_ID,
        details: {
          endpoint: '/2/tweets',
          method: 'POST',
          data: {
            text: args.tweetContent,
            ...(args.in_reply_to_tweet_id && {
              reply: { in_reply_to_tweet_id: args.in_reply_to_tweet_id }
            })
          }
        }
      })

      return `✅ Tweet sent successfully! Response: ${JSON.stringify(response.output)}`
    } catch (error) {
      return `❌ Failed to send tweet: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Add capability to search for mentions
twitterAgent.addCapability({
  name: 'searchMentions',
  description: 'Search for mentions of a specific term or handle',
  schema: z.object({
    query: z.string().describe('Search query (e.g., "@username" or "keyword")'),
    maxResults: z.number().min(1).max(100).default(10)
  }),
  async run({ args }) {
    try {
      const searchQuery = encodeURIComponent(`${args.query} -is:retweet`)
      const response = await twitterAgent.callIntegration({
        workspaceId: CONFIG.WORKSPACE_ID,
        integrationId: CONFIG.TWITTER_INTEGRATION_ID,
        details: {
          endpoint: `/2/tweets/search/recent?query=${searchQuery}&max_results=${args.maxResults}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username,verified`,
          method: 'GET'
        }
      })

      let responseData
      if (typeof response.output === 'string') {
        responseData = JSON.parse(response.output)
      } else {
        responseData = response.output
      }

      if (responseData.data && Array.isArray(responseData.data)) {
        const tweets = responseData.data
        const summary = tweets.map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at,
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0
        }))

        return `✅ Found ${tweets.length} mentions:\n${JSON.stringify(summary, null, 2)}`
      } else {
        return `📊 No mentions found for "${args.query}"`
      }
    } catch (error) {
      return `❌ Failed to search mentions: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Add capability to get user profile
twitterAgent.addCapability({
  name: 'getProfile',
  description: 'Get Twitter user profile information',
  schema: z.object({
    username: z
      .string()
      .optional()
      .describe('Username to get profile for (leave empty for your own profile)')
  }),
  async run({ args }) {
    try {
      let endpoint = '/2/users/me'
      if (args.username) {
        endpoint = `/2/users/by/username/${args.username}`
      }

      const response = await twitterAgent.callIntegration({
        workspaceId: CONFIG.WORKSPACE_ID,
        integrationId: CONFIG.TWITTER_INTEGRATION_ID,
        details: {
          endpoint: `${endpoint}?user.fields=created_at,description,location,public_metrics,verified`,
          method: 'GET'
        }
      })

      let responseData
      if (typeof response.output === 'string') {
        responseData = JSON.parse(response.output)
      } else {
        responseData = response.output
      }

      if (responseData.data) {
        const user = responseData.data
        return `✅ Profile for @${user.username}:
Name: ${user.name}
Description: ${user.description || 'No description'}
Location: ${user.location || 'No location'}
Followers: ${user.public_metrics?.followers_count || 0}
Following: ${user.public_metrics?.following_count || 0}
Tweets: ${user.public_metrics?.tweet_count || 0}
Verified: ${user.verified ? 'Yes' : 'No'}
Created: ${user.created_at}`
      } else {
        return `❌ User not found`
      }
    } catch (error) {
      return `❌ Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Add capability to handle feedback
twitterAgent.addCapability({
  name: 'handleFeedback',
  description: 'Process and respond to feedback mentions',
  schema: z.object({
    searchTerm: z.string().describe('Term to search for feedback (e.g., your brand name)'),
    respondToPositive: z
      .boolean()
      .default(true)
      .describe('Whether to respond to positive feedback'),
    respondToNegative: z.boolean().default(true).describe('Whether to respond to negative feedback')
  }),
  async run({ args }) {
    try {
      // Search for feedback
      const searchQuery = encodeURIComponent(`${args.searchTerm} -is:retweet`)
      const response = await twitterAgent.callIntegration({
        workspaceId: CONFIG.WORKSPACE_ID,
        integrationId: CONFIG.TWITTER_INTEGRATION_ID,
        details: {
          endpoint: `/2/tweets/search/recent?query=${searchQuery}&max_results=20&tweet.fields=created_at,public_metrics,author_id,context_annotations&expansions=author_id&user.fields=name,username`,
          method: 'GET'
        }
      })

      let responseData
      if (typeof response.output === 'string') {
        responseData = JSON.parse(response.output)
      } else {
        responseData = response.output
      }

      if (!responseData.data || !Array.isArray(responseData.data)) {
        return `📊 No feedback found for "${args.searchTerm}"`
      }

      const tweets = responseData.data
      const users = responseData.includes?.users || []
      const feedbackAnalysis = []

      for (const tweet of tweets) {
        const author = users.find((u: any) => u.id === tweet.author_id)
        const sentiment = analyzeSentiment(tweet.text)

        feedbackAnalysis.push({
          id: tweet.id,
          author: author ? `@${author.username}` : 'Unknown',
          text: tweet.text,
          sentiment: sentiment,
          engagement: tweet.public_metrics?.like_count || 0,
          created_at: tweet.created_at
        })
      }

      // Categorize feedback
      const positive = feedbackAnalysis.filter(f => f.sentiment === 'positive')
      const negative = feedbackAnalysis.filter(f => f.sentiment === 'negative')
      const neutral = feedbackAnalysis.filter(f => f.sentiment === 'neutral')

      const summary = {
        total: feedbackAnalysis.length,
        positive: positive.length,
        negative: negative.length,
        neutral: neutral.length,
        topEngagement: feedbackAnalysis.sort((a, b) => b.engagement - a.engagement).slice(0, 3)
      }

      return `✅ Feedback Analysis for "${args.searchTerm}":
📊 Total mentions: ${summary.total}
😊 Positive: ${summary.positive}
😞 Negative: ${summary.negative}
😐 Neutral: ${summary.neutral}

🔥 Top Engagement:
${summary.topEngagement.map(t => `• ${t.author}: "${t.text.substring(0, 80)}..." (${t.engagement} likes)`).join('\n')}

📝 Recent Feedback:
${feedbackAnalysis
  .slice(0, 5)
  .map(f => `• ${f.sentiment.toUpperCase()} - ${f.author}: "${f.text.substring(0, 60)}..."`)
  .join('\n')}`
    } catch (error) {
      return `❌ Failed to handle feedback: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Simple sentiment analysis function
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase()

  const positiveWords = [
    'good',
    'great',
    'awesome',
    'amazing',
    'love',
    'excellent',
    'perfect',
    'wonderful',
    'fantastic',
    'thank',
    'thanks',
    'appreciate',
    'helpful',
    'best',
    'brilliant'
  ]
  const negativeWords = [
    'bad',
    'terrible',
    'awful',
    'hate',
    'horrible',
    'worst',
    'sucks',
    'disappointed',
    'frustrating',
    'annoying',
    'useless',
    'broken',
    'problem',
    'issue',
    'bug'
  ]

  let positiveScore = 0
  let negativeScore = 0

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++
  })

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++
  })

  if (positiveScore > negativeScore) return 'positive'
  if (negativeScore > positiveScore) return 'negative'
  return 'neutral'
}

// Start the agent's HTTP server
console.log(`🐦 Starting Twitter Agent on port ${CONFIG.PORT}...`)
twitterAgent.start()

// Test the agent
async function testTwitterAgent() {
  console.log('🧪 Testing Twitter Agent...')

  try {
    // Test searching mentions
    const mentionsResult = await twitterAgent.process({
      messages: [
        {
          role: 'user',
          content: 'Search for mentions of "OpenServ" with max 5 results'
        }
      ]
    })

    console.log('✅ Mentions search test result:', mentionsResult.choices[0].message.content)

    // Test getting profile
    const profileResult = await twitterAgent.process({
      messages: [
        {
          role: 'user',
          content: 'Get my Twitter profile information'
        }
      ]
    })

    console.log('✅ Profile test result:', profileResult.choices[0].message.content)
  } catch (error) {
    console.error('❌ Twitter agent test failed:', error)
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  //   setTimeout(() => {
  //     testTwitterAgent().catch(console.error)
  //   }, 2000) // Wait 2 seconds for server to start
}

export { twitterAgent }
