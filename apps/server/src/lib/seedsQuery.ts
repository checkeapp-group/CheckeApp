import { executeRawQuery, withTransaction, initDB, closeDB } from '@/lib/dbHelper';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

// biome-ignore lint/nursery/useConsistentTypeDefinitions: <explanation>
interface SeedData {
  users: Array<{
    name: string;
    email: string;
    password: string;
  }>;
  verifications: Array<{
    originalText: string;
    status: 'draft' | 'processing_questions' | 'sources_ready' | 'generating_summary' | 'completed' | 'error';
  }>;
  criticalQuestions: Array<{
    questionText: string;
    originalQuestion: string;
    orderIndex: number;
  }>;
  sources: Array<{
    url: string;
    title: string;
    summary: string;
    domain: string;
    isSelected: boolean;
  }>;
}

const seedData: SeedData = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@factchecker.com',
      password: 'admin123',
    },
    {
      name: 'John Moderator',
      email: 'john.mod@factchecker.com',
      password: 'moderator123',
    },
    {
      name: 'Jane User',
      email: 'jane.user@factchecker.com',
      password: 'user123',
    },
    {
      name: 'Test User',
      email: 'test@factchecker.com',
      password: 'test123',
    },
  ],
  verifications: [
    {
      originalText: 'Climate change is a natural phenomenon and not caused by human activities. The earth has always gone through natural climate cycles.',
      status: 'completed',
    },
    {
      originalText: 'COVID-19 vaccines alter human DNA permanently and cause infertility in women.',
      status: 'completed',
    },
    {
      originalText: 'The 2020 US election had widespread voter fraud that changed the outcome.',
      status: 'sources_ready',
    },
    {
      originalText: '5G networks cause cancer and other serious health problems including weakening the immune system.',
      status: 'processing_questions',
    },
    {
      originalText: 'Eating organic food is significantly healthier than conventionally grown food.',
      status: 'generating_summary',
    },
    {
      originalText: 'Electric cars are worse for the environment than gasoline cars due to battery production.',
      status: 'draft',
    },
    {
      originalText: 'Artificial intelligence will replace all human jobs by 2030.',
      status: 'error',
    },
  ],
  criticalQuestions: [
    {
      questionText: 'What does the scientific consensus say about the primary causes of climate change?',
      originalQuestion: 'What does the scientific consensus say about the primary causes of climate change?',
      orderIndex: 0,
    },
    {
      questionText: 'What evidence exists for human activities contributing to climate change versus natural cycles?',
      originalQuestion: 'What evidence exists for human activities contributing to climate change versus natural cycles?',
      orderIndex: 1,
    },
    {
      questionText: 'How do mRNA vaccines work at the cellular level?',
      originalQuestion: 'How do mRNA vaccines work at the cellular level?',
      orderIndex: 0,
    },
    {
      questionText: 'What peer-reviewed studies exist on COVID-19 vaccine effects on fertility and DNA?',
      originalQuestion: 'What peer-reviewed studies exist on COVID-19 vaccine effects on fertility and DNA?',
      orderIndex: 1,
    },
    {
      questionText: 'What evidence was presented in courts regarding 2020 election fraud claims?',
      originalQuestion: 'What evidence was presented in courts regarding 2020 election fraud claims?',
      orderIndex: 0,
    },
    {
      questionText: 'What do election security experts and officials say about the 2020 election integrity?',
      originalQuestion: 'What do election security experts and officials say about the 2020 election integrity?',
      orderIndex: 1,
    },
    {
      questionText: 'What does the scientific research say about 5G radiation levels compared to safety standards?',
      originalQuestion: 'What does the scientific research say about 5G radiation levels compared to safety standards?',
      orderIndex: 0,
    },
    {
      questionText: 'What peer-reviewed studies exist on 5G health effects?',
      originalQuestion: 'What peer-reviewed studies exist on 5G health effects?',
      orderIndex: 1,
    },
  ],
  sources: [
    {
      url: 'https://www.ipcc.ch/report/ar6/wg1/',
      title: 'IPCC Sixth Assessment Report - Climate Change 2021: The Physical Science Basis',
      summary: 'The most comprehensive scientific assessment of climate change, confirming human activities as the dominant cause.',
      domain: 'ipcc.ch',
      isSelected: true,
    },
    {
      url: 'https://climate.nasa.gov/evidence/',
      title: 'Climate Change Evidence - NASA',
      summary: 'NASA\'s comprehensive evidence for climate change including temperature records and greenhouse gas data.',
      domain: 'climate.nasa.gov',
      isSelected: true,
    },
    {
      url: 'https://www.cdc.gov/coronavirus/2019-ncov/vaccines/facts.html',
      title: 'Facts about COVID-19 Vaccines - CDC',
      summary: 'Official CDC information about how COVID-19 vaccines work and their safety profile.',
      domain: 'cdc.gov',
      isSelected: true,
    },
    {
      url: 'https://www.nejm.org/covid-vaccine',
      title: 'COVID-19 Vaccine Research - New England Journal of Medicine',
      summary: 'Peer-reviewed research on COVID-19 vaccine efficacy and safety from clinical trials.',
      domain: 'nejm.org',
      isSelected: true,
    },
    {
      url: 'https://www.dhs.gov/2020-election-security',
      title: '2020 Election Security - Department of Homeland Security',
      summary: 'Official government assessment of 2020 election security and integrity measures.',
      domain: 'dhs.gov',
      isSelected: false,
    },
    {
      url: 'https://www.fcc.gov/5g-safety',
      title: '5G Safety - Federal Communications Commission',
      summary: 'FCC guidelines and safety standards for 5G technology deployment.',
      domain: 'fcc.gov',
      isSelected: false,
    },
  ],
};

async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...');

  // Clear in exact reverse dependency order based on your schema
  const tables = [
    'process_logs',
    'final_results',
    'source',
    'critical_questions',
    'verification',
    'account',
    'session',
    'user'
  ];

  for (const table of tables) {
    try {
      await executeRawQuery(`DELETE FROM ${table}`);
      console.log(`✅ Cleared ${table} table`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${table} table: ${(error as Error).message}`);
    }
  }
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function seedUsers(): Promise<string[]> {
  console.log('👥 Seeding user table...');
  const userIds: string[] = [];

  for (const userData of seedData.users) {
    try {
      const userId = randomUUID();
      const hashedPassword = await hashPassword(userData.password);
      userIds.push(userId);
      
      await executeRawQuery(
        'INSERT INTO user (id, name, email, email_verified, password, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, userData.name, userData.email, true, hashedPassword, null]
      );
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.name}:`, error);
    }
  }
  
  return userIds;
}

async function seedVerifications(userIds: string[]): Promise<string[]> {
  console.log('🔍 Seeding verification table...');
  const verificationIds: string[] = [];

  for (let i = 0; i < seedData.verifications.length; i++) {
    try {
      const verificationId = randomUUID();
      const verification = seedData.verifications[i];
      const userId = userIds[i % userIds.length];
      
      verificationIds.push(verificationId);
      
      await executeRawQuery(
        'INSERT INTO verification (id, user_id, original_text, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [verificationId, userId, verification.originalText, verification.status]
      );
      console.log(`✅ Created verification (${verification.status}): ${verification.originalText.substring(0, 60)}...`);
    } catch (error) {
      console.error(`❌ Error creating verification:`, error);
    }
  }
  
  return verificationIds;
}

async function seedCriticalQuestions(verificationIds: string[]): Promise<void> {
  console.log('❓ Seeding critical_questions table...');

  if (!verificationIds || verificationIds.length === 0) {
    console.log('⚠️ No verification IDs provided, skipping critical questions');
    return;
  }

  const questionsPerVerification = [2, 2, 2, 2];
  let questionIndex = 0;
  
  for (let i = 0; i < questionsPerVerification.length && i < verificationIds.length; i++) {
    const numQuestions = questionsPerVerification[i];
    const verificationId = verificationIds[i];
    
    for (let j = 0; j < numQuestions && questionIndex < seedData.criticalQuestions.length; j++) {
      try {
        const questionId = randomUUID();
        const question = seedData.criticalQuestions[questionIndex];
        
        await executeRawQuery(
          'INSERT INTO critical_questions (id, verification_id, question_text, original_question, is_edited, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [questionId, verificationId, question.questionText, question.originalQuestion, false, j]
        );
        console.log(`✅ Created critical question: ${question.questionText.substring(0, 60)}...`);
        questionIndex++;
      } catch (error) {
        console.error(`❌ Error creating critical question:`, error);
      }
    }
  }
}

async function seedSources(verificationIds: string[]): Promise<void> {
  console.log('📄 Seeding source table...');

  if (!verificationIds || verificationIds.length === 0) {
    console.log('⚠️ No verification IDs provided, skipping sources');
    return;
  }

  for (let i = 0; i < seedData.sources.length && i < verificationIds.length; i++) {
    try {
      const sourceId = randomUUID();
      const source = seedData.sources[i];
      const verificationId = verificationIds[i];
      
      await executeRawQuery(
        'INSERT INTO source (id, verification_id, url, title, summary, domain, is_selected, scraping_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [sourceId, verificationId, source.url, source.title, source.summary, source.domain, source.isSelected]
      );
      console.log(`✅ Created source: ${source.title}`);
    } catch (error) {
      console.error(`❌ Error creating source:`, error);
    }
  }
}

async function seedFinalResults(verificationIds: string[]): Promise<void> {
  console.log('📋 Seeding final_results table...');

  if (!verificationIds || verificationIds.length === 0) {
    console.log('⚠️ No verification IDs provided, skipping final results');
    return;
  }

  // Only create final results for completed verifications (first 2)
  const completedVerifications = verificationIds.slice(0, 2);

  if (completedVerifications.length === 0) {
    console.log('⚠️ No completed verifications available for final results');
    return;
  }

  const finalResults = [
    {
      finalText: 'VERDICT: FALSE. The scientific consensus overwhelmingly confirms that climate change is primarily caused by human activities, not natural phenomena. While Earth has experienced natural climate cycles throughout history, the current rapid warming is directly linked to increased greenhouse gas emissions from fossil fuel burning, deforestation, and industrial processes since the Industrial Revolution.',
      labelsJson: JSON.stringify(['False', 'Climate Misinformation']),
      citationsJson: JSON.stringify([
        { 
          id: '1',
          title: 'IPCC Sixth Assessment Report',
          url: 'https://www.ipcc.ch/report/ar6/wg1/',
          relevantQuote: 'It is unequivocal that human influence has warmed the planet.'
        },
        {
          id: '2', 
          title: 'NASA Climate Change Evidence',
          url: 'https://climate.nasa.gov/evidence/',
          relevantQuote: 'Multiple studies show 97% of climate scientists agree current warming is primarily human-caused.'
        }
      ]),
      answersJson: JSON.stringify([
        { 
          questionId: 'q1',
          question: 'What does the scientific consensus say about the primary causes of climate change?',
          answer: '97% of actively publishing climate scientists agree that human activities are the primary cause of recent climate change.'
        },
        {
          questionId: 'q2',
          question: 'What evidence exists for human activities contributing to climate change versus natural cycles?',
          answer: 'Multiple lines of evidence including isotopic analysis of atmospheric CO2, correlation with industrial emissions, and climate models that only match observed warming when human factors are included.'
        }
      ])
    },
    {
      finalText: 'VERDICT: FALSE. COVID-19 mRNA vaccines do not alter human DNA or cause infertility. mRNA vaccines work by providing instructions to cells to produce a protein that triggers an immune response, but the mRNA never enters the cell nucleus where DNA is stored. Extensive clinical trials and real-world data show no evidence of fertility effects, and millions of pregnancies have occurred safely after vaccination.',
      labelsJson: JSON.stringify(['False', 'Medical Misinformation', 'Dangerous']),
      citationsJson: JSON.stringify([
        {
          id: '3',
          title: 'CDC COVID-19 Vaccine Facts',
          url: 'https://www.cdc.gov/coronavirus/2019-ncov/vaccines/facts.html',
          relevantQuote: 'mRNA vaccines do not contain the live virus and cannot change or interact with your DNA in any way.'
        },
        {
          id: '4',
          title: 'NEJM Vaccine Research',
          url: 'https://www.nejm.org/covid-vaccine',
          relevantQuote: 'Clinical trials showed no adverse effects on fertility, and pregnancy outcomes remain normal post-vaccination.'
        }
      ]),
      answersJson: JSON.stringify([
        {
          questionId: 'q3',
          question: 'How do mRNA vaccines work at the cellular level?',
          answer: 'mRNA vaccines deliver genetic instructions to cells to produce the spike protein, which triggers immune response. The mRNA is degraded quickly and never enters the nucleus containing DNA.'
        },
        {
          questionId: 'q4', 
          question: 'What peer-reviewed studies exist on COVID-19 vaccine effects on fertility and DNA?',
          answer: 'Multiple large-scale studies including clinical trials with 44,000+ participants show no fertility effects. No mechanism exists for mRNA to alter DNA.'
        }
      ])
    }
  ];

  for (let i = 0; i < Math.min(completedVerifications.length, finalResults.length); i++) {
    try {
      const resultId = randomUUID();
      const verificationId = completedVerifications[i];
      const result = finalResults[i];
      
      await executeRawQuery(
        'INSERT INTO final_results (id, verification_id, final_text, labels_json, citations_json, answers_json, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [resultId, verificationId, result.finalText, result.labelsJson, result.citationsJson, result.answersJson]
      );
      console.log(`✅ Created final result for verification ${i + 1}`);
    } catch (error) {
      console.error(`❌ Error creating final result:`, error);
    }
  }
}

async function seedProcessLogs(verificationIds: string[]): Promise<void> {
  console.log('📝 Seeding process_logs table...');

  if (!verificationIds || verificationIds.length === 0) {
    console.log('⚠️ No verification IDs provided, skipping process logs');
    return;
  }

  const processSteps = [
    { step: 'analyze_claim', status: 'completed' as const },
    { step: 'generate_questions', status: 'completed' as const },
    { step: 'search_sources', status: 'completed' as const },
    { step: 'evaluate_sources', status: 'completed' as const },
    { step: 'generate_summary', status: 'completed' as const },
  ];

  const minVerification = 3;

  for (let i = 0; i < Math.min(minVerification, verificationIds.length); i++) {
    const verificationId = verificationIds[i];
    
    for (const processStep of processSteps) {
      try {
        const logId = randomUUID();
        
        await executeRawQuery(
          'INSERT INTO process_logs (id, verification_id, step, status, error_message, api_response, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [
            logId, 
            verificationId, 
            processStep.step, 
            processStep.status, 
            null, 
            JSON.stringify({ 
              timestamp: new Date().toISOString(),
              processingTime: Math.floor(Math.random() * 5000) + 1000,
              success: true 
            })
          ]
        );
      } catch (error) {
        console.error(`❌ Error creating process log:`, error);
      }
    }
    console.log(`✅ Created process logs for verification ${i + 1}`);
  }
}

async function verifySeeding(): Promise<void> {
  console.log('🔍 Verifying seeded data...');

  try {
    const userCount = await executeRawQuery('SELECT COUNT(*) as count FROM user');
    const verificationCount = await executeRawQuery('SELECT COUNT(*) as count FROM verification');
    const questionCount = await executeRawQuery('SELECT COUNT(*) as count FROM critical_questions');
    const sourceCount = await executeRawQuery('SELECT COUNT(*) as count FROM source');
    const resultCount = await executeRawQuery('SELECT COUNT(*) as count FROM final_results');
    const logCount = await executeRawQuery('SELECT COUNT(*) as count FROM process_logs');

    console.log(`📊 Data verification:`);
    console.log(`   Users: ${(userCount[0] as any).count}`);
    console.log(`   Verifications: ${(verificationCount[0] as any).count}`);
    console.log(`   Critical Questions: ${(questionCount[0] as any).count}`);
    console.log(`   Sources: ${(sourceCount[0] as any).count}`);
    console.log(`   Final Results: ${(resultCount[0] as any).count}`);
    console.log(`   Process Logs: ${(logCount[0] as any).count}`);

    // Show status distribution
    const statusCount = await executeRawQuery('SELECT status, COUNT(*) as count FROM verification GROUP BY status');
    console.log(`📈 Verification Status Distribution:`);
    for (const row of statusCount) {
      console.log(`   ${(row as any).status}: ${(row as any).count}`);
    }
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

async function main(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding process...');
    console.log('📋 Using existing table structure - no table creation');

    // Initialize database connection
    initDB();

    // Use transaction for the entire seeding process
    await withTransaction(async () => {
      await clearDatabase();
      const userIds = await seedUsers();
      const verificationIds = await seedVerifications(userIds);
      await seedCriticalQuestions(verificationIds);
      await seedSources(verificationIds);
      await seedFinalResults(verificationIds);
      await seedProcessLogs(verificationIds);
    });

    await verifySeeding();

    console.log('✅ Database seeding completed successfully!');
    console.log('🎯 Ready for development and status testing!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

export { main as seedDatabase, seedData };