#!/usr/bin/env node

/**
 * Reply to YouTube comments as Snail's Bot
 * Conservative Lutheran theology (5 Solas)
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_FILE = path.join(process.env.HOME, '.clawd-youtube', 'credentials.json');
const TOKENS_FILE = path.join(process.env.HOME, '.clawd-youtube', 'tokens.json');
const DOCTRINAL_ALERTS_FILE = path.join(process.env.HOME, '.clawd-devotional', 'temp', 'doctrinal-alerts.json');

// Snail's theological framework (5 Solas)
const THEOLOGY = {
  denomination: 'Conservative Lutheran',
  beliefs: [
    'Sola Scriptura (Scripture alone)',
    'Sola Gratia (Grace alone)', 
    'Sola Fide (Faith alone)',
    'Solus Christus (Christ alone)',
    'Soli Deo Gloria (Glory to God alone)'
  ],
  keyPoints: {
    salvation: 'Saved by grace through faith, not by works (Ephesians 2:8-9)',
    authority: 'The Bible is the inspired, inerrant Word of God',
    christ: 'Jesus Christ is the only way to salvation (John 14:6)',
    sacraments: 'Baptism and the Lord\'s Supper are means of grace'
  }
};

// Reply templates for common questions
const REPLY_TEMPLATES = {
  greeting: `Hi there! This is Snail's Bot 🤖

Thanks for your comment! Snail asked me to help respond to questions while he's away. I do my best to represent his conservative Lutheran perspective, but for deep theological questions, he\'ll want to respond personally.

`,
  
  doctrinal: `Hi there! This is Snail's Bot 🤖

Your question touches on some important theological matters. Snail holds to the 5 Solas of the Reformation:
• Scripture alone
• Grace alone  
• Faith alone
• Christ alone
• Glory to God alone

From his Lutheran perspective: [ANSWER]

For a more detailed response, Snail will review this question personally. Thanks for engaging with the content!

- Snail's Bot`,

  error: `Hi there! This is Snail's Bot 🤖

Thank you for pointing out a potential error! You're absolutely right to be discerning about theological content, especially when it's AI-generated.

Snail takes doctrinal accuracy seriously and will review this. Please know:
• This devotional is AI-generated and not a substitute for pastoral guidance
• The goal is encouragement, not theological training
• Human review is always needed

Snail will look into this. Thanks for keeping us accountable!

- Snail's Bot`,

  suggestion: `Hi there! This is Snail's Bot 🤖

Thank you for your suggestion! I've logged your topic idea for future consideration.

Snail reviews all suggestions and may feature community-requested topics in upcoming devotionals. Stay tuned!

- Snail's Bot`,

  encouragement: `Hi there! This is Snail's Bot 🤖

Thank you for your kind words! Snail is glad the devotional was an encouragement to you.

Remember: This is AI-generated content meant to point you to Scripture. For pastoral care and deeper theological guidance, please connect with your local church.

God bless!

- Snail's Bot`
};

async function replyToComments() {
  console.log('💬 Checking for comments to reply to...\n');
  
  // Load doctrinal alerts that need responses
  let alerts = [];
  try {
    if (fs.existsSync(DOCTRINAL_ALERTS_FILE)) {
      alerts = JSON.parse(fs.readFileSync(DOCTRINAL_ALERTS_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load alerts:', error.message);
  }
  
  // Filter for unreviewed alerts that might need replies
  const pendingAlerts = alerts.filter(a => !a.reviewed && !a.replied);
  
  if (pendingAlerts.length === 0) {
    console.log('✅ No pending comments to reply to');
    return;
  }
  
  console.log(`Found ${pendingAlerts.length} comments that may need replies\n`);
  
  // For now, just show what would be replied to
  // In production, this would actually post replies
  for (const alert of pendingAlerts.slice(0, 5)) { // Limit to 5 per run
    console.log(`Comment from ${alert.author}:`);
    console.log(`  "${alert.comment.substring(0, 100)}..."`);
    console.log(`  Video: ${alert.videoTitle}`);
    
    const suggestedReply = generateReply(alert);
    console.log(`\n  Suggested reply:`);
    console.log(`  ${suggestedReply.substring(0, 150)}...\n`);
    
    // Mark as needing Snail's approval
    alert.needsApproval = true;
  }
  
  // Save updated alerts
  saveAlerts(alerts);
  
  console.log('⚠️  These replies need Snail\'s approval before posting');
  console.log(`📁 Review at: ${DOCTRINAL_ALERTS_FILE}`);
}

function generateReply(alert) {
  const text = alert.comment.toLowerCase();
  
  // Determine type of reply needed
  if (text.includes('error') || text.includes('wrong') || text.includes('incorrect') || text.includes('mistake')) {
    return REPLY_TEMPLATES.error;
  }
  
  if (alert.type === 'doctrinal_question') {
    // Try to answer based on the question
    return generateDoctrinalReply(alert.comment);
  }
  
  if (text.includes('suggest') || text.includes('topic') || text.includes('request')) {
    return REPLY_TEMPLATES.suggestion;
  }
  
  if (text.includes('thank') || text.includes('love') || text.includes('blessed') || text.includes('encouraged')) {
    return REPLY_TEMPLATES.encouragement;
  }
  
  // Default greeting
  return REPLY_TEMPLATES.greeting + "\n- Snail's Bot";
}

function generateDoctrinalReply(comment) {
  const text = comment.toLowerCase();
  let answer = '';
  
  // Simple keyword-based answers (can be expanded)
  if (text.includes('grace') && text.includes('works')) {
    answer = `We are saved by grace through faith, not by works (Ephesians 2:8-9). Good works are the fruit of faith, not the cause of salvation.`;
  } else if (text.includes('bible') || text.includes('scripture')) {
    answer = `The Bible is the inspired, inerrant Word of God and our ultimate authority (2 Timothy 3:16). Scripture interprets Scripture.`;
  } else if (text.includes('jesus') || text.includes('christ')) {
    answer = `Jesus Christ is the only way to salvation (John 14:6). He is true God and true man, and His sacrifice on the cross is sufficient for all who believe.`;
  } else if (text.includes('faith') && text.includes('alone')) {
    answer = `We are justified by faith alone (Romans 3:28). Faith is the instrument that receives the gift of salvation that Christ earned for us.`;
  } else {
    answer = `This is a great question that deserves careful consideration in light of Scripture. The Lutheran Confessions guide our understanding, always pointing us back to God's Word as our sole authority.`;
  }
  
  return REPLY_TEMPLATES.doctrinal.replace('[ANSWER]', answer);
}

function saveAlerts(alerts) {
  fs.writeFileSync(DOCTRINAL_ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

// Run if called directly
if (require.main === module) {
  replyToComments().catch(console.error);
}

module.exports = { replyToComments, THEOLOGY };
